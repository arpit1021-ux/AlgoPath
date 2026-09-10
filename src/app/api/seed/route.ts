import { NextResponse } from "next/server";
import { seedProblems } from "@/lib/seed";

export async function POST() {
  try {
    await seedProblems();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
