import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, withDbRetry, getUserByClerkId } from "@/lib/db";
import { generateRoadmap } from "@/lib/roadmap-generator";
import { logError } from "@/lib/logger";

/**
 * Generations already running in this process, keyed by plan. A second request
 * for the same plan waits on the first instead of starting a rival build.
 * Single-process only — the DB-level protection is skipDuplicates in
 * generateRoadmap.
 */
const inFlight = new Map<string, Promise<unknown>>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByClerkId(clerkId);
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

    // Only a plan that already generated successfully is off limits. A FAILED
    // plan must be retryable — otherwise the "Try again" button 400s forever.
    if (plan.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Plan already generated", code: "ALREADY_GENERATED" },
        { status: 409 }
      );
    }

    // Claim the run, so a retry of a FAILED plan is back in a generating state
    // while it works.
    if (plan.status !== "GENERATING") {
      await db.plan.update({
        where: { id: planId },
        data: { status: "GENERATING" },
      });
    }

    // Safe to retry: generateRoadmap deletes and re-inserts this plan's
    // problems in one transaction, so a second run is idempotent.
    const existing = inFlight.get(plan.id);
    if (existing) {
      await existing;
      return NextResponse.json({ success: true, coalesced: true });
    }

    const run = withDbRetry(() =>
      generateRoadmap(plan.id, {
        name: plan.name,
        description: plan.description ?? undefined,
        experienceLevel: plan.experienceLevel as "BEGINNER" | "INTERMEDIATE" | "EXPERT",
        timelineWeeks: plan.timelineWeeks,
        weeklyHours: plan.weeklyHours,
        targetCompanies: plan.targetCompanies.map((tc) => tc.company.slug),
        topicMode: plan.selectedTags.length > 0 ? "RECOMMENDED" : "ALL",
        selectedTopics: plan.selectedTags.map((st) => st.tag.name),
        difficultyPreference: plan.difficultyPreference,
      })
    );
    inFlight.set(plan.id, run);

    try {
      await run;
    } finally {
      inFlight.delete(plan.id);
    }

    await db.plan.update({
      where: { id: planId },
      data: { status: "ACTIVE" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, { route: "POST /api/plans/[planId]/generate" });

    try {
      const { planId } = await params;
      // updateMany + a status filter: if another run already finished this
      // plan, leave it ACTIVE instead of marking a working plan as failed.
      await db.plan.updateMany({
        where: { id: planId, status: { not: "ACTIVE" } },
        data: { status: "FAILED" },
      });
    } catch {}

    return NextResponse.json(
      {
        error: "Failed to generate roadmap",
        code: "GENERATION_FAILED",
        message:
          "We couldn't build your roadmap. Your plan and its settings are saved — retrying usually works.",
      },
      { status: 500 }
    );
  }
}
