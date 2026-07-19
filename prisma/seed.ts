import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getAllProblems, mapDifficulty, getLeetCodeUrl } from "../src/lib/leetcode";
import { slugify } from "../src/lib/utils";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  const problems = getAllProblems();
  console.log(`Seeding ${problems.length} problems...`);

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
    console.log(`Created problems ${i + batch.length}/${problems.length}`);
  }

  const createdProblems = await db.problem.findMany({
    select: { id: true, titleSlug: true },
  });
  const problemIdMap = new Map(createdProblems.map((p) => [p.titleSlug, p.id]));

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

  console.log("Seeding complete!");
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
