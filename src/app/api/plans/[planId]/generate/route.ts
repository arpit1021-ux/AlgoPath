import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateRoadmap } from "@/lib/roadmap-generator";
import { logError } from "@/lib/logger";

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

    const plan = await db.plan.findFirst({
      where: { id: planId, userId: user.id, deletedAt: null },
      include: {
        targetCompanies: { include: { company: true } },
        selectedTags: { include: { tag: true } },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.status !== "GENERATING") {
      return NextResponse.json(
        { error: "Plan already generated" },
        { status: 400 }
      );
    }

    await generateRoadmap(plan.id, {
      name: plan.name,
      description: plan.description ?? undefined,
      experienceLevel: plan.experienceLevel as "BEGINNER" | "INTERMEDIATE" | "EXPERT",
      timelineWeeks: plan.timelineWeeks,
      weeklyHours: plan.weeklyHours,
      targetCompanies: plan.targetCompanies.map((tc) => tc.company.slug),
      topicMode: plan.selectedTags.length > 0 ? "RECOMMENDED" : "ALL",
      selectedTopics: plan.selectedTags.map((st) => st.tag.name),
      difficultyPreference: plan.difficultyPreference,
    });

    await db.plan.update({
      where: { id: planId },
      data: { status: "ACTIVE" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, { route: "POST /api/plans/[planId]/generate" });

    try {
      const { planId } = await params;
      await db.plan.update({
        where: { id: planId },
        data: { status: "FAILED" },
      });
    } catch {}

    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
