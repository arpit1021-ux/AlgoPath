import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { analyticsLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import { calculateReadinessScore, detectWeakTopics } from "@/lib/readiness-score";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blocked, response } = await checkRateLimit(analyticsLimiter, `user_${clerkId}`);
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

    const { searchParams } = new URL(request.url);
    const planParam = searchParams.get("planId") || searchParams.get("planSlug");
    if (!planParam) {
      return NextResponse.json({ error: "planId required" }, { status: 400 });
    }

    const plan = await db.plan.findFirst({
      where: { OR: [{ id: planParam }, { slug: planParam }], userId: user.id, deletedAt: null },
    });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    const planId = plan.id;

    const [readiness, weakTopics, planWithProblems] = await Promise.all([
      calculateReadinessScore(user.id, planId),
      detectWeakTopics(user.id, planId),
      db.plan.findUnique({
        where: { id: planId },
        include: { problems: { include: { problem: true } } },
      }),
    ]);

    const difficultyCompletion: Record<string, { total: number; solved: number }> = {
      EASY: { total: 0, solved: 0 },
      MEDIUM: { total: 0, solved: 0 },
      HARD: { total: 0, solved: 0 },
    };

    if (planWithProblems) {
      for (const pp of planWithProblems.problems) {
        const diff = pp.problem.difficulty;
        if (difficultyCompletion[diff]) {
          difficultyCompletion[diff].total++;
          if (pp.status === "SOLVED") difficultyCompletion[diff].solved++;
        }
      }
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const weeklyActivity = await db.activityLog.count({
      where: { userId: user.id, planId, createdAt: { gte: thirtyDaysAgo } },
    });

    return NextResponse.json({
      readiness,
      weakTopics,
      difficultyCompletion,
      weeklyActivity,
    }, {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    logError(error, { route: "GET /api/analytics" });
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
