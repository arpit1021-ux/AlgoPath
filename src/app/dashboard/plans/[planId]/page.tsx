"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  SkipForward,
  RotateCcw,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PlanProblem {
  id: string;
  weekNumber: number;
  order: number;
  status: string;
  timeSpentMinutes: number;
  problem: {
    id: string;
    title: string;
    titleSlug: string;
    difficulty: string;
    acceptanceRate: number;
    likes: number;
    url: string;
    tags: Array<{ name: string }>;
    companies: Array<{ company: { name: string } }>;
  };
  revisions: Array<{ status: string; scheduledDate: string }>;
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  experienceLevel: string;
  timelineWeeks: number;
  weeklyHours: number;
  difficultyPreference: string;
  status: string;
  targetCompanies: Array<{ company: { name: string; slug: string } }>;
  selectedTags: Array<{ tag: { name: string } }>;
  problems: PlanProblem[];
}

const DIFF_COLORS: Record<string, string> = {
  EASY:   "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HARD:   "bg-red-100 text-red-700 border-red-200",
};

export default function PlanDetailPage() {
  const params = useParams();
  const planId = params.planId as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [loading, setLoading] = useState(true);
  const [activeTopicFilter, setActiveTopicFilter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/plans/${planId}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setPlan(data.plan); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planId]);

  const updateProblemStatus = async (planProblemId: string, status: string) => {
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        problems: prev.problems.map((p) =>
          p.id === planProblemId ? { ...p, status } : p
        ),
      };
    });
    try {
      const res = await fetch(`/api/plans/${planId}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planProblemId, status }),
      });
      if (!res.ok) {
        fetch(`/api/plans/${planId}`).then((r) => r.json()).then((d) => setPlan(d.plan));
      }
    } catch {
      fetch(`/api/plans/${planId}`).then((r) => r.json()).then((d) => setPlan(d.plan));
    }
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week); else next.add(week);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">Loading plan...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Plan not found</h2>
        <Link href="/dashboard/plans" className="mt-4 inline-block">
          <Button>Back to Plans</Button>
        </Link>
      </div>
    );
  }

  const totalProblems = plan.problems.length;
  const solvedProblems = plan.problems.filter((p) => p.status === "SOLVED").length;
  const completionRate = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  // Topic distribution
  const topicCounts: Record<string, { total: number; solved: number }> = {};
  plan.problems.forEach((pp) => {
    pp.problem.tags.forEach((t) => {
      if (!topicCounts[t.name]) topicCounts[t.name] = { total: 0, solved: 0 };
      topicCounts[t.name].total++;
      if (pp.status === "SOLVED") topicCounts[t.name].solved++;
    });
  });
  const topicsSorted = Object.entries(topicCounts).sort((a, b) => b[1].total - a[1].total);

  // Difficulty breakdown
  const diffCounts = { EASY: 0, MEDIUM: 0, HARD: 0 };
  plan.problems.forEach((p) => {
    const d = p.problem.difficulty as keyof typeof diffCounts;
    if (d in diffCounts) diffCounts[d]++;
  });

  const problemsByWeek = plan.problems.reduce((acc, p) => {
    if (!acc[p.weekNumber]) acc[p.weekNumber] = [];
    acc[p.weekNumber].push(p);
    return acc;
  }, {} as Record<number, PlanProblem[]>);

  const filteredProblems = (problems: PlanProblem[]) =>
    activeTopicFilter
      ? problems.filter((p) => p.problem.tags.some((t) => t.name === activeTopicFilter))
      : problems;

  return (
    <div className="flex gap-0 min-h-screen -mx-6 -mt-6">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-72 shrink-0 border-r bg-card sticky top-0 h-screen overflow-y-auto p-5 space-y-6">

        {/* Plan name + status */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold truncate">{plan.name}</h1>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs shrink-0">
              {plan.status}
            </Badge>
          </div>
          {plan.description && (
            <p className="text-xs text-muted-foreground">{plan.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{solvedProblems}/{totalProblems}</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <p className="text-xs text-muted-foreground">{completionRate}% complete</p>
        </div>

        {/* Config */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">{plan.timelineWeeks} weeks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Weekly hours</span>
            <span className="font-medium">{plan.weeklyHours}h</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Level</span>
            <span className="font-medium capitalize">{plan.experienceLevel.toLowerCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Difficulty</span>
            <span className="font-medium capitalize">
              {plan.difficultyPreference.replace(/_/g, " ").toLowerCase()}
            </span>
          </div>
        </div>

        {/* Difficulty breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Problem Pool
          </p>
          <div className="space-y-1.5">
            {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
              <div key={d} className="flex items-center justify-between text-xs">
                <span className={cn("px-2 py-0.5 rounded-full border font-medium", DIFF_COLORS[d])}>
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </span>
                <span className="text-muted-foreground">{diffCounts[d]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Target companies */}
        {plan.targetCompanies.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Companies
            </p>
            <div className="flex flex-wrap gap-1">
              {plan.targetCompanies.map((tc) => (
                <Badge key={tc.company.slug} variant="secondary" className="text-xs">
                  {tc.company.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          <Link href={`/dashboard/plans/${planId}/analytics`} className="block">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href={`/dashboard/plans/${planId}/revisions`} className="block">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <RotateCcw className="h-4 w-4 mr-2" />
              Revisions
            </Button>
          </Link>
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Topic distribution bar */}
        <div className="bg-card border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Topic Distribution
            </p>
            <span className="text-xs font-semibold text-primary">
              {solvedProblems} / {totalProblems} SOLVED
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {topicsSorted.slice(0, 15).map(([topic, counts]) => (
              <button
                key={topic}
                onClick={() => setActiveTopicFilter(activeTopicFilter === topic ? null : topic)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors",
                  activeTopicFilter === topic
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 hover:bg-muted border-border text-foreground"
                )}
              >
                {topic}
                <span className={cn(
                  "text-xs",
                  activeTopicFilter === topic ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {counts.total}
                </span>
              </button>
            ))}
            {activeTopicFilter && (
              <button
                onClick={() => setActiveTopicFilter(null)}
                className="px-2.5 py-1 rounded-full border text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                Clear filter ✕
              </button>
            )}
          </div>

          {/* Total progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total Progress</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-1.5" />
          </div>
        </div>

        {/* Week blocks */}
        <div className="space-y-3">
          {Object.entries(problemsByWeek)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([week, problems]) => {
              const weekNum = Number(week);
              const visible = filteredProblems(problems);
              const weekSolved = problems.filter((p) => p.status === "SOLVED").length;
              const weekTotal = problems.length;
              const isExpanded = expandedWeeks.has(weekNum);

              return (
                <div key={week} className="bg-card border rounded-xl overflow-hidden">
                  {/* Week header */}
                  <button
                    onClick={() => toggleWeek(weekNum)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-base">Week {weekNum}</h3>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={weekTotal > 0 ? (weekSolved / weekTotal) * 100 : 0}
                          className="w-24 h-1.5"
                        />
                        <span className="text-xs text-muted-foreground">
                          {weekSolved}/{weekTotal}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {visible.length !== problems.length && `${visible.length} shown · `}
                        {weekTotal} problems
                      </span>
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                  </button>

                  {/* Problem list */}
                  {isExpanded && (
                    <div className="border-t divide-y">
                      {visible.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          No problems match this topic filter.
                        </p>
                      ) : (
                        visible.map((pp) => (
                          <div
                            key={pp.id}
                            className={cn(
                              "flex items-center gap-4 px-5 py-3.5 transition-colors",
                              pp.status === "SOLVED"
                                ? "bg-green-500/5"
                                : pp.status === "ATTEMPTED"
                                ? "bg-yellow-500/5"
                                : "hover:bg-muted/30"
                            )}
                          >
                            {/* Checkbox-style solve toggle */}
                            <button
                              onClick={() =>
                                updateProblemStatus(pp.id, pp.status === "SOLVED" ? "TODO" : "SOLVED")
                              }
                              className={cn(
                                "h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                                pp.status === "SOLVED"
                                  ? "bg-green-500 border-green-500 text-white"
                                  : "border-muted-foreground/30 hover:border-green-500"
                              )}
                            >
                              {pp.status === "SOLVED" && (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* Problem info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-6 shrink-0">
                                  #{pp.order}
                                </span>
                                <a
                                  href={`https://leetcode.com/problems/${pp.problem.titleSlug}/`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "font-medium text-sm hover:underline truncate",
                                    pp.status === "SOLVED" && "line-through text-muted-foreground"
                                  )}
                                >
                                  {pp.problem.title}
                                </a>
                                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                              </div>
                              <div className="flex items-center gap-2 mt-1 ml-8">
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full border font-medium",
                                  DIFF_COLORS[pp.problem.difficulty] ?? "bg-muted"
                                )}>
                                  {pp.problem.difficulty.charAt(0) + pp.problem.difficulty.slice(1).toLowerCase()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {pp.problem.acceptanceRate.toFixed(1)}% accepted
                                </span>
                                {pp.problem.tags.slice(0, 2).map((t) => (
                                  <span key={t.name} className="text-xs text-muted-foreground">
                                    · {t.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Right side: company badges + action buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {pp.problem.companies.slice(0, 2).map((c) => (
                                <Badge key={c.company.name} variant="outline" className="text-xs hidden sm:flex">
                                  {c.company.name}
                                </Badge>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title="Mark attempted"
                                onClick={() => updateProblemStatus(pp.id, "ATTEMPTED")}
                              >
                                <Clock className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                title="Skip"
                                onClick={() => updateProblemStatus(pp.id, "SKIPPED")}
                              >
                                <SkipForward className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </main>
    </div>
  );
}