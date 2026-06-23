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
  if (count >= 700) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const problems = getAllProblems();
    console.log(`Seeding ${problems.length} problems (had ${count})...`);

    // Clear old data for clean re-seed
    await db.companyProblemFrequency.deleteMany();
    await db.planProblem.deleteMany();
    await db.problem.deleteMany();
    await db.tag.deleteMany();
    await db.company.deleteMany();

    // Batch upsert all tags
    const allTagNames = new Set<string>();
    for (const p of problems) {
      for (const t of p.tags) allTagNames.add(t);
    }
    const tagRecords = await Promise.all(
      [...allTagNames].map(async (name) => {
        const slug = slugify(name);
        return db.tag.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
      })
    );
    const tagMap = new Map(tagRecords.map((t) => [t.name, t.id]));
    console.log(`Upserted ${tagRecords.length} tags.`);

    // Batch upsert all companies
    const allCompanyNames = new Set<string>();
    for (const p of problems) {
      for (const c of p.companies) allCompanyNames.add(c);
    }
    const companyRecords = await Promise.all(
      [...allCompanyNames].map(async (name) => {
        const slug = slugify(name);
        return db.company.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
      })
    );
    const companyMap = new Map(companyRecords.map((c) => [c.name, c.id]));
    console.log(`Upserted ${companyRecords.length} companies.`);

    // Batch create all problems
    const BATCH_SIZE = 100;
    for (let i = 0; i < problems.length; i += BATCH_SIZE) {
      const batch = problems.slice(i, i + BATCH_SIZE);
      await db.problem.createMany({
        data: batch.map((p) => ({
          leetcodeId: p.id,
          title: p.title,
          titleSlug: p.titleSlug,
          difficulty: mapDifficulty(p.difficulty),
          acceptanceRate: p.acceptanceRate,
          likes: p.likes,
          dislikes: p.dislikes,
          isPremium: p.isPremium,
          url: getLeetCodeUrl(p.titleSlug),
        })),
        skipDuplicates: true,
      });
    }
    console.log(`Created ${problems.length} problems.`);

    // Fetch all created problems to get their IDs
    const createdProblems = await db.problem.findMany({
      select: { id: true, titleSlug: true },
    });
    const problemIdMap = new Map(createdProblems.map((p) => [p.titleSlug, p.id]));

    // Batch create tag connections
    const tagConnections: { problemId: string; tagId: string }[] = [];
    for (const p of problems) {
      const pid = problemIdMap.get(p.titleSlug);
      if (!pid) continue;
      for (const t of p.tags) {
        const tid = tagMap.get(t);
        if (tid) tagConnections.push({ problemId: pid, tagId: tid });
      }
    }
    for (let i = 0; i < tagConnections.length; i += BATCH_SIZE) {
      const batch = tagConnections.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((tc) =>
          db.problem.update({
            where: { id: tc.problemId },
            data: { tags: { connect: { id: tc.tagId } } },
          }).catch(() => {})
        )
      );
    }
    console.log(`Connected ${tagConnections.length} tag-problem links.`);

    // Batch create company-problem-frequency records
    const freqData: { companyId: string; problemId: string; frequency: number }[] = [];
    for (const p of problems) {
      const pid = problemIdMap.get(p.titleSlug);
      if (!pid) continue;
      for (const c of p.companies) {
        const cid = companyMap.get(c);
        if (cid) freqData.push({ companyId: cid, problemId: pid, frequency: Math.floor(Math.random() * 10) + 1 });
      }
    }
    for (let i = 0; i < freqData.length; i += BATCH_SIZE) {
      const batch = freqData.slice(i, i + BATCH_SIZE);
      await db.companyProblemFrequency.createMany({ data: batch, skipDuplicates: true });
    }
    console.log(`Connected ${freqData.length} company-problem links.`);

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