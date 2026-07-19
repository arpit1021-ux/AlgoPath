import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { logError } from "@/lib/logger";

const BatchUpdateSchema = z.object({
  planProblemIds: z.array(z.string()).min(1).max(100),
  status: z.enum(["TODO", "SOLVED", "ATTEMPTED", "SKIPPED"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { planId } = await params;
    const body = await request.json();
    const parsed = BatchUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { planProblemIds, status } = parsed.data;

    const validProblems = await db.planProblem.findMany({
      where: {
        id: { in: planProblemIds },
        plan: { id: planId, userId: user.id },
      },
      select: { id: true },
    });

    const validIds = validProblems.map((p) => p.id);

    if (validIds.length === 0) {
      return NextResponse.json({ error: "No valid problems found" }, { status: 404 });
    }

    await db.planProblem.updateMany({
      where: { id: { in: validIds } },
      data: {
        status,
        completedAt: status === "SOLVED" ? new Date() : null,
      },
    });

    if (status === "SOLVED") {
      const existingRevisions = await db.revision.findMany({
        where: { planProblemId: { in: validIds }, userId: user.id },
        select: { planProblemId: true },
      });
      const alreadyHasRevision = new Set(existingRevisions.map((r) => r.planProblemId));
      const needsRevision = validIds.filter((id) => !alreadyHasRevision.has(id));

      if (needsRevision.length > 0) {
        const intervals = [2, 7, 21, 45];
        const now = new Date();
        const revisionData = needsRevision.flatMap((planProblemId) =>
          intervals.map((days, index) => ({
            planProblemId,
            userId: user.id,
            revisionNumber: index + 1,
            scheduledDate: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
            status: "PENDING" as const,
          }))
        );
        await db.revision.createMany({ data: revisionData });
      }

      await db.activityLog.create({
        data: {
          userId: user.id,
          planId,
          action: "bulk_solved",
          details: { count: validIds.length },
        },
      });
    }

    return NextResponse.json({ updated: validIds.length });
  } catch (error) {
    logError(error, { route: "POST /api/plans/[planId]/problems/batch" });
    return NextResponse.json({ error: "Failed to update problems" }, { status: 500 });
  }
}
