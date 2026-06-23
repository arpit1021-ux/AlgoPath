import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

    const plan = await db.plan.findFirst({
      where: { id: planId, userId: user.id },
      select: {
        id: true,
        name: true,
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
                // KEY FIX: only fetch top 3 companies, only name field
                companies: {
                  take: 3,
                  select: { company: { select: { name: true } } },
                },
              },
            },
            revisions: {
              select: { status: true, scheduledDate: true },
              // KEY FIX: only fetch pending revisions
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

    return NextResponse.json({ plan });
  } catch (error) {
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
    const body = await request.json();

    const plan = await db.plan.update({
      where: { id: planId, userId: user.id },
      data: body,
    });

    return NextResponse.json({ plan });
  } catch (error) {
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
    await db.plan.delete({ where: { id: planId, userId: user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
