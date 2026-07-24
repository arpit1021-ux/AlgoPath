import { db } from "./db";
import type { PlanWizardInput, ExperienceLevel, DifficultyPreference } from "./types";

interface RoadmapProblem {
  problemId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  acceptanceRate: number;
  likes: number;
  tags: string[];
  companies: string[];
  estimatedMinutes: number;
  weekNumber: number;
  order: number;
}

interface Roadmap {
  weeks: {
    weekNumber: number;
    problems: RoadmapProblem[];
    totalEstimatedMinutes: number;
  }[];
  totalProblems: number;
  totalEstimatedMinutes: number;
}

// Time per difficulty per experience level (minutes)
const ESTIMATED_TIME: Record<string, Record<string, number>> = {
  BEGINNER:     { EASY: 35, MEDIUM: 55, HARD: 80 },
  INTERMEDIATE: { EASY: 25, MEDIUM: 40, HARD: 60 },
  EXPERT:       { EASY: 15, MEDIUM: 28, HARD: 45 },
};

// Target difficulty distribution per difficulty preference
const TARGET_DISTRIBUTION: Record<DifficultyPreference, { EASY: number; MEDIUM: number; HARD: number }> = {
  VERY_EASY: { EASY: 0.65, MEDIUM: 0.30, HARD: 0.05 },
  EASY:      { EASY: 0.50, MEDIUM: 0.40, HARD: 0.10 },
  MEDIUM:    { EASY: 0.20, MEDIUM: 0.55, HARD: 0.25 },
  HARD:      { EASY: 0.10, MEDIUM: 0.30, HARD: 0.60 },
  VERY_HARD: { EASY: 0.05, MEDIUM: 0.20, HARD: 0.75 },
};

function getDifficultyDistribution(
  difficultyPreference: DifficultyPreference
): { EASY: number; MEDIUM: number; HARD: number } {
  return TARGET_DISTRIBUTION[difficultyPreference] ?? TARGET_DISTRIBUTION.MEDIUM;
}

function balanceTopics<T extends { tags: string[] }>(
  problems: T[],
  maxConsecutive: number = 3
): T[] {
  const result: T[] = [];
  const remaining = [...problems];
  let consecutiveCount = 0;
  let lastTopic = "";

  while (remaining.length > 0) {
    let nextIndex = 0;

    if (consecutiveCount >= maxConsecutive && remaining.length > 1) {
      for (let i = 1; i < remaining.length; i++) {
        const primaryTag = remaining[i].tags[0] || "";
        if (primaryTag !== lastTopic) {
          nextIndex = i;
          break;
        }
      }
    }

    const next = remaining.splice(nextIndex, 1)[0];
    const primaryTag = next.tags[0] || "";

    if (primaryTag === lastTopic) {
      consecutiveCount++;
    } else {
      consecutiveCount = 1;
      lastTopic = primaryTag;
    }

    result.push(next);
  }

  return result;
}

export async function generateRoadmap(
  planId: string,
  input: PlanWizardInput
): Promise<Roadmap> {
  const totalWeeks = input.timelineWeeks;
  const weeklyMinutes = input.weeklyHours * 60;
  const expLevel = input.experienceLevel as ExperienceLevel;
  const diffPref = (input.difficultyPreference || "MEDIUM") as DifficultyPreference;
  const timeMap = ESTIMATED_TIME[expLevel] ?? ESTIMATED_TIME["INTERMEDIATE"];

  const topicFilter =
    input.topicMode === "ALL" || !input.selectedTopics?.length
      ? undefined
      : { some: { name: { in: input.selectedTopics } } };

  // Estimate how many problems we need: ~2 per hour of study
  const estimatedNeeded = Math.min(1000, totalWeeks * weeklyMinutes * 2);

  // Single efficient query — no nested company includes
  const allProblems = await db.problem.findMany({
    where: {
      isPremium: false,
      ...(topicFilter ? { tags: topicFilter } : {}),
    },
    take: estimatedNeeded,
    orderBy: { likes: "desc" },
    select: {
      id: true,
      title: true,
      titleSlug: true,
      difficulty: true,
      acceptanceRate: true,
      likes: true,
      tags: { select: { name: true } },
      companies: {
        select: { companyId: true },
      },
    },
  });

  // Get company-prioritized problem IDs with ordered priority
  const companyProblemScores = new Map<string, number>();
  if (input.targetCompanies.length > 0) {
    // Single query: fetch frequency + company slug together
    const companyRows = await db.companyProblemFrequency.findMany({
      where: { company: { slug: { in: input.targetCompanies } } },
      select: {
        problemId: true,
        frequency: true,
        company: { select: { slug: true } },
      },
      orderBy: { frequency: "desc" },
    });

    const companySlugToPriority = new Map<string, number>();
    input.targetCompanies.forEach((slug, idx) => {
      companySlugToPriority.set(slug, idx);
    });

    for (const row of companyRows) {
      const priority = companySlugToPriority.get(row.company.slug) ?? 99;
      const baseScore = 100 - priority * 15;
      const existing = companyProblemScores.get(row.problemId) ?? 0;
      companyProblemScores.set(row.problemId, Math.max(existing, baseScore));
    }
  }

  // Score and sort problems
  const scoredProblems = allProblems
    .map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.name),
      score:
        (companyProblemScores.get(p.id) ?? 0) +
        p.likes * 0.01 +
        (100 - p.acceptanceRate) * 0.1,
    }))
    .sort((a, b) => b.score - a.score);

  // Single-pass difficulty bucketing
  const byDiff: Record<string, typeof scoredProblems> = { EASY: [], MEDIUM: [], HARD: [] };
  for (const p of scoredProblems) {
    const bucket = byDiff[p.difficulty];
    if (bucket) bucket.push(p);
  }
  const usedIdx: Record<string, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };

  const roadmap: Roadmap = {
    weeks: [],
    totalProblems: 0,
    totalEstimatedMinutes: 0,
  };

  for (let week = 1; week <= totalWeeks; week++) {
    const dist = getDifficultyDistribution(diffPref);
    const weekProblems: RoadmapProblem[] = [];
    let remainingMinutes = weeklyMinutes;

    // FIX: calculate per-difficulty budgets from actual weekly minutes
    const budgets: Record<string, number> = {
      EASY:   Math.floor(weeklyMinutes * dist.EASY),
      MEDIUM: Math.floor(weeklyMinutes * dist.MEDIUM),
      HARD:   Math.floor(weeklyMinutes * dist.HARD),
    };

    for (const diff of ["EASY", "MEDIUM", "HARD"] as const) {
      const timePerProblem = timeMap[diff];
      let diffBudget = budgets[diff];
      const pool = byDiff[diff];

      while (
        diffBudget >= timePerProblem &&
        remainingMinutes >= timePerProblem &&
        usedIdx[diff] < pool.length
      ) {
        const problem = pool[usedIdx[diff]];
        usedIdx[diff]++;

        weekProblems.push({
          problemId: problem.id,
          title: problem.title,
          titleSlug: problem.titleSlug,
          difficulty: problem.difficulty,
          acceptanceRate: problem.acceptanceRate,
          likes: problem.likes,
          tags: problem.tags,
          companies: [],
          estimatedMinutes: timePerProblem,
          weekNumber: week,
          order: weekProblems.length + 1,
        });

        diffBudget -= timePerProblem;
        remainingMinutes -= timePerProblem;
      }
    }

    const diffOrder: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };
    weekProblems.sort((a, b) => (diffOrder[a.difficulty] ?? 1) - (diffOrder[b.difficulty] ?? 1));
    const balanced = balanceTopics(weekProblems);
    balanced.forEach((p, i) => { p.order = i + 1; });

    const totalEstimated = balanced.reduce((s, p) => s + p.estimatedMinutes, 0);

    roadmap.weeks.push({
      weekNumber: week,
      problems: balanced,
      totalEstimatedMinutes: totalEstimated,
    });

    roadmap.totalProblems += balanced.length;
    roadmap.totalEstimatedMinutes += totalEstimated;
  }

  const allPlanProblems = roadmap.weeks.flatMap((week) =>
    week.problems.map((p) => ({
      planId,
      problemId: p.problemId,
      weekNumber: p.weekNumber,
      order: p.order,
      status: "TODO" as const,
    }))
  );

  // Batch insert in a transaction
  await db.$transaction([
    db.planProblem.deleteMany({ where: { planId } }),
    db.planProblem.createMany({ data: allPlanProblems }),
  ]);

  return roadmap;
}