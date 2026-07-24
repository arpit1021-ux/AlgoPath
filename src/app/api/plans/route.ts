import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify, generatePlanSlug } from "@/lib/utils";
import { planCreationLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

async function getOrCreateUser(clerkId: string) {
  return db.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId },
  });
}

const CreatePlanSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
  timelineWeeks: z.number().min(1).max(52),
  weeklyHours: z.number().min(1).max(80),
  targetCompanies: z.array(z.string()).min(1),
  topicMode: z.enum(["ALL", "CUSTOM"]),
  selectedTopics: z.array(z.string()),
  difficultyPreference: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"]),
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

    const plans = await db.plan.findMany({
      where: { userId: user.id, deletedAt: null },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        targetCompanies: { select: { company: { select: { name: true } } } },
        problems: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { plans },
      { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } }
    );
  } catch (error) {
    logError(error, { route: "GET /api/plans" });
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blocked, response } = await checkRateLimit(planCreationLimiter, `user_${clerkId}`);
    if (blocked) {
      return NextResponse.json(
        { error: "Too many requests", message: JSON.parse(await response!.text()).message },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = CreatePlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(clerkId);

    const recentDuplicate = await db.plan.findFirst({
      where: {
        userId: user.id,
        name: parsed.data.name,
        createdAt: { gte: new Date(Date.now() - 10000) },
      },
    });
    if (recentDuplicate) {
      return NextResponse.json(
        { plan: { id: recentDuplicate.id, name: recentDuplicate.name } },
        { status: 200 }
      );
    }

    // Quick check: if no problems exist, seed in background (non-blocking)
    const problemCount = await db.problem.count();
    if (problemCount < 700) {
      // Fire-and-forget seed — don't block the user
      import("@/app/api/seed/route").then(m => m.seedProblems()).catch(() => {});
      // Wait briefly for seed to complete if this is first request
      await new Promise(r => setTimeout(r, 2000));
    }

    const { name, description, experienceLevel, timelineWeeks, weeklyHours, targetCompanies, topicMode, selectedTopics, difficultyPreference } = parsed.data;

    let slug = generatePlanSlug(name);
    const existing = await db.plan.findFirst({
      where: { userId: user.id, slug },
      select: { id: true },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const plan = await db.plan.create({
      data: {
        userId: user.id,
        name,
        slug,
        description: description || null,
        experienceLevel,
        timelineWeeks: Number(timelineWeeks),
        weeklyHours: Number(weeklyHours),
        difficultyPreference,
        status: "GENERATING",
        startDate: new Date(),
      },
    });

    // Batch upsert companies + plan links
    if (targetCompanies.length > 0) {
      const companyRecords = await Promise.all(
        targetCompanies.map(slug =>
          db.company.upsert({
            where: { slug },
            update: {},
            create: { name: slug.charAt(0).toUpperCase() + slug.slice(1), slug },
          })
        )
      );
      await db.planCompany.createMany({
        data: companyRecords.map(c => ({ planId: plan.id, companyId: c.id })),
        skipDuplicates: true,
      });
    }

    // Batch upsert topics + plan links
    if (selectedTopics.length > 0) {
      const tagRecords = await Promise.all(
        selectedTopics.map(name =>
          db.tag.upsert({
            where: { slug: slugify(name) },
            update: {},
            create: { name, slug: slugify(name) },
          })
        )
      );
      await db.planTag.createMany({
        data: tagRecords.map(t => ({ planId: plan.id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ plan: { id: plan.id, name: plan.name, slug: plan.slug } }, { status: 201 });
  } catch (error) {
    logError(error, { route: "POST /api/plans" });
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to create plan", detail: message }, { status: 500 });
  }
}
