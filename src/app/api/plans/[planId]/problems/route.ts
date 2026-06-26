import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { problemUpdateLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

const UpdateProblemSchema = z.object({
  planProblemId: z.string().min(1),
  status: z.enum(["TODO", "SOLVED", "ATTEMPTED", "SKIPPED"]),
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blocked, response } = await checkRateLimit(problemUpdateLimiter, `user_${clerkId}`);
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
    const parsed = UpdateProblemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { planProblemId, status } = parsed.data;

    const planProblem = await db.planProblem.findFirst({
      where: { id: planProblemId, plan: { userId: user.id } },
    });

    if (!planProblem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
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
          scheduledDate: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
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
    logError(error, { route: "POST /api/plans/[planId]/problems" });
    return NextResponse.json({ error: "Failed to update problem status" }, { status: 500 });
  }
}
