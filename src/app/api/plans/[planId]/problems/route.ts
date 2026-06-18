import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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
    const { planProblemId, status } = body;

    const planProblem = await db.planProblem.findUnique({
      where: { id: planProblemId },
      include: { plan: true },
    });

    if (!planProblem || planProblem.plan.userId !== user.id) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    const updated = await db.planProblem.update({
      where: { id: planProblemId },
      data: {
        status,
        completedAt: status === "SOLVED" ? new Date() : null,
      },
    });

    if (status === "SOLVED") {
      const existingRevisions = await db.revision.findMany({
        where: { planProblemId, userId: user.id },
      });

      if (existingRevisions.length === 0) {
        const intervals = [2, 7, 21, 45];
        const now = new Date();
        const revisionData = intervals.map((days, index) => ({
          planProblemId,
          userId: user.id,
          revisionNumber: index + 1,
          scheduledDate: new Date(
            now.getTime() + days * 24 * 60 * 60 * 1000
          ),
          status: "PENDING" as const,
        }));

        await db.revision.createMany({ data: revisionData });
      }

      await db.activityLog.create({
        data: {
          userId: user.id,
          planId: planProblem.planId,
          action: "problem_solved",
          details: { problemId: planProblemId },
        },
      });
    }

    return NextResponse.json({ planProblem: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update problem status" },
      { status: 500 }
    );
  }
}
