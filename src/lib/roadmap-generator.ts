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

  // Single efficient query — no nested company includes
  const allProblems = await db.problem.findMany({
    where: {
      isPremium: false,
      ...(topicFilter ? { tags: topicFilter } : {}),
    },
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
  // First selected company gets highest score, second gets less, etc.
  const companyProblemScores = new Map<string, number>();
  if (input.targetCompanies.length > 0) {
    const companyRows = await db.companyProblemFrequency.findMany({
      where: { company: { slug: { in: input.targetCompanies } } },
      select: { problemId: true, companyId: true, frequency: true },
      orderBy: { frequency: "desc" },
    });

    for (const row of companyRows) {
      const companyIdx = input.targetCompanies.indexOf(
        // Need to look up slug from companyId — but we can use the set approach
        // Actually we have the companyId, need to map back
        row.companyId
      );
      // Since companyRows don't have slug, we'll do a second pass
    }

    // Build a map: companyId → priority index (0 = highest)
    const companySlugToPriority = new Map<string, number>();
    input.targetCompanies.forEach((slug, idx) => {
      companySlugToPriority.set(slug, idx);
    });

    // Fetch company slugs for the frequency records
    const companyIds = [...new Set(companyRows.map((r) => r.companyId))];
    const companySlugRows = await db.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, slug: true },
    });
    const companyIdToSlug = new Map(companySlugRows.map((c) => [c.id, c.slug]));

    for (const row of companyRows) {
      const slug = companyIdToSlug.get(row.companyId);
      const priority = slug ? companySlugToPriority.get(slug) ?? 99 : 99;
      const baseScore = 100 - priority * 15; // 1st=100, 2nd=85, 3rd=70, etc.
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

  // Pre-bucket by difficulty for O(1) lookup
  const byDiff: Record<string, typeof scoredProblems> = {
    EASY:   scoredProblems.filter((p) => p.difficulty === "EASY"),
    MEDIUM: scoredProblems.filter((p) => p.difficulty === "MEDIUM"),
    HARD:   scoredProblems.filter((p) => p.difficulty === "HARD"),
  };
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

    // Redistribute leftover minutes to other available pools
    if (remainingMinutes > 0) {
      for (const diff of ["MEDIUM", "EASY", "HARD"] as const) {
        const timePerProblem = timeMap[diff];
        const pool = byDiff[diff];

        while (
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

          remainingMinutes -= timePerProblem;
        }
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

  // Batch insert — much faster than one-by-one creates
  await db.planProblem.deleteMany({ where: { planId } });

  const allPlanProblems = roadmap.weeks.flatMap((week) =>
    week.problems.map((p) => ({
      planId,
      problemId: p.problemId,
      weekNumber: p.weekNumber,
      order: p.order,
      status: "TODO" as const,
    }))
  );

  const BATCH_SIZE = 100;
  for (let i = 0; i < allPlanProblems.length; i += BATCH_SIZE) {
    await db.planProblem.createMany({ data: allPlanProblems.slice(i, i + BATCH_SIZE) });
  }

  return roadmap;
}