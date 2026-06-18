import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  getTodaysRevisions,
  getOverdueRevisions,
  completeRevision,
} from "@/lib/revision-engine";

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

    const [todayRevisions, overdueRevisions] = await Promise.all([
      getTodaysRevisions(user.id),
      getOverdueRevisions(user.id),
    ]);

    let filteredToday = todayRevisions;
    let filteredOverdue = overdueRevisions;

    if (planId) {
      filteredToday = todayRevisions.filter(
        (r) => r.planProblem.planId === planId
      );
      filteredOverdue = overdueRevisions.filter(
        (r) => r.planProblem.planId === planId
      );
    }

    return NextResponse.json({
      today: filteredToday,
      overdue: filteredOverdue,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch revisions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { revisionId } = body;

    const revision = await db.revision.findUnique({
      where: { id: revisionId },
    });

    if (!revision || revision.userId !== user.id) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
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
          details: {
            revisionId,
            revisionNumber: completed.revisionNumber,
          },
        },
      });
    }

    return NextResponse.json({ revision: completed });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to complete revision" },
      { status: 500 }
    );
  }
}
