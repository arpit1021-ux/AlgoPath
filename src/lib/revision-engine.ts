import { db } from "./db";
import { addDays } from "date-fns";

const REVISION_INTERVALS = [2, 7, 21, 45];

export async function createRevisionsForProblem(
  planProblemId: string,
  userId: string,
  solvedAt: Date = new Date()
): Promise<void> {
  const existingRevisions = await db.revision.findMany({
    where: { planProblemId, userId },
  });

  if (existingRevisions.length > 0) {
    return;
  }

  const revisionData = REVISION_INTERVALS.map((days, index) => ({
    planProblemId,
    userId,
    revisionNumber: index + 1,
    scheduledDate: addDays(solvedAt, days),
    status: "PENDING" as const,
  }));

  await db.revision.createMany({ data: revisionData });
}

export async function getTodaysRevisions(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return db.revision.findMany({
    where: {
      userId,
      status: "PENDING",
      scheduledDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      planProblem: {
        include: {
          problem: true,
          plan: true,
        },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });
}

export async function getOverdueRevisions(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db.revision.findMany({
    where: {
      userId,
      status: "PENDING",
      scheduledDate: {
        lt: today,
      },
    },
    include: {
      planProblem: {
        include: {
          problem: true,
          plan: true,
        },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });
}

export async function completeRevision(revisionId: string) {
  return db.revision.update({
    where: { id: revisionId },
    data: {
      status: "COMPLETED",
      completedDate: new Date(),
    },
  });
}

export async function getRevisionStats(userId: string, planId?: string) {
  const where: Record<string, unknown> = { userId };
  if (planId) {
    where.planProblem = { planId };
  }

  const [total, completed, missed, pending] = await Promise.all([
    db.revision.count({ where }),
    db.revision.count({ where: { ...where, status: "COMPLETED" } }),
    db.revision.count({ where: { ...where, status: "MISSED" } }),
    db.revision.count({ where: { ...where, status: "PENDING" } }),
  ]);

  return {
    total,
    completed,
    missed,
    pending,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
  };
}
