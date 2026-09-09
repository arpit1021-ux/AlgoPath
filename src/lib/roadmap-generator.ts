import { db } from "./db";
import type { PlanWizardInput, ExperienceLevel, DifficultyPreference } from "./types";

interface RoadmapProblem {
  problemId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  acceptanceRate: number;
  likes: number;
  tags: string[];
  companies: string[];
  estimatedMinutes: number;
  weekNumber: number;
  order: number;
}

interface Roadmap {
  weeks: {
    weekNumber: number;
    problems: RoadmapProblem[];
    totalEstimatedMinutes: number;
  }[];
  totalProblems: number;
  totalEstimatedMinutes: number;
}

// Time per difficulty per experience level (minutes)
const ESTIMATED_TIME: Record<string, Record<string, number>> = {
  BEGINNER:     { EASY: 35, MEDIUM: 55, HARD: 80 },
  INTERMEDIATE: { EASY: 25, MEDIUM: 40, HARD: 60 },
  EXPERT:       { EASY: 15, MEDIUM: 28, HARD: 45 },
};

// Target difficulty distribution per difficulty preference
const TARGET_DISTRIBUTION: Record<DifficultyPreference, { EASY: number; MEDIUM: number; HARD: number }> = {
  VERY_EASY: { EASY: 0.65, MEDIUM: 0.30, HARD: 0.05 },
  EASY:      { EASY: 0.50, MEDIUM: 0.40, HARD: 0.10 },
  MEDIUM:    { EASY: 0.20, MEDIUM: 0.55, HARD: 0.25 },
  HARD:      { EASY: 0.10, MEDIUM: 0.30, HARD: 0.60 },
  VERY_HARD: { EASY: 0.05, MEDIUM: 0.20, HARD: 0.75 },
};

function getDifficultyDistribution(
  difficultyPreference: DifficultyPreference
): { EASY: number; MEDIUM: number; HARD: number } {
  return TARGET_DISTRIBUTION[difficultyPreference] ?? TARGET_DISTRIBUTION.MEDIUM;
}

function balanceTopics<T extends { tags: string[] }>(
  problems: T[],
  maxConsecutive: number = 3
): T[] {
  const result: T[] = [];
  const remaining = [...problems];
  let consecutiveCount = 0;
  let lastTopic = "";

  while (remaining.length > 0) {
    let nextIndex = 0;

    if (consecutiveCount >= maxConsecutive && remaining.length > 1) {
      for (let i = 1; i < remaining.length; i++) {
        const primaryTag = remaining[i].tags[0] || "";
        if (primaryTag !== lastTopic) {
          nextIndex = i;
          break;
        }
      }
    }

    const next = remaining.splice(nextIndex, 1)[0];
    const primaryTag = next.tags[0] || "";

    if (primaryTag === lastTopic) {
      consecutiveCount++;
    } else {
      consecutiveCount = 1;
      lastTopic = primaryTag;
    }

    result.push(next);
  }

  return result;
}

export async function generateRoadmap(
  planId: string,
  input: PlanWizardInput
): Promise<Roadmap> {
  const totalWeeks = input.timelineWeeks;
  const weeklyMinutes = input.weeklyHours * 60;
  const expLevel = input.experienceLevel as ExperienceLevel;
  const diffPref = (input.difficultyPreference || "MEDIUM") as DifficultyPreference;
  const timeMap = ESTIMATED_TIME[expLevel] ?? ESTIMATED_TIME["INTERMEDIATE"];

  const topicFilter =
    input.topicMode === "ALL" || !input.selectedTopics?.length
      ? undefined
      : { some: { name: { in: input.selectedTopics } } };

  // Take the whole catalogue: the curriculum buckets by pattern phase, and a
  // top-N-by-likes cut would starve the later phases (Graphs, DP) of problems.
  const estimatedNeeded = 1000;

  // Single efficient query — no nested company includes
  /*
   * SQL, Shell and Interactive problems are on LeetCode but are not DSA
   * practice — "Guess the Word" needs an interactive judge and cannot be
   * solved from a problem page at all. They have no place in a roadmap.
   */
  const NON_ALGORITHMIC_TAGS = ["SQL", "Shell", "Interactive"];

  const allProblems = await db.problem.findMany({
    where: {
      isPremium: false,
      NOT: { tags: { some: { name: { in: NON_ALGORITHMIC_TAGS } } } },
      ...(topicFilter ? { tags: topicFilter } : {}),
    },
    take: estimatedNeeded,
    orderBy: { likes: "desc" },
    select: {
      id: true,
      title: true,
      titleSlug: true,
      difficulty: true,
      acceptanceRate: true,
      likes: true,
      tags: { select: { name: true } },
      companies: {
        select: { companyId: true },
      },
    },
  });

  // Get company-prioritized problem IDs with ordered priority
  const companyProblemScores = new Map<string, number>();
  if (input.targetCompanies.length > 0) {
    // Single query: fetch frequency + company slug together
    const companyRows = await db.companyProblemFrequency.findMany({
      where: { company: { slug: { in: input.targetCompanies } } },
      select: {
        problemId: true,
        frequency: true,
        company: { select: { slug: true } },
      },
      orderBy: { frequency: "desc" },
    });

    const companySlugToPriority = new Map<string, number>();
    input.targetCompanies.forEach((slug, idx) => {
      companySlugToPriority.set(slug, idx);
    });

    for (const row of companyRows) {
      const priority = companySlugToPriority.get(row.company.slug) ?? 99;
      const baseScore = 100 - priority * 15;
      const existing = companyProblemScores.get(row.problemId) ?? 0;
      companyProblemScores.set(row.problemId, Math.max(existing, baseScore));
    }
  }

  /*
   * Rank-percentile the likes across the fetched pool. Raw `likes * 0.01`
   * reached 320 and swamped the 0-100 company score; log10 compressed 12k and
   * 32k into four points and let acceptance rate take over, which ranked
   * Unique Morse Code Words above Two Sum. A percentile keeps the ordering
   * information without the scale problem.
   */
  const byLikesAsc = [...allProblems].sort((a, b) => a.likes - b.likes);
  const likesPercentile = new Map<string, number>();
  byLikesAsc.forEach((p, i) => {
    likesPercentile.set(p.id, (i / Math.max(1, byLikesAsc.length - 1)) * 100);
  });

  // Score and sort problems
  const scoredProblems = allProblems
    .map((p) => ({
      ...p,
      tags: p.tags.map((t) => t.name),
      /*
       * Three signals, each normalised to 0-100 and weighted explicitly, so
       * one cannot quietly swamp the others:
       *
       *   company 45%   the product's core promise, so it leads.
       *   canon   40%   how established the problem is. Two Sum and Valid
       *                 Parentheses must come before Morse-code trivia.
       *   ease    15%   a tiebreaker only. Pools are drawn in order across
       *                 the timeline, so a mild preference for approachable
       *                 problems gives a finer difficulty ramp inside each
       *                 band — but it must never outvote canon, which is the
       *                 bug that put Two Sum in week 4.
       */
      score:
        0.45 * (companyProblemScores.get(p.id) ?? 0) +
        0.4 * (likesPercentile.get(p.id) ?? 0) +
        0.15 * p.acceptanceRate,
    }))
    .sort((a, b) => b.score - a.score);

  const roadmap: Roadmap = {
    weeks: [],
    totalProblems: 0,
    totalEstimatedMinutes: 0,
  };

  const DIFFS = ["EASY", "MEDIUM", "HARD"] as const;
  type Diff = (typeof DIFFS)[number];

  /*
   * A roadmap is a curriculum, not a shuffled list. Three things drive it:
   *
   *   1. Order.      Patterns are taught in prerequisite order — you do not
   *                  meet Dynamic Programming in week 1. A problem belongs to
   *                  the MOST ADVANCED pattern it requires, so "Arrays + DP"
   *                  is a DP problem, not an array problem.
   *   2. Ramp.       Difficulty rises across the timeline. The user's
   *                  preference is the AVERAGE, not a flat weekly rate: early
   *                  weeks skew easier to build fundamentals, later weeks skew
   *                  harder to rehearse the real interview.
   *   3. Feasibility.The catalogue is finite. Work out the largest plan whose
   *                  difficulty split every pool can supply, then scale every
   *                  week by the same factor so the plan stays even instead of
   *                  burning the whole catalogue in the first ten weeks.
   */
  /*
   * These strings must match the tags actually stored on problems, not the
   * wizard's display list. "Linked List", "Trie" and "BFS/DFS" appear in
   * TOPICS but never in the data — it stores "Linked Lists", "Tries", and BFS
   * and DFS separately. Every unmatched tag silently falls to phase 0, which
   * is how 96 DFS and 31 BFS problems ended up in the foundations weeks.
   */
  const CURRICULUM: readonly (readonly string[])[] = [
    ["Arrays", "Hashing", "Strings", "Math", "Sorting", "Prefix Sum"],
    ["Two Pointers", "Sliding Window", "Binary Search"],
    ["Stack", "Queue", "Linked Lists", "Design", "Iterator", "Ordered Set"],
    ["Trees", "Heap", "Tries", "Recursion", "Divide and Conquer"],
    ["BFS", "DFS", "Graphs", "Matrix", "Union Find", "Topological Sort", "Dijkstra"],
    ["Greedy", "Backtracking", "Bit Manipulation", "Geometry"],
    ["Dynamic Programming", "Segment Tree", "Binary Indexed Tree", "KMP"],
  ];
  const phaseOfTopic = new Map<string, number>();
  CURRICULUM.forEach((topics, i) => topics.forEach((t) => phaseOfTopic.set(t, i)));

  const problemPhase = (tags: string[]) => {
    let phase = -1;
    for (const t of tags) {
      const ph = phaseOfTopic.get(t);
      if (ph !== undefined && ph > phase) phase = ph;
    }
    return phase < 0 ? 0 : phase;
  };

  /*
   * Consuming each pool strictly in rank order put every marquee problem in
   * the first week of its phase and left the following weeks with filler —
   * week 1 got Two Sum and Merge Intervals, week 3 got Powerful Integers.
   *
   * So each pool is dealt round-robin into LANES, like dealing cards. Lane i
   * holds ranks i, i+LANES, i+2*LANES..., which gives every lane the same
   * quality distribution. Consecutive weeks then draw from different lanes, so
   * each week gets its share of the good problems.
   */
  const LANES = Math.max(1, Math.ceil(totalWeeks / CURRICULUM.length));

  const ranked: Record<number, Record<Diff, typeof scoredProblems>> = {};
  for (let ph = 0; ph < CURRICULUM.length; ph++) {
    ranked[ph] = { EASY: [], MEDIUM: [], HARD: [] };
  }
  for (const prob of scoredProblems) {
    const bucket = ranked[problemPhase(prob.tags)]?.[prob.difficulty as Diff];
    if (bucket) bucket.push(prob);
  }

  // pools[phase][difficulty][lane] -> ranked problems for that lane
  const pools: Record<number, Record<Diff, (typeof scoredProblems)[]>> = {};
  const cursor: Record<number, Record<Diff, number[]>> = {};
  for (let ph = 0; ph < CURRICULUM.length; ph++) {
    pools[ph] = { EASY: [], MEDIUM: [], HARD: [] };
    cursor[ph] = { EASY: [], MEDIUM: [], HARD: [] };
    for (const d of DIFFS) {
      pools[ph][d] = Array.from({ length: LANES }, () => []);
      cursor[ph][d] = new Array(LANES).fill(0);
      ranked[ph][d].forEach((prob, i) => pools[ph][d][i % LANES].push(prob));
    }
  }

  /*
   * Experience level decides how the curriculum OPENS, not just how fast we
   * assume you solve.
   *
   *   unlockSpeed  how quickly later phases become available.
   *   focus        how much of a week goes to the newest phase versus
   *                revisiting everything already unlocked.
   *
   * A beginner walks the ladder: one phase at a time, most of each week spent
   * on the pattern just introduced. An expert has the whole curriculum open in
   * week 1 and covers every pattern each week — so they meet easy Dynamic
   * Programming immediately, and the difficulty ramp, not the topic order,
   * provides the progression.
   */
  const LEVEL_SHAPE: Record<
    string,
    { unlockSpeed: number; focus: number; rampStrength: number }
  > = {
    // rampStrength: how steeply difficulty climbs across the timeline. A flat
    // +/-30% for everyone opened a BEGINNER plan with three Hard problems in
    // week 1 (First Missing Positive, Max Points on a Line). A beginner should
    // start at effectively zero Hard and earn their way up; an expert can take
    // Hard from the start, so their curve is gentle.
    BEGINNER: { unlockSpeed: 1, focus: 0.55, rampStrength: 0.9 },
    INTERMEDIATE: { unlockSpeed: 2, focus: 0.4, rampStrength: 0.55 },
    EXPERT: { unlockSpeed: Infinity, focus: 0, rampStrength: 0.3 },
  };
  const shape = LEVEL_SHAPE[expLevel] ?? LEVEL_SHAPE.INTERMEDIATE;
  const lastPhase = CURRICULUM.length - 1;

  /** How far the curriculum has opened at this point in the timeline. */
  const unlockedPhase = (t: number) => {
    if (!Number.isFinite(shape.unlockSpeed)) return lastPhase;
    return Math.min(
      lastPhase,
      Math.floor(t * CURRICULUM.length * shape.unlockSpeed)
    );
  };

  /**
   * Share of a week going to each unlocked phase. `focus` is the slice
   * reserved for the newest phase; the rest is spread over everything already
   * met, weighted slightly toward the recent. At focus 0 it is a flat spread —
   * every pattern, every week.
   */
  const phaseWeights = (unlocked: number) => {
    const n = unlocked + 1;
    const w = new Array<number>(n).fill(0);
    if (n === 1) return [1];
    const older = 1 - shape.focus;
    let denom = 0;
    for (let i = 0; i < n - 1; i++) denom += i + 1;
    for (let i = 0; i < n - 1; i++) w[i] = (older * (i + 1)) / denom;
    w[n - 1] = shape.focus + (shape.focus === 0 ? older / n : 0);
    if (shape.focus === 0) {
      for (let i = 0; i < n; i++) w[i] = 1 / n;
    }
    return w;
  };

  /**
   * Draw the next problem of this difficulty, preferring `phase` and then
   * spreading outward through phases the learner has already unlocked.
   *
   * It never reaches past `unlocked`. Doing so put Word Ladder (BFS over a
   * graph) in week 1 of an "Arrays" phase whenever the early Hard pool ran
   * thin, which defeats the point of teaching patterns in order.
   */
  const drawProblem = (phase: number, d: Diff, unlocked: number, lane: number) => {
    const start = Math.min(Math.max(phase, 0), unlocked);
    for (let step = 0; step <= unlocked; step++) {
      for (const q of step === 0 ? [start] : [start - step, start + step]) {
        if (q < 0 || q > unlocked) continue;
        // This week's lane first, then the others so nothing is stranded.
        for (let k = 0; k < LANES; k++) {
          const l = (lane + k) % LANES;
          const pool = pools[q][d][l];
          if (cursor[q][d][l] < pool.length) return pool[cursor[q][d][l]++];
        }
      }
    }
    return null;
  };

  /** Unclaimed problems of this difficulty across every unlocked phase. */
  const remainingStock = (unlocked: number, d: Diff) => {
    let n = 0;
    for (let q = 0; q <= unlocked; q++) {
      for (let l = 0; l < LANES; l++) {
        n += pools[q][d][l].length - cursor[q][d][l];
      }
    }
    return n;
  };

  const dist = getDifficultyDistribution(diffPref);

  /** Difficulty mix for a point in the timeline; averages to `dist`. */
  const rampedMix = (t: number): Record<Diff, number> => {
    const skew = (t - 0.5) * 2 * shape.rampStrength;
    const mix: Record<Diff, number> = {
      EASY: Math.max(dist.EASY * (1 - skew), 0.02),
      MEDIUM: Math.max(dist.MEDIUM, 0.02),
      HARD: Math.max(dist.HARD * (1 + skew), 0.02),
    };
    const sum = DIFFS.reduce((a, d) => a + mix[d], 0);
    for (const d of DIFFS) mix[d] /= sum;
    return mix;
  };

  const available: Record<Diff, number> = { EASY: 0, MEDIUM: 0, HARD: 0 };
  for (const prob of scoredProblems) {
    if (prob.difficulty in available) available[prob.difficulty as Diff]++;
  }

  const budgetTotal = totalWeeks * weeklyMinutes;
  let feasibleMinutes = budgetTotal;
  for (const d of DIFFS) {
    if (dist[d] > 0) {
      feasibleMinutes = Math.min(feasibleMinutes, (available[d] * timeMap[d]) / dist[d]);
    }
  }
  const scale = budgetTotal > 0 ? feasibleMinutes / budgetTotal : 0;

  let unlockedFloor = 0;

  for (let week = 1; week <= totalWeeks; week++) {
    const t = totalWeeks === 1 ? 0.5 : (week - 1) / (totalWeeks - 1);
    /*
     * The calendar says when a phase MAY open; supply says when it MUST.
     *
     * At 30h/week a beginner drains the Easy problems of phases 0-3 by week 11,
     * but phase 4 does not open on the calendar until week 15 — so weeks 12-14
     * came out with zero Easy problems and a Medium/Hard backfill, then Easy
     * snapped back. Opening the next phase early when the unlocked ones cannot
     * meet the week's demand keeps the mix smooth. It only ever opens phases
     * sooner, never out of order, and never goes backwards.
     */
    let unlocked = Math.max(unlockedPhase(t), unlockedFloor);
    const wantFor = (d: Diff) =>
      Math.round((weeklyMinutes * scale * rampedMix(t)[d]) / timeMap[d]);
    while (
      unlocked < lastPhase &&
      DIFFS.some((d) => remainingStock(unlocked, d) < wantFor(d))
    ) {
      unlocked++;
    }
    unlockedFloor = unlocked;

    const weights = phaseWeights(unlocked);
    const lane = (week - 1) % LANES;
    const mix = rampedMix(t);
    const budget = weeklyMinutes * scale;

    const weekProblems: RoadmapProblem[] = [];
    let remainingMinutes = weeklyMinutes;

    // Costliest difficulty first, so a tight week still gets its Hard problems.
    for (const diff of ["HARD", "MEDIUM", "EASY"] as const) {
      const timePerProblem = timeMap[diff];
      const want = Math.round((budget * mix[diff]) / timePerProblem);

      // Spread this difficulty's picks across the unlocked phases by weight,
      // so a beginner drills the pattern just introduced while an expert
      // covers every pattern in the same week.
      const perPhase: number[] = weights.map((w) => Math.floor(want * w));
      let assigned = perPhase.reduce((a, b) => a + b, 0);
      for (let i = weights.length - 1; i >= 0 && assigned < want; i--) {
        perPhase[i]++;
        assigned++;
      }

      const queue: number[] = [];
      for (let ph = 0; ph < perPhase.length; ph++) {
        for (let k = 0; k < perPhase[ph]; k++) queue.push(ph);
      }

      for (const targetPhase of queue) {
        if (remainingMinutes < timePerProblem) break;
        const problem = drawProblem(targetPhase, diff, unlocked, lane);
        if (!problem) break;
        weekProblems.push({
          problemId: problem.id,
          title: problem.title,
          titleSlug: problem.titleSlug,
          difficulty: problem.difficulty,
          acceptanceRate: problem.acceptanceRate,
          likes: problem.likes,
          tags: problem.tags,
          companies: [],
          estimatedMinutes: timePerProblem,
          weekNumber: week,
          order: 0,
        });
        remainingMinutes -= timePerProblem;
      }
    }

    // If a difficulty ran short within the taught phases, top the week up with
    // whatever those phases can still offer rather than reaching ahead.
    let spent = weekProblems.reduce((sum, p) => sum + p.estimatedMinutes, 0);
    let toppedUp = true;
    while (toppedUp && weeklyMinutes - spent >= timeMap.EASY) {
      toppedUp = false;
      for (const diff of ["MEDIUM", "EASY", "HARD"] as const) {
        if (spent + timeMap[diff] > budget) continue;
        const problem = drawProblem(unlocked, diff, unlocked, lane);
        if (!problem) continue;
        weekProblems.push({
          problemId: problem.id,
          title: problem.title,
          titleSlug: problem.titleSlug,
          difficulty: problem.difficulty,
          acceptanceRate: problem.acceptanceRate,
          likes: problem.likes,
          tags: problem.tags,
          companies: [],
          estimatedMinutes: timeMap[diff],
          weekNumber: week,
          order: 0,
        });
        spent += timeMap[diff];
        toppedUp = true;
        break;
      }
    }

    const diffOrder: Record<string, number> = { EASY: 0, MEDIUM: 1, HARD: 2 };
    weekProblems.sort((a, b) => (diffOrder[a.difficulty] ?? 1) - (diffOrder[b.difficulty] ?? 1));
    const balanced = balanceTopics(weekProblems);
    balanced.forEach((p, i) => { p.order = i + 1; });

    const totalEstimated = balanced.reduce((s, p) => s + p.estimatedMinutes, 0);

    roadmap.weeks.push({
      weekNumber: week,
      problems: balanced,
      totalEstimatedMinutes: totalEstimated,
    });

    roadmap.totalProblems += balanced.length;
    roadmap.totalEstimatedMinutes += totalEstimated;
  }

  const allPlanProblems = roadmap.weeks.flatMap((week) =>
    week.problems.map((p) => ({
      planId,
      problemId: p.problemId,
      weekNumber: p.weekNumber,
      order: p.order,
      status: "TODO" as const,
    }))
  );

  // Batch insert in a transaction
  // skipDuplicates makes a concurrent rebuild of the same plan harmless: two
  // interleaved runs would otherwise trip the (planId, problemId) unique index.
  await db.$transaction([
    db.planProblem.deleteMany({ where: { planId } }),
    db.planProblem.createMany({ data: allPlanProblems, skipDuplicates: true }),
  ]);

  return roadmap;
}