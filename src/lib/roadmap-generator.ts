import { db } from "./db";
import type { PlanWizardInput, ExperienceLevel } from "./types";

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

const DIFFICULTY_DISTRIBUTION: Record<
  ExperienceLevel,
  { EASY: number; MEDIUM: number; HARD: number }
> = {
  BEGINNER: {
    EASY: 0.5,
    MEDIUM: 0.35,
    HARD: 0.15,
  },
  INTERMEDIATE: {
    EASY: 0.25,
    MEDIUM: 0.45,
    HARD: 0.3,
  },
  EXPERT: {
    EASY: 0.1,
    MEDIUM: 0.3,
    HARD: 0.6,
  },
};

function getDifficultyForWeek(
  weekNumber: number,
  totalWeeks: number,
  experienceLevel: ExperienceLevel
): { EASY: number; MEDIUM: number; HARD: number } {
  const progress = weekNumber / totalWeeks;
  const base = DIFFICULTY_DISTRIBUTION[experienceLevel];

  if (progress <= 0.25) {
    return {
      EASY:   Math.min(1, base.EASY + 0.15),
      MEDIUM: Math.max(0, base.MEDIUM - 0.1),
      HARD:   Math.max(0, base.HARD - 0.05),
    };
  }
  if (progress <= 0.6) {
    return base;
  }
  // Ramp up hard in final weeks
  return {
    EASY:   Math.max(0.05, base.EASY - 0.1),
    MEDIUM: base.MEDIUM,
    HARD:   Math.min(0.9,  base.HARD + 0.1),
  };
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
  // FIX: weeklyMinutes correctly derived from input
  const weeklyMinutes = input.weeklyHours * 60;
  const expLevel = input.experienceLevel as ExperienceLevel;
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

  // Get company-prioritized problem IDs
  let companyProblemIds = new Set<string>();
  if (input.targetCompanies.length > 0) {
    const companyRows = await db.companyProblemFrequency.findMany({
      where: { company: { slug: { in: input.targetCompanies } } },
      select: { problemId: true, frequency: true },
      orderBy: { frequency: "desc" },
    });
    companyProblemIds = new Set(companyRows.map((r) => r.problemId));
  }

  // Score and sort problems
  const scoredProblems = allProblems
    .map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.name),
      score:
        (companyProblemIds.has(p.id) ? 100 : 0) +
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
    const dist = getDifficultyForWeek(week, totalWeeks, expLevel);
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

  await db.planProblem.createMany({ data: allPlanProblems });

  return roadmap;
}