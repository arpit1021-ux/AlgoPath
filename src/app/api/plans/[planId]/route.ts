import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { logError } from "@/lib/logger";

async function resolvePlan(slugOrId: string, userId: string) {
  const bySlug = await db.plan.findFirst({
    where: { slug: slugOrId, userId, deletedAt: null },
    select: { id: true },
  });
  if (bySlug) return bySlug;
  const byId = await db.plan.findFirst({
    where: { id: slugOrId, userId, deletedAt: null },
    select: { id: true },
  });
  return byId;
}

export async function GET(
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
    const resolved = await resolvePlan(planId, user.id);
    if (!resolved) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const plan = await db.plan.findFirst({
      where: { id: resolved.id, userId: user.id, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        experienceLevel: true,
        timelineWeeks: true,
        weeklyHours: true,
        difficultyPreference: true,
        status: true,
        createdAt: true,
        targetCompanies: {
          select: { company: { select: { name: true, slug: true } } },
        },
        selectedTags: {
          select: { tag: { select: { name: true } } },
        },
        problems: {
          select: {
            id: true,
            weekNumber: true,
            order: true,
            status: true,
            timeSpentMinutes: true,
            problem: {
              select: {
                id: true,
                title: true,
                titleSlug: true,
                difficulty: true,
                acceptanceRate: true,
                likes: true,
                url: true,
                tags: { select: { name: true } },
                companies: {
                  take: 3,
                  select: { company: { select: { name: true } } },
                },
              },
            },
            revisions: {
              select: { status: true, scheduledDate: true },
              where: { status: "PENDING" },
              take: 4,
            },
            notes: {
              select: { content: true },
              take: 1,
            },
          },
          orderBy: [{ weekNumber: "asc" }, { order: "asc" }],
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(
      { plan },
      { headers: { "Cache-Control": "private, no-cache" } }
    );
  } catch (error) {
    logError(error, { route: "GET /api/plans/[planId]" });
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function PATCH(
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
    const resolved = await resolvePlan(planId, user.id);
    if (!resolved) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const body = await request.json();

    const UpdatePlanSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      status: z.enum(["ACTIVE", "PAUSED", "COMPLETED"]).optional(),
    }).strict();

    const parsed = UpdatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const plan = await db.plan.update({
      where: { id: resolved.id },
      data: parsed.data,
    });

    return NextResponse.json({ plan });
  } catch (error) {
    logError(error, { route: "PATCH /api/plans/[planId]" });
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(
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
    const resolved = await resolvePlan(planId, user.id);
    if (!resolved) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    await db.plan.update({
      where: { id: resolved.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, { route: "DELETE /api/plans/[planId]" });
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
