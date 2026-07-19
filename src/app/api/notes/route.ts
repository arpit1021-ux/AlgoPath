import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { notesLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

const NoteSchema = z.object({
  planProblemId: z.string().min(1),
  content: z.string().max(5000).trim(),
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
    const planProblemId = searchParams.get("planProblemId");
    if (!planProblemId) {
      return NextResponse.json({ error: "planProblemId required" }, { status: 400 });
    }

    const note = await db.note.findUnique({
      where: { planProblemId_userId: { planProblemId, userId: user.id } },
    });

    return NextResponse.json({ note });
  } catch (error) {
    logError(error, { route: "GET /api/notes" });
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blocked, response } = await checkRateLimit(notesLimiter, `user_${clerkId}`);
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
    const parsed = NoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { planProblemId, content } = parsed.data;

    const planProblem = await db.planProblem.findFirst({
      where: { id: planProblemId, plan: { userId: user.id } },
    });
    if (!planProblem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const note = await db.note.upsert({
      where: { planProblemId_userId: { planProblemId, userId: user.id } },
      update: { content },
      create: { planProblemId, userId: user.id, content },
    });

    return NextResponse.json({ note });
  } catch (error) {
    logError(error, { route: "POST /api/notes" });
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
