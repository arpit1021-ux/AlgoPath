import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getAllProblems, mapDifficulty, getLeetCodeUrl } from "@/lib/leetcode";
import { log } from "@/lib/logger";

let seedPromise: Promise<void> | null = null;

export async function seedProblems(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const count = await db.problem.count();
    if (count >= 700) return;

    const problems = getAllProblems();
    log("info", `Seeding ${problems.length} problems (had ${count})...`);

    // Clear old data
    await db.companyProblemFrequency.deleteMany();
    await db.planProblem.deleteMany();
    await db.problem.deleteMany();
    await db.tag.deleteMany();
    await db.company.deleteMany();

    // Batch upsert tags
    const allTagNames = new Set<string>();
    for (const p of problems) for (const t of p.tags) allTagNames.add(t);
    const tagRecords = await Promise.all(
      [...allTagNames].map(name =>
        db.tag.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) } })
      )
    );
    const tagMap = new Map(tagRecords.map(t => [t.name, t.id]));

    // Batch upsert companies
    const allCompanyNames = new Set<string>();
    for (const p of problems) for (const c of p.companies) allCompanyNames.add(c);
    const companyRecords = await Promise.all(
      [...allCompanyNames].map(name =>
        db.company.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name) } })
      )
    );
    const companyMap = new Map(companyRecords.map(c => [c.name, c.id]));

    // Batch create problems
    for (let i = 0; i < problems.length; i += 100) {
      await db.problem.createMany({
        data: problems.slice(i, i + 100).map(p => ({
          leetcodeId: p.id, title: p.title, titleSlug: p.titleSlug,
          difficulty: mapDifficulty(p.difficulty), acceptanceRate: p.acceptanceRate,
          likes: p.likes, dislikes: p.dislikes, isPremium: p.isPremium,
          url: getLeetCodeUrl(p.titleSlug),
        })),
        skipDuplicates: true,
      });
    }

    // Fetch created problems for ID mapping
    const created = await db.problem.findMany({ select: { id: true, titleSlug: true } });
    const problemIdMap = new Map(created.map(p => [p.titleSlug, p.id]));

    // Batch tag connections
    const tagRows: { A: string; B: string }[] = [];
    for (const p of problems) {
      const pid = problemIdMap.get(p.titleSlug);
      if (!pid) continue;
      for (const t of p.tags) {
        const tid = tagMap.get(t);
        if (tid) tagRows.push({ A: tid, B: pid });
      }
    }
    for (let i = 0; i < tagRows.length; i += 500) {
      const batch = tagRows.slice(i, i + 500);
      const values = batch.map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`).join(", ");
      const params = batch.flatMap(r => [r.A, r.B]);
      await db.$executeRawUnsafe(`INSERT INTO "_ProblemToTag" ("A", "B") VALUES ${values} ON CONFLICT DO NOTHING`, ...params);
    }

    // Batch company-frequency connections
    const freqRows: { companyId: string; problemId: string; frequency: number }[] = [];
    for (const p of problems) {
      const pid = problemIdMap.get(p.titleSlug);
      if (!pid) continue;
      for (const c of p.companies) {
        const cid = companyMap.get(c);
        if (cid) freqRows.push({ companyId: cid, problemId: pid, frequency: Math.floor(Math.random() * 10) + 1 });
      }
    }
    for (let i = 0; i < freqRows.length; i += 500) {
      await db.companyProblemFrequency.createMany({ data: freqRows.slice(i, i + 500), skipDuplicates: true });
    }

    log("info", `Seeding complete: ${problems.length} problems, ${tagRows.length} tag links, ${freqRows.length} company links.`);
  })();

  return seedPromise;
}
