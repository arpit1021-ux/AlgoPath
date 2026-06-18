import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { generateRoadmap } from "@/lib/roadmap-generator";
import { slugify } from "@/lib/utils";
import { getAllProblems, mapDifficulty, getLeetCodeUrl } from "@/lib/leetcode";

async function getOrCreateUser(clerkId: string) {
  return db.user.upsert({
    where: { clerkId },
    update: {},
    create: { clerkId },
  });
}

// Seed only runs once — moved outside request to avoid timeout
let seedPromise: Promise<void> | null = null;

async function ensureProblemsSeeded() {
  const count = await db.problem.count();
  if (count > 0) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const problems = getAllProblems();
    console.log(`Seeding ${problems.length} problems...`);

    for (const p of problems) {
      // Upsert tags
      for (const tagName of p.tags) {
        await db.tag.upsert({
          where: { slug: slugify(tagName) },
          update: {},
          create: { name: tagName, slug: slugify(tagName) },
        });
      }
      // Upsert companies
      for (const companyName of p.companies) {
        await db.company.upsert({
          where: { slug: slugify(companyName) },
          update: {},
          create: {
            name: companyName,
            slug: slugify(companyName),
          },
        });
      }

      const created = await db.problem.upsert({
        where: { titleSlug: p.titleSlug },
        update: {},
        create: {
          leetcodeId: p.id,
          title: p.title,
          titleSlug: p.titleSlug,
          difficulty: mapDifficulty(p.difficulty),
          acceptanceRate: p.acceptanceRate,
          likes: p.likes,
          dislikes: p.dislikes,
          isPremium: p.isPremium,
          url: getLeetCodeUrl(p.titleSlug),
        },
      });

      for (const tagName of p.tags) {
        const tag = await db.tag.findUnique({ where: { slug: slugify(tagName) } });
        if (tag) {
          await db.problem.update({
            where: { id: created.id },
            data: { tags: { connect: { id: tag.id } } },
          }).catch(() => {}); // already connected — ignore
        }
      }

      for (const companyName of p.companies) {
        const company = await db.company.findUnique({
          where: { slug: slugify(companyName) },
        });
        if (company) {
          await db.companyProblemFrequency.upsert({
            where: { companyId_problemId: { companyId: company.id, problemId: created.id } },
            update: {},
            create: {
              companyId: company.id,
              problemId: created.id,
              frequency: Math.floor(Math.random() * 10) + 1,
            },
          });
        }
      }
    }
    console.log("Seeding complete.");
  })();

  return seedPromise;
}

// GET /api/plans — list all plans for current user
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ plans: [] });
    }

    const plans = await db.plan.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        experienceLevel: true,
        timelineWeeks: true,
        weeklyHours: true,
        difficultyPreference: true,
        createdAt: true,
        targetCompanies: {
          select: { company: { select: { name: true, slug: true } } },
        },
        problems: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(clerkId);
    const body = await request.json();
    const {
      name,
      description,
      experienceLevel,
      timelineWeeks,
      weeklyHours,
      targetCompanies = [],
      topicMode = "ALL",
      selectedTopics = [],
      difficultyPreference,
    } = body;

    // Validate required fields
    if (!name || !experienceLevel || !timelineWeeks || !weeklyHours) {
      return NextResponse.json(
        { error: "Missing required fields: name, experienceLevel, timelineWeeks, weeklyHours" },
        { status: 400 }
      );
    }

    await ensureProblemsSeeded();

    const plan = await db.plan.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        experienceLevel,
        timelineWeeks: Number(timelineWeeks),
        weeklyHours: Number(weeklyHours),
        difficultyPreference: difficultyPreference || "BALANCED",
        startDate: new Date(),
      },
    });

    // Upsert + link companies
    for (const companySlug of targetCompanies) {
      const company = await db.company.upsert({
        where: { slug: companySlug },
        update: {},
        create: {
          name: companySlug.charAt(0).toUpperCase() + companySlug.slice(1),
          slug: companySlug,
        },
      });
      await db.planCompany.upsert({
        where: { planId_companyId: { planId: plan.id, companyId: company.id } },
        update: {},
        create: { planId: plan.id, companyId: company.id },
      });
    }

    // Upsert + link topics
    for (const topicName of selectedTopics) {
      const tag = await db.tag.upsert({
        where: { slug: slugify(topicName) },
        update: {},
        create: { name: topicName, slug: slugify(topicName) },
      });
      await db.planTag.upsert({
        where: { planId_tagId: { planId: plan.id, tagId: tag.id } },
        update: {},
        create: { planId: plan.id, tagId: tag.id },
      });
    }

    await generateRoadmap(plan.id, {
      name,
      description,
      experienceLevel,
      timelineWeeks: Number(timelineWeeks),
      weeklyHours: Number(weeklyHours),
      targetCompanies,
      topicMode,
      selectedTopics,
      difficultyPreference: difficultyPreference || "BALANCED",
    });

    return NextResponse.json({ plan: { id: plan.id, name: plan.name } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan", details: String(error) },
      { status: 500 }
    );
  }
}