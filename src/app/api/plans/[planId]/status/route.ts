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
      where: { id: planId, userId: user.id, deletedAt: null },
      select: { id: true, status: true, slug: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(
      { status: plan.status, slug: plan.slug },
      { headers: { "Cache-Control": "private, max-age=1" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
