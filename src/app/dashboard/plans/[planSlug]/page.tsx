import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Play,
  BarChart3,
  RotateCcw,
  ChevronRight,
  Flame,
} from "lucide-react";
import { ProgressBar, DifficultyBadge } from "@/components/ui-custom";
import { cn } from "@/lib/utils";

export default async function PlanDashboardPage({
  params,
}: {
  params: Promise<{ planSlug: string }>;
}) {
  const { planSlug } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/login");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/login");

  let plan = await db.plan.findFirst({
    where: { slug: planSlug, userId: user.id, deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      experienceLevel: true,
      timelineWeeks: true,
      weeklyHours: true,
      createdAt: true,
      targetCompanies: {
        select: { company: { select: { name: true } } },
      },
      problems: {
        select: {
          id: true,
          weekNumber: true,
          order: true,
          status: true,
          problem: {
            select: {
              title: true,
              titleSlug: true,
              difficulty: true,
            },
          },
        },
        orderBy: [{ weekNumber: "asc" }, { order: "asc" }],
      },
    },
  });

  if (!plan) {
    plan = await db.plan.findFirst({
      where: { id: planSlug, userId: user.id, deletedAt: null },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        experienceLevel: true,
        timelineWeeks: true,
        weeklyHours: true,
        createdAt: true,
        targetCompanies: {
          select: { company: { select: { name: true } } },
        },
        problems: {
          select: {
            id: true,
            weekNumber: true,
            order: true,
            status: true,
            problem: {
              select: {
                title: true,
                titleSlug: true,
                difficulty: true,
              },
            },
          },
          orderBy: [{ weekNumber: "asc" }, { order: "asc" }],
        },
      },
    });
  }

  if (!plan) redirect("/dashboard");

  const totalProblems = plan.problems.length;
  const solvedProblems = plan.problems.filter((p) => p.status === "SOLVED").length;
  const attemptedProblems = plan.problems.filter((p) => p.status === "ATTEMPTED").length;
  const overallProgress = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  const currentWeek = Math.min(
    Math.max(
      Math.ceil(
        (Date.now() - new Date(plan.createdAt).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      ),
      1
    ),
    plan.timelineWeeks
  );

  const weekProblems = plan.problems.filter((p) => p.weekNumber === currentWeek);
  const weekSolved = weekProblems.filter((p) => p.status === "SOLVED").length;
  const weekTotal = weekProblems.length;
  const weekProgress = weekTotal > 0 ? Math.round((weekSolved / weekTotal) * 100) : 0;

  const todayProblems = weekProblems
    .filter((p) => p.status === "TODO" || p.status === "ATTEMPTED")
    .slice(0, 6);

  const diffCounts: Record<string, { total: number; solved: number }> = {
    EASY: { total: 0, solved: 0 },
    MEDIUM: { total: 0, solved: 0 },
    HARD: { total: 0, solved: 0 },
  };
  plan.problems.forEach((p) => {
    const d = p.problem.difficulty;
    if (d in diffCounts) {
      diffCounts[d].total++;
      if (p.status === "SOLVED") diffCounts[d].solved++;
    }
  });

  const planAgeMs = Date.now() - new Date(plan.createdAt).getTime();
  const planAgeDays = planAgeMs / (1000 * 60 * 60 * 24);
  const planAgeWeeks = planAgeDays / 7;
  const expectedSolvedByNow = Math.floor(
    (planAgeWeeks / plan.timelineWeeks) * totalProblems
  );
  const paceDiff = solvedProblems - expectedSolvedByNow;
  const showPace = planAgeDays >= 1 && solvedProblems > 0;

  const paceBanner = (() => {
    if (!showPace) return null;

    if (paceDiff >= 5) {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: "var(--success-dim)", border: "1px solid var(--success)" }}>
          <span className="text-2xl shrink-0">🚀</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--success)" }}>
              {paceDiff} problems ahead of schedule!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              At this pace you'll finish {Math.round(paceDiff / (totalProblems / plan.timelineWeeks / 7))} days early.
            </p>
          </div>
        </div>
      );
    } else if (paceDiff >= 0) {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <span className="text-2xl shrink-0">⚡</span>
          <p className="font-semibold text-sm" style={{ color: "var(--accent-text)" }}>
            On track — {solvedProblems} problems solved, right on schedule.
          </p>
        </div>
      );
    } else if (paceDiff >= -5) {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: "var(--warning-dim)", border: "1px solid var(--warning)" }}>
          <span className="text-2xl shrink-0">⏰</span>
          <p className="font-semibold text-sm" style={{ color: "var(--warning)" }}>
            {Math.abs(paceDiff)} problems behind schedule. Solve {Math.abs(paceDiff)} more to catch up.
          </p>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: "var(--danger-dim)", border: "1px solid var(--danger)" }}>
          <span className="text-2xl shrink-0">📅</span>
          <p className="font-semibold text-sm" style={{ color: "var(--danger)" }}>
            {Math.abs(paceDiff)} problems behind. Consider increasing daily practice time.
          </p>
        </div>
      );
    }
  })();

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="p-6 relative overflow-hidden group" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{plan.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(52,211,153,0.08)] text-[#34d399] border border-[rgba(52,211,153,0.15)]">
              {plan.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {plan.timelineWeeks} weeks
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {plan.weeklyHours}h/week
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {plan.experienceLevel.toLowerCase()}
            </span>
            {plan.targetCompanies.length > 0 && (
              <span className="flex items-center gap-1.5">
                {plan.targetCompanies.slice(0, 3).map((tc) => (
                  <span
                    key={tc.company.name}
                    className="px-2 py-0.5 rounded-full text-[11px]"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                  >
                    {tc.company.name}
                  </span>
                ))}
                {plan.targetCompanies.length > 3 && (
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    +{plan.targetCompanies.length - 3}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-start justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Solved
            </span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(52,211,153,0.08)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{solvedProblems}</div>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {totalProblems - solvedProblems} remaining
          </p>
        </div>
        <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(251,146,60,0.08)] flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#fb923c]" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{attemptedProblems}</div>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>attempted</p>
        </div>
        <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Overall
            </span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(139,92,246,0.08)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#8b5cf6]" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{overallProgress}%</div>
          <ProgressBar value={overallProgress} className="mt-2" />
        </div>
        <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Week {currentWeek}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(59,130,246,0.08)] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#3b82f6]" />
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{weekProgress}%</div>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {weekSolved}/{weekTotal} this week
          </p>
        </div>
      </div>

      {/* Pace Tracker */}
      {paceBanner}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href={`/dashboard/plans/${plan.slug}/roadmap`}
          className="rounded-xl p-4 hover:bg-[var(--accent)] transition-all cursor-pointer"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
              <Play className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Roadmap</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Week-by-week</p>
            </div>
          </div>
        </Link>
        <Link
              href={`/dashboard/plans/${plan.slug}/analytics`}
          className="rounded-xl p-4 hover:bg-[var(--accent)] transition-all cursor-pointer"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Analytics</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Insights</p>
            </div>
          </div>
        </Link>
        <Link
              href={`/dashboard/plans/${plan.slug}/revisions`}
          className="rounded-xl p-4 hover:bg-[var(--accent)] transition-all cursor-pointer"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(251,146,60,0.1)] flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-[#fb923c]" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Revisions</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Spaced repetition</p>
            </div>
          </div>
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl p-4 hover:bg-[var(--accent)] transition-all cursor-pointer"
          style={{ border: "1px solid var(--border)", background: "var(--bg-card)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(52,211,153,0.1)] flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-[#34d399] -rotate-180" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>All Plans</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Back to hub</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Today's Tasks + Difficulty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Week {currentWeek} Tasks
              </h3>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Unsolved problems from current week
              </p>
            </div>
            <Link
              href={`/dashboard/plans/${plan.slug}/roadmap`}
              className="text-xs hover:underline"
              style={{ color: "var(--accent-text)" }}
            >
              View full roadmap
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {todayProblems.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-[#34d399]" />
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  All caught up!
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  No unsolved problems this week
                </p>
              </div>
            ) : (
              <>
                {todayProblems.map((pp) => (
                  <div
                    key={pp.id}
                    className="flex items-center gap-3 px-6 py-3 transition-colors"
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-[5px] border-2 flex items-center justify-center shrink-0",
                      pp.status === "ATTEMPTED"
                        ? "border-[#fb923c] bg-[rgba(251,146,60,0.1)]"
                        : "border-white/15"
                    )}>
                      {pp.status === "ATTEMPTED" && (
                        <span className="w-2 h-2 rounded-full bg-[#fb923c]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`https://leetcode.com/problems/${pp.problem.titleSlug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline truncate block"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {pp.problem.title}
                      </a>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        #{pp.order}
                      </p>
                    </div>
                    <DifficultyBadge difficulty={pp.problem.difficulty} />
                  </div>
                ))}
                {weekProblems.length > 6 && (
                  <Link
                    href={`/dashboard/plans/${plan.slug}/roadmap`}
                    className="w-full px-6 py-3 text-xs font-medium text-[#8b5cf6] hover:underline text-left block"
                  >
                    View all {weekTotal} problems →
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Difficulty</h3>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Problem pool breakdown</p>
          </div>
          <div className="p-6 space-y-4">
            {(["EASY", "MEDIUM", "HARD"] as const).map((d) => {
              const { total, solved } = diffCounts[d];
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
              const colors = {
                EASY: { text: "text-[#34d399]", bar: "bg-[#34d399]" },
                MEDIUM: { text: "text-[#fbbf24]", bar: "bg-[#fbbf24]" },
                HARD: { text: "text-[#f87171]", bar: "bg-[#f87171]" },
              };
              return (
                <div key={d} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-medium", colors[d].text)}>
                      {d.charAt(0) + d.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {solved}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div
                      className={cn("h-full rounded-full", colors[d].bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Total</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{totalProblems} problems</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Duration</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{plan.timelineWeeks} weeks</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Pace</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {plan.timelineWeeks > 0 ? Math.ceil(totalProblems / plan.timelineWeeks) : 0}/week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
