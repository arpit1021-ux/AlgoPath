import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  Plus,
  CheckCircle2,
  BookOpen,
  Flame,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  Play,
  RotateCcw,
} from "lucide-react";
import { ProgressBar, DifficultyBadge } from "@/components/ui-custom";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();

  const user = clerkId
    ? await db.user.findUnique({ where: { clerkId } })
    : null;

  const [plans, todayRevisions, todaySolvedCount] = user
    ? await Promise.all([
        db.plan.findMany({
          where: { userId: user.id, status: "ACTIVE" },
          select: {
            id: true,
            name: true,
            timelineWeeks: true,
            weeklyHours: true,
            createdAt: true,
            targetCompanies: {
              select: { company: { select: { name: true } } },
            },
            problems: {
              select: { id: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        db.revision.count({
          where: {
            userId: user.id,
            status: "PENDING",
            scheduledDate: { lte: new Date() },
          },
        }),
        db.planProblem.count({
          where: {
            plan: { userId: user.id, status: "ACTIVE" },
            status: "SOLVED",
            completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
      ])
    : [[], 0, 0];

  const allProblems = plans.flatMap((p) => p.problems);
  const totalSolved = allProblems.filter((p) => p.status === "SOLVED").length;
  const totalProblems = allProblems.length;
  const overallProgress =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  let todayProblemList: Array<{
    id: string;
    weekNumber: number;
    problem: { title: string; difficulty: string; titleSlug: string };
    plan: { id: string; name: string };
  }> = [];

  if (plans.length > 0 && user) {
    for (const plan of plans) {
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
      const weekProblems = await db.planProblem.findMany({
        where: {
          planId: plan.id,
          weekNumber: currentWeek,
          status: "TODO",
        },
        select: {
          id: true,
          weekNumber: true,
          problem: {
            select: { title: true, difficulty: true, titleSlug: true },
          },
          plan: { select: { id: true, name: true } },
        },
        orderBy: { order: "asc" },
        take: 6 - todayProblemList.length,
      });
      todayProblemList.push(...weekProblems);
      if (todayProblemList.length >= 6) break;
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card-surface p-8 relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-[#f0f0f5] mb-2">
            Welcome back, {clerkUser?.firstName || "there"}! <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm text-[#8b8d9e] max-w-lg mb-5">
            Track your interview preparation progress and stay on schedule with
            your personalized roadmap.
          </p>
          <Link
            href="/dashboard/plans/new"
            className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Plan
          </Link>
        </div>
        <Sparkles className="absolute right-8 top-1/2 -translate-y-1/2 w-20 h-20 text-[rgba(139,92,246,0.06)] -rotate-12" />
      </div>

      {todaySolvedCount > 0 && (
        <div className="rounded-xl p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
          <p className="text-sm font-medium text-orange-300">
            🔥 You&apos;re on a roll! {todaySolvedCount} problem{todaySolvedCount !== 1 ? "s" : ""} solved today. Keep it up!
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-surface-hover p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[#4b4d5e] uppercase tracking-wider">
              Problems Solved
            </span>
            <div className="w-9 h-9 rounded-lg bg-[rgba(52,211,153,0.08)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
            </div>
          </div>
          <div className="text-[28px] font-bold text-[#f0f0f5] tracking-tight">
            {totalSolved}
          </div>
          <p className="text-xs text-[#8b8d9e] mt-1">
            {totalProblems > 0
              ? `${totalProblems - totalSolved} remaining`
              : "Create a plan to start"}
          </p>
        </div>
        <div className="card-surface-hover p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[#4b4d5e] uppercase tracking-wider">
              Active Plans
            </span>
            <div className="w-9 h-9 rounded-lg bg-[rgba(59,130,246,0.08)] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#3b82f6]" />
            </div>
          </div>
          <div className="text-[28px] font-bold text-[#f0f0f5] tracking-tight">
            {plans.length}
          </div>
          <p className="text-xs text-[#8b8d9e] mt-1">
            {plans.length === 0
              ? "Create your first plan"
              : `${plans.length} in progress`}
          </p>
        </div>
        <div className="card-surface-hover p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[#4b4d5e] uppercase tracking-wider">
              Overall Progress
            </span>
            <div className="w-9 h-9 rounded-lg bg-[rgba(251,146,60,0.08)] flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#fb923c]" />
            </div>
          </div>
          <div className="text-[28px] font-bold text-[#f0f0f5] tracking-tight">
            {overallProgress}%
          </div>
          <ProgressBar value={overallProgress} className="mt-3" />
        </div>
        <div className="card-surface-hover p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-[#4b4d5e] uppercase tracking-wider">
              Today&apos;s Revisions
            </span>
            <div className="w-9 h-9 rounded-lg bg-[rgba(139,92,246,0.08)] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#8b5cf6]" />
            </div>
          </div>
          <div className="text-[28px] font-bold text-[#f0f0f5] tracking-tight">
            {todayRevisions}
          </div>
          <p className="text-xs text-[#8b8d9e] mt-1">
            {todayRevisions === 0 ? "No revisions due" : "Due today"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={plans.length > 0 ? `/dashboard/plans/${plans[0].id}` : "/dashboard/plans/new"}
          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
              <Play className="w-4 h-4 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#f0f0f5]">Continue Plan</p>
              <p className="text-xs text-[#8b8d9e]">Jump back in</p>
            </div>
          </div>
        </Link>
        <Link
          href="/dashboard/revisions"
          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(251,146,60,0.1)] flex items-center justify-center relative">
              <RotateCcw className="w-4 h-4 text-[#fb923c]" />
              {todayRevisions > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f97316] text-[8px] font-bold text-white flex items-center justify-center">
                  {todayRevisions}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#f0f0f5]">Today&apos;s Revisions</p>
              <p className="text-xs text-[#8b8d9e]">{todayRevisions > 0 ? `${todayRevisions} due` : "All clear"}</p>
            </div>
          </div>
        </Link>
        <Link
          href="/dashboard/plans/new"
          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[rgba(52,211,153,0.1)] flex items-center justify-center">
              <Plus className="w-4 h-4 text-[#34d399]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#f0f0f5]">Create New Plan</p>
              <p className="text-xs text-[#8b8d9e]">Fresh roadmap</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="card-surface overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#f0f0f5]">Today&apos;s Tasks</h3>
              <p className="text-xs text-[#8b8d9e]">
                Unsolved problems from your active plans
              </p>
            </div>
            <Clock className="w-5 h-5 text-[#8b8d9e]" />
          </div>
          <div className="divide-y divide-white/[0.04]">
            {todayProblemList.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-[#8b8d9e]" />
                </div>
                <p className="text-sm font-medium text-[#8b8d9e]">
                  No tasks for today
                </p>
                <p className="text-xs text-[#4b4d5e] mt-1 mb-4">
                  Create a plan to get started
                </p>
                <Link
                  href="/dashboard/plans/new"
                  className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Create Plan
                </Link>
              </div>
            ) : (
              <>
                {todayProblemList.map((pp) => (
                  <div
                    key={pp.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-[#1a1b26] transition-colors"
                  >
                    <div className="w-5 h-5 rounded-[5px] border-2 border-white/15 flex items-center justify-center shrink-0">
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={`https://leetcode.com/problems/${pp.problem.titleSlug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#f0f0f5] hover:underline truncate block"
                      >
                        {pp.problem.title}
                      </a>
                      <p className="text-[11px] text-[#4b4d5e] mt-0.5">
                        Week {pp.weekNumber}
                      </p>
                    </div>
                    <DifficultyBadge difficulty={pp.problem.difficulty} />
                  </div>
                ))}
                <Link
                  href="/dashboard/plans"
                  className="w-full px-6 py-3 text-xs font-medium text-[#8b5cf6] hover:underline text-left block"
                >
                  View all plans →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Plan Progress */}
        <div className="card-surface overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#f0f0f5]">Plan Progress</h3>
              <p className="text-xs text-[#8b8d9e]">
                Progress across your active plans
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#8b8d9e]" />
          </div>
          <div className="p-6 space-y-5">
            {plans.length === 0 ? (
              <p className="text-sm text-[#8b8d9e] text-center py-8">
                No active plans yet
              </p>
            ) : (
              plans.map((plan) => {
                const solved = plan.problems.filter(
                  (p) => p.status === "SOLVED"
                ).length;
                const total = plan.problems.length;
                const pct =
                  total > 0 ? Math.round((solved / total) * 100) : 0;
                return (
                  <div key={plan.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <Link
                        href={`/dashboard/plans/${plan.id}`}
                        className="font-medium text-[#f0f0f5] hover:underline truncate"
                      >
                        {plan.name}
                      </Link>
                      <span className="text-xs text-[#8b8d9e] ml-2 shrink-0">
                        {solved}/{total} · {pct}%
                      </span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Active Plans */}
      <div className="card-surface overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#f0f0f5]">Active Plans</h3>
            <p className="text-xs text-[#8b8d9e]">
              Your current preparation plans
            </p>
          </div>
          <Link
            href="/dashboard/plans/new"
            className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Plan
          </Link>
        </div>
        <div className="p-6">
          {plans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-[rgba(139,92,246,0.06)] flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-[#8b5cf6]" />
              </div>
              <h3 className="text-xl font-semibold text-[#f0f0f5] mb-2">
                No active plans
              </h3>
              <p className="text-sm text-[#8b8d9e] max-w-sm mx-auto mb-6">
                Create your first preparation plan to get a personalized
                roadmap
              </p>
              <Link
                href="/dashboard/plans/new"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Plan
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan) => {
                const solved = plan.problems.filter(
                  (p) => p.status === "SOLVED"
                ).length;
                const total = plan.problems.length;
                const pct =
                  total > 0 ? Math.round((solved / total) * 100) : 0;
                return (
                  <Link
                    key={plan.id}
                    href={`/dashboard/plans/${plan.id}`}
                  >
                    <div className="card-surface-hover p-5 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-sm text-[#f0f0f5] truncate pr-4">
                          {plan.name}
                        </h4>
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(52,211,153,0.08)] text-[#34d399] border border-[rgba(52,211,153,0.15)]">
                          ACTIVE
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#8b8d9e] mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {plan.timelineWeeks}w
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {plan.weeklyHours}h/w
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {plan.targetCompanies.slice(0, 3).map((tc) => (
                          <span
                            key={tc.company.name}
                            className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] text-[#8b8d9e]"
                          >
                            {tc.company.name}
                          </span>
                        ))}
                        {plan.targetCompanies.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[11px] text-[#4b4d5e]">
                            +{plan.targetCompanies.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#4b4d5e]">Progress</span>
                          <span className="font-medium text-[#8b8d9e]">
                            {solved}/{total} · {pct}%
                          </span>
                        </div>
                        <ProgressBar value={pct} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
