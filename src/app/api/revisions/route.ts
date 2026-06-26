import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { revisionLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { getTodaysRevisions, getOverdueRevisions, completeRevision } from "@/lib/revision-engine";

const RevisionSchema = z.object({
  revisionId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const planParam = searchParams.get("planId") || searchParams.get("planSlug");

    let resolvedPlanId: string | null = null;
    if (planParam) {
      const plan = await db.plan.findFirst({
        where: { OR: [{ id: planParam }, { slug: planParam }], userId: user.id, deletedAt: null },
        select: { id: true },
      });
      resolvedPlanId = plan?.id ?? null;
    }

    const [todayRevisions, overdueRevisions] = await Promise.all([
      getTodaysRevisions(user.id),
      getOverdueRevisions(user.id),
    ]);

    let filteredToday = todayRevisions;
    let filteredOverdue = overdueRevisions;

    if (resolvedPlanId) {
      filteredToday = todayRevisions.filter((r) => r.planProblem.planId === resolvedPlanId);
      filteredOverdue = overdueRevisions.filter((r) => r.planProblem.planId === resolvedPlanId);
    }

    return NextResponse.json({ today: filteredToday, overdue: filteredOverdue });
  } catch (error) {
    logError(error, { route: "GET /api/revisions" });
    return NextResponse.json({ error: "Failed to fetch revisions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blocked, response } = await checkRateLimit(revisionLimiter, `user_${clerkId}`);
    if (blocked) {
      return NextResponse.json(
        { error: "Too many requests", message: JSON.parse(await response!.text()).message },
        { status: 429 }
      );
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = RevisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { revisionId } = parsed.data;

    const revision = await db.revision.findFirst({
      where: { id: revisionId, userId: user.id },
    });

    if (!revision) {
      return NextResponse.json({ error: "Revision not found" }, { status: 404 });
    }

    const completed = await completeRevision(revisionId);

    const planProblem = await db.planProblem.findUnique({
      where: { id: completed.planProblemId },
    });

    if (planProblem) {
      await db.activityLog.create({
        data: {
          userId: user.id,
          planId: planProblem.planId,
          action: "revision_completed",
          details: { revisionId, revisionNumber: completed.revisionNumber },
        },
      });
    }

    return NextResponse.json({ revision: completed });
  } catch (error) {
    logError(error, { route: "POST /api/revisions" });
    return NextResponse.json({ error: "Failed to complete revision" }, { status: 500 });
  }
}
