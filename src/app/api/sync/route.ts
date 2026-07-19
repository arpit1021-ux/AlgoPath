import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getAllProblems, mapDifficulty, getLeetCodeUrl } from "@/lib/leetcode";
import { slugify } from "@/lib/utils";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean);

export async function POST(_request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    const cronSecret = _request.headers.get("authorization")?.replace("Bearer ", "");
    const isCronCall = process.env.CRON_SECRET && cronSecret === process.env.CRON_SECRET;

    if (!isCronCall) {
      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(clerkId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    const problems = getAllProblems();
    let created = 0;
    let updated = 0;

    for (const p of problems) {
      for (const tagName of p.tags) {
        const tagSlug = slugify(tagName);
        await db.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
      }

      for (const companyName of p.companies) {
        const companySlug = slugify(companyName);
        await db.company.upsert({
          where: { slug: companySlug },
          update: {},
          create: { name: companyName, slug: companySlug },
        });
      }

      const existing = await db.problem.findUnique({
        where: { titleSlug: p.titleSlug },
      });

      if (existing) {
        await db.problem.update({
          where: { id: existing.id },
          data: {
            acceptanceRate: p.acceptanceRate,
            likes: p.likes,
            dislikes: p.dislikes,
            isPremium: p.isPremium,
          },
        });
        updated++;
      } else {
        const createdProblem = await db.problem.create({
          data: {
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
          const tagSlug = slugify(tagName);
          const tag = await db.tag.findUnique({ where: { slug: tagSlug } });
          if (tag) {
            await db.problem.update({
              where: { id: createdProblem.id },
              data: { tags: { connect: { id: tag.id } } },
            });
          }
        }

        for (const companyName of p.companies) {
          const companySlug = slugify(companyName);
          const company = await db.company.findUnique({ where: { slug: companySlug } });
          if (company) {
            await db.companyProblemFrequency.create({
              data: {
                companyId: company.id,
                problemId: createdProblem.id,
                frequency: Math.floor(Math.random() * 10) + 1,
              },
            });
          }
        }
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      total: problems.length,
      created,
      updated,
    });
  } catch (error) {
    console.error("Sync failed:", error);
    return NextResponse.json(
      { error: "Failed to sync problem data" },
      { status: 500 }
    );
  }
}
