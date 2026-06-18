import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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
      return NextResponse.json(
        { error: "planProblemId required" },
        { status: 400 }
      );
    }

    const note = await db.note.findUnique({
      where: { planProblemId_userId: { planProblemId, userId: user.id } },
    });

    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch note" },
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
    const { planProblemId, content, isAiGenerated } = body;

    const note = await db.note.upsert({
      where: { planProblemId_userId: { planProblemId, userId: user.id } },
      update: { content, isAiGenerated: isAiGenerated || false },
      create: {
        planProblemId,
        userId: user.id,
        content,
        isAiGenerated: isAiGenerated || false,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 }
    );
  }
}
