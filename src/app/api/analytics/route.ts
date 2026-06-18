import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  calculateReadinessScore,
  detectWeakTopics,
} from "@/lib/readiness-score";

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
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json(
        { error: "planId required" },
        { status: 400 }
      );
    }

    const plan = await db.plan.findFirst({
      where: { id: planId, userId: user.id },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    const [readiness, weakTopics] = await Promise.all([
      calculateReadinessScore(user.id, planId),
      detectWeakTopics(user.id, planId),
    ]);

    const planWithProblems = await db.plan.findUnique({
      where: { id: planId },
      include: {
        problems: {
          include: { problem: true },
        },
      },
    });

    const difficultyCompletion: Record<
      string,
      { total: number; solved: number }
    > = {
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
      where: {
        userId: user.id,
        planId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    return NextResponse.json({
      readiness,
      weakTopics,
      difficultyCompletion,
      weeklyActivity,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
