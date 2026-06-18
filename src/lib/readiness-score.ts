import { db } from "./db";
import type { ReadinessScore } from "./types";

export async function calculateReadinessScore(
  userId: string,
  planId: string
): Promise<ReadinessScore> {
  const plan = await db.plan.findUnique({
    where: { id: planId },
    include: {
      targetCompanies: { include: { company: true } },
      selectedTags: { include: { tag: true } },
      problems: {
        include: {
          problem: { include: { tags: true, companies: { include: { company: true } } } },
        },
      },
    },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  const allProblems = plan.problems;
  const solvedProblems = allProblems.filter((p) => p.status === "SOLVED");
  const totalProblems = allProblems.length;

  if (totalProblems === 0) {
    return {
      overall: 0,
      topicCoverage: 0,
      difficultyCoverage: 0,
      revisionCompletion: 0,
      companyCoverage: 0,
      consistency: 0,
      companyScores: {},
    };
  }

  const selectedTopics = plan.selectedTags.map((pt) => pt.tag.name);
  const topicProgress: Record<string, { total: number; solved: number }> = {};
  for (const topic of selectedTopics) {
    topicProgress[topic] = { total: 0, solved: 0 };
  }

  for (const pp of allProblems) {
    for (const tag of pp.problem.tags) {
      const topicName = tag.name;
      if (topicProgress[topicName]) {
        topicProgress[topicName].total++;
        if (pp.status === "SOLVED") {
          topicProgress[topicName].solved++;
        }
      }
    }
  }

  let topicCoverageScore = 0;
  const topicCount = Object.keys(topicProgress).length;
  if (topicCount > 0) {
    const topicRates = Object.values(topicProgress).map((t) =>
      t.total > 0 ? t.solved / t.total : 0
    );
    topicCoverageScore = (topicRates.reduce((a, b) => a + b, 0) / topicCount) * 100;
  }

  const difficultyProgress: Record<string, { total: number; solved: number }> = {
    EASY: { total: 0, solved: 0 },
    MEDIUM: { total: 0, solved: 0 },
    HARD: { total: 0, solved: 0 },
  };

  for (const pp of allProblems) {
    const diff = pp.problem.difficulty;
    if (difficultyProgress[diff]) {
      difficultyProgress[diff].total++;
      if (pp.status === "SOLVED") {
        difficultyProgress[diff].solved++;
      }
    }
  }

  const difficultyRates = Object.values(difficultyProgress).map((d) =>
    d.total > 0 ? d.solved / d.total : 0
  );
  const difficultyCoverage = (difficultyRates.reduce((a, b) => a + b, 0) / 3) * 100;

  const revisions = await db.revision.findMany({
    where: { userId, planProblem: { planId } },
  });

  const totalRevisions = revisions.length;
  const completedRevisions = revisions.filter((r) => r.status === "COMPLETED").length;
  const revisionCompletion = totalRevisions > 0 ? (completedRevisions / totalRevisions) * 100 : 0;

  const companyScores: Record<string, number> = {};
  for (const pc of plan.targetCompanies) {
    const companyProblems = allProblems.filter((pp) =>
      pp.problem.companies.some((c) => c.companyId === pc.companyId)
    );
    const companySolved = companyProblems.filter((pp) => pp.status === "SOLVED").length;
    companyScores[pc.company.name] =
      companyProblems.length > 0 ? (companySolved / companyProblems.length) * 100 : 0;
  }

  const avgCompanyScore =
    Object.values(companyScores).length > 0
      ? Object.values(companyScores).reduce((a, b) => a + b, 0) / Object.values(companyScores).length
      : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivity = await db.activityLog.findMany({
    where: {
      userId,
      planId,
      action: "problem_solved",
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const uniqueDays = new Set(
    recentActivity.map((a) => a.createdAt.toISOString().split("T")[0])
  ).size;
  const consistency = Math.min(100, (uniqueDays / 30) * 100);

  const overall =
    topicCoverageScore * 0.3 +
    difficultyCoverage * 0.2 +
    revisionCompletion * 0.2 +
    avgCompanyScore * 0.2 +
    consistency * 0.1;

  return {
    overall: Math.round(overall),
    topicCoverage: Math.round(topicCoverageScore),
    difficultyCoverage: Math.round(difficultyCoverage),
    revisionCompletion: Math.round(revisionCompletion),
    companyCoverage: Math.round(avgCompanyScore),
    consistency: Math.round(consistency),
    companyScores: Object.fromEntries(
      Object.entries(companyScores).map(([k, v]) => [k, Math.round(v)])
    ),
  };
}

export async function detectWeakTopics(
  userId: string,
  planId: string
): Promise<Array<{ topic: string; solved: number; total: number; accuracy: number }>> {
  const plan = await db.plan.findUnique({
    where: { id: planId },
    include: {
      selectedTags: { include: { tag: true } },
      problems: {
        include: {
          problem: { include: { tags: true, companies: { include: { company: true } } } },
        },
      },
    },
  });

  if (!plan) return [];

  const topicStats: Record<string, { solved: number; total: number; skipped: number }> = {};

  for (const pp of plan.problems) {
    for (const tag of pp.problem.tags) {
      const name = tag.name;
      if (!topicStats[name]) {
        topicStats[name] = { solved: 0, total: 0, skipped: 0 };
      }
      topicStats[name].total++;
      if (pp.status === "SOLVED") topicStats[name].solved++;
      if (pp.status === "SKIPPED") topicStats[name].skipped++;
    }
  }

  return Object.entries(topicStats)
    .map(([topic, stats]) => ({
      topic,
      solved: stats.solved,
      total: stats.total,
      accuracy: stats.total > 0 ? (stats.solved / (stats.total - stats.skipped || 1)) * 100 : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}
