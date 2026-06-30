"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/toast";
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  RotateCcw,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
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
  notes?: Array<{ content: string }>;
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
  createdAt: string;
  targetCompanies: Array<{ company: { name: string; slug: string } }>;
  selectedTags: Array<{ tag: { name: string } }>;
  problems: PlanProblem[];
}

const DIFF_COLORS: Record<string, string> = {
  EASY:   "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HARD:   "bg-red-100 text-red-700 border-red-200",
};

export default function PlanRoadmapPage() {
  const params = useParams();
  const planSlug = params.planSlug as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [loading, setLoading] = useState(true);
  const [activeTopicFilter, setActiveTopicFilter] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [celebrationWeek, setCelebrationWeek] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/plans/${planSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const fetchedPlan = data.plan;
          setPlan(fetchedPlan);
          if (fetchedPlan) {
            const currentWeek = Math.min(
              Math.max(
                Math.ceil(
                  (Date.now() - new Date(fetchedPlan.createdAt).getTime()) /
                    (7 * 24 * 60 * 60 * 1000)
                ),
                1
              ),
              fetchedPlan.timelineWeeks
            );
            setExpandedWeeks(new Set([currentWeek]));
          }
        }
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planSlug]);

  const updateProblemStatus = async (planProblemId: string, status: string, weekNumber: number) => {
    setPlan((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        problems: prev.problems.map((p) =>
          p.id === planProblemId ? { ...p, status } : p
        ),
      };

      if (status === "SOLVED") {
        const weekProblems = updated.problems.filter(
          (p) => p.weekNumber === weekNumber
        );
        const allSolved = weekProblems.every((p) => p.status === "SOLVED");
        if (allSolved && weekProblems.length > 0) {
          setTimeout(() => setCelebrationWeek(weekNumber), 300);
        }
      }

      return updated;
    });
    try {
      const res = await fetch(`/api/plans/${planSlug}/problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planProblemId, status }),
      });
      if (res.status === 429) {
        const data = await res.json();
        showToast({ type: "error", message: data.message || "Too many requests. Please slow down." });
        fetch(`/api/plans/${planSlug}`).then((r) => r.json()).then((d) => setPlan(d.plan));
        return;
      }
      if (!res.ok) {
        fetch(`/api/plans/${planSlug}`).then((r) => r.json()).then((d) => setPlan(d.plan));
      }
    } catch {
      fetch(`/api/plans/${planSlug}`).then((r) => r.json()).then((d) => setPlan(d.plan));
    }
  };

  const [markingAll, setMarkingAll] = useState<number | null>(null);
  const markAllSolved = async (weekProblems: PlanProblem[]) => {
    const weekNum = weekProblems[0]?.weekNumber ?? null;
    if (weekNum === null) return;
    const unsolved = weekProblems.filter((p) => p.status !== "SOLVED");
    if (unsolved.length === 0) return;

    setMarkingAll(weekNum);

    const idsToUpdate = new Set(unsolved.map((p) => p.id));
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        problems: prev.problems.map((p) =>
          idsToUpdate.has(p.id) ? { ...p, status: "SOLVED" } : p
        ),
      };
    });

    setTimeout(() => setCelebrationWeek(weekNum), 300);

    try {
      const planId = plan!.id;
      const res = await fetch(`/api/plans/${planId}/problems/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planProblemIds: Array.from(idsToUpdate),
          status: "SOLVED",
        }),
      });

      if (!res.ok) {
        fetch(`/api/plans/${planSlug}`)
          .then((r) => r.json())
          .then((d) => setPlan(d.plan));
        showToast({ type: "error", message: "Failed to mark all as solved." });
      } else {
        showToast({ type: "success", message: `${unsolved.length} problems marked solved!` });
      }
    } catch {
      fetch(`/api/plans/${planSlug}`)
        .then((r) => r.json())
        .then((d) => setPlan(d.plan));
      showToast({ type: "error", message: "Something went wrong." });
    } finally {
      setMarkingAll(null);
    }
  };

  const saveNote = async (planProblemId: string, content: string) => {
    setNotesMap((prev) => ({ ...prev, [planProblemId]: content }));
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planProblemId, content }),
      });
    } catch (e) {
      console.error("Failed to save note", e);
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
      <div className="space-y-4 p-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-white/5" />
        <div className="h-32 rounded-xl bg-white/5" />
        <div className="h-32 rounded-xl bg-white/5" />
        <div className="h-32 rounded-xl bg-white/5" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Plan not found</h2>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button>Back to Plans</Button>
        </Link>
      </div>
    );
  }

  const totalProblems = plan.problems.length;
  const solvedProblems = plan.problems.filter((p) => p.status === "SOLVED").length;
  const completionRate = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

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

  const topicCounts: Record<string, { total: number; solved: number }> = {};
  plan.problems.forEach((pp) => {
    pp.problem.tags.forEach((t) => {
      if (!topicCounts[t.name]) topicCounts[t.name] = { total: 0, solved: 0 };
      topicCounts[t.name].total++;
      if (pp.status === "SOLVED") topicCounts[t.name].solved++;
    });
  });
  const topicsSorted = Object.entries(topicCounts).sort((a, b) => b[1].total - a[1].total);

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

  const ESTIMATED_TIME: Record<string, Record<string, number>> = {
    BEGINNER:     { EASY: 35, MEDIUM: 55, HARD: 80 },
    INTERMEDIATE: { EASY: 25, MEDIUM: 40, HARD: 60 },
    EXPERT:       { EASY: 15, MEDIUM: 28, HARD: 45 },
  };
  const weekEstimatedTime = (problems: PlanProblem[]) => {
    const timeMap = ESTIMATED_TIME[plan.experienceLevel] ?? ESTIMATED_TIME.INTERMEDIATE;
    const totalMinutes = problems.reduce((sum, p) => sum + (timeMap[p.problem.difficulty] ?? 30), 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hours > 0 ? `~${hours}h ${mins}m` : `~${mins}m`;
  };

  const weekDiffDots = (problems: PlanProblem[]) => {
    const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
    problems.forEach((p) => {
      const d = p.problem.difficulty as keyof typeof counts;
      if (d in counts) counts[d]++;
    });
    return counts;
  };

  return (
      <div className="flex flex-col lg:flex-row gap-0 min-h-screen -mx-6 -mt-6">
      <aside
        className="shrink-0 overflow-y-auto transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen flex lg:flex-col overflow-x-auto lg:overflow-x-hidden"
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
          width: sidebarOpen ? undefined : 56,
          padding: sidebarOpen ? 20 : 8,
          gap: sidebarOpen ? 24 : 16,
        }}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex w-full items-center justify-center p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-input-hover)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <div>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/dashboard/plans/${planSlug}`} className="text-lg font-bold truncate whitespace-nowrap hover:text-primary transition-colors">
                  {plan.name}
                </Link>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs shrink-0">
                  {plan.status}
                </Badge>
              </div>
              {plan.description && (
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              )}
            </>
          ) : (
            <div className="flex justify-center">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="space-y-2 hidden lg:block">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{solvedProblems}/{totalProblems}</span>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">{completionRate}% complete</p>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Week {currentWeek} of {plan.timelineWeeks}
            </div>
          </div>
        )}

        {sidebarOpen && (
          <div className="space-y-3 text-sm hidden lg:block">
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
        )}

        {sidebarOpen && (
          <div className="space-y-2 hidden lg:block">
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
        )}

        {sidebarOpen && plan.targetCompanies.length > 0 && (
          <div className="space-y-2 hidden lg:block">
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

        {sidebarOpen && (
          <div className="space-y-2 pt-2 hidden lg:block">
            <Link href={`/dashboard/plans/${planSlug}`} className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href={`/dashboard/plans/${planSlug}/analytics`} className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href={`/dashboard/plans/${planSlug}/revisions`} className="block">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <RotateCcw className="h-4 w-4 mr-2" />
                Revisions
              </Button>
            </Link>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6" style={{ background: "var(--bg-primary)" }}>
        <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Topic Distribution
            </p>
            <span className="text-xs font-semibold" style={{ color: "var(--accent-text)" }}>
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
                    : "hover:bg-[var(--bg-input-hover)] border-border text-foreground"
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
                className="px-2.5 py-1 rounded-full border text-xs hover:bg-[var(--bg-input-hover)] transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Clear filter ✕
              </button>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Total Progress</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-1.5" />
          </div>
        </div>

        <p className="text-xs" style={{ color: "var(--text-placeholder)" }}>
          Tip: Click any topic pill to filter problems by topic
        </p>

        {(() => {
          if (!plan.createdAt) return null;
          
          const planAgeMs = Date.now() - new Date(plan.createdAt).getTime();
          const planAgeDays = planAgeMs / (1000 * 60 * 60 * 24);
          const planAgeWeeks = planAgeDays / 7;
          
          const totalP = plan.problems.length;
          const expectedSolvedByNow = Math.floor(
            (planAgeWeeks / plan.timelineWeeks) * totalP
          );
          const actualSolved = plan.problems.filter(p => p.status === "SOLVED").length;
          const diff = actualSolved - expectedSolvedByNow;
          
          if (planAgeDays < 1 || actualSolved === 0) return null;
          
          if (diff >= 5) {
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm mb-2">
                <span className="text-xl">🚀</span>
                <div>
                  <span className="text-green-400 font-semibold">
                    {diff} problems ahead of schedule!
                  </span>
                  <span className="text-green-300/60 ml-2">
                    At this pace you'll finish {Math.round(diff / (totalP / plan.timelineWeeks / 7))} days early.
                  </span>
                </div>
              </div>
            );
          } else if (diff >= 0) {
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm mb-2">
                <span className="text-xl">⚡</span>
                <span className="text-blue-400 font-semibold">
                  On track — {actualSolved} problems solved, right on schedule.
                </span>
              </div>
            );
          } else if (diff >= -5) {
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm mb-2">
                <span className="text-xl">⏰</span>
                <span className="text-yellow-400 font-semibold">
                  {Math.abs(diff)} problems behind schedule. Solve {Math.abs(diff)} more to catch up.
                </span>
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm mb-2">
                <span className="text-xl">📅</span>
                <span className="text-red-400 font-semibold">
                  {Math.abs(diff)} problems behind. Consider increasing daily practice time.
                </span>
              </div>
            );
          }
        })()}

        <div className="space-y-3">
          {Object.entries(problemsByWeek)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([week, problems]) => {
              const weekNum = Number(week);
              const visible = filteredProblems(problems);
              const weekSolved = problems.filter((p) => p.status === "SOLVED").length;
              const weekTotal = problems.length;
              const isExpanded = expandedWeeks.has(weekNum);
              const isCurrentWeek = weekNum === currentWeek;
              const dots = weekDiffDots(problems);

              return (
                <div key={week} id={`week-${weekNum}`} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: isCurrentWeek ? "1px solid var(--accent-border)" : "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                  <button
                    onClick={() => toggleWeek(weekNum)}
                    className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-input-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">Week {weekNum}</h3>
                        {isCurrentWeek && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "var(--accent-dim)", color: "var(--accent-text)" }}>
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={weekTotal > 0 ? (weekSolved / weekTotal) * 100 : 0}
                          className="w-24 h-1.5"
                        />
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {weekSolved}/{weekTotal}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {dots.EASY > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {dots.EASY}
                          </span>
                        )}
                        {dots.MEDIUM > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            {dots.MEDIUM}
                          </span>
                        )}
                        {dots.HARD > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {dots.HARD}
                          </span>
                        )}
                      </div>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {weekEstimatedTime(problems)} estimated
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {visible.length !== problems.length && `${visible.length} shown · `}
                        {weekTotal} problems
                      </span>
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                        : <ChevronDown className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                      }
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {visible.length === 0 ? (
                        <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
                          No problems match this topic filter.
                        </p>
                      ) : (
                        visible.map((pp) => (
                          <div key={pp.id}>
                            <div
                              className="flex items-center gap-4 px-5 py-3.5"
                              style={{
                                background: pp.status === "SOLVED" ? "var(--success-dim)" : pp.status === "ATTEMPTED" ? "var(--warning-dim)" : "transparent",
                                borderLeft: pp.status === "SOLVED" ? "4px solid var(--success)" : "none",
                              }}
                            >
                              <button
                                onClick={() =>
                                  updateProblemStatus(pp.id, pp.status === "SOLVED" ? "TODO" : "SOLVED", pp.weekNumber)
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

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs w-6 shrink-0" style={{ color: "var(--text-muted)" }}>
                                    #{pp.order}
                                  </span>
                                  <a
                                    href={`https://leetcode.com/problems/${pp.problem.titleSlug}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-sm hover:underline truncate"
                                    style={{ color: pp.status === "SOLVED" ? "var(--text-muted)" : "var(--text-primary)", opacity: pp.status === "SOLVED" ? 0.5 : 1, textDecoration: pp.status === "SOLVED" ? "line-through" : "none" }}
                                  >
                                    {pp.problem.title}
                                  </a>
                                  <ExternalLink className="h-3 w-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                                </div>
                                <div className="flex items-center gap-2 mt-1 ml-8">
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full border font-medium",
                                    DIFF_COLORS[pp.problem.difficulty] ?? "bg-muted"
                                  )}>
                                    {pp.problem.difficulty.charAt(0) + pp.problem.difficulty.slice(1).toLowerCase()}
                                  </span>
                                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    {pp.problem.acceptanceRate.toFixed(1)}% accepted
                                  </span>
                                  {pp.problem.tags.slice(0, 2).map((t) => (
                                    <span key={t.name} className="text-xs" style={{ color: "var(--text-muted)" }}>
                                      · {t.name}
                                    </span>
                                  ))}
                                </div>
                              </div>

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
                                  onClick={() => updateProblemStatus(pp.id, "ATTEMPTED", pp.weekNumber)}
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 relative"
                                  title="Notes"
                                  onClick={() => setExpandedNotes(expandedNotes === pp.id ? null : pp.id)}
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  {pp.notes && pp.notes.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            {expandedNotes === pp.id && (
                              <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
                                <textarea
                                  defaultValue={notesMap[pp.id] ?? pp.notes?.[0]?.content ?? ""}
                                  onBlur={(e) => saveNote(pp.id, e.target.value)}
                                  rows={3}
                                  placeholder="Add notes for this problem..."
                                  className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
                                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                                />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      {visible.length > 0 && visible.some((p) => p.status !== "SOLVED") && (
                        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
                          <button
                            onClick={() => markAllSolved(problems)}
                            disabled={markingAll === weekNum}
                            className="text-xs font-medium disabled:opacity-50"
                            style={{ color: "var(--accent-text)" }}
                          >
                            {markingAll === weekNum ? "Marking..." : "Mark All Solved"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </main>

      {celebrationWeek !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          {/* Shower confetti — full screen falling pieces */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(40)].map((_, i) => {
              const colors = ["#7c3aed","#2563eb","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4","#f97316"];
              const shapes = ["50%", "2px", "0"];
              return (
                <div
                  key={`shower-${i}`}
                  className="confetti-shower-piece"
                  style={{
                    "--x": `${Math.random() * 100}%`,
                    "--color": colors[i % colors.length],
                    "--w": `${6 + Math.random() * 10}px`,
                    "--h": `${6 + Math.random() * 10}px`,
                    "--radius": shapes[i % shapes.length],
                    "--duration": `${2 + Math.random() * 2}s`,
                    "--delay": `${Math.random() * 0.8}s`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>

          {/* Burst confetti — centered explosion */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => {
              const angle = (i / 30) * 360;
              const distance = 80 + Math.random() * 180;
              const tx = Math.cos((angle * Math.PI) / 180) * distance;
              const ty = Math.sin((angle * Math.PI) / 180) * distance;
              const colors = ["#7c3aed","#2563eb","#10b981","#f59e0b","#ef4444","#ec4899","#8b5cf6","#06b6d4"];
              const sizes = ["50%", "30%", "10%"];
              return (
                <div
                  key={`burst-${i}`}
                  className="confetti-particle"
                  style={{
                    left: "50%",
                    top: "40%",
                    "--tx": `${tx}px`,
                    "--ty": `${ty}px`,
                    "--color": colors[i % colors.length],
                    "--size": `${4 + Math.random() * 8}px`,
                    "--radius": sizes[i % sizes.length],
                    "--duration": `${1.5 + Math.random() * 1}s`,
                    "--delay": `${Math.random() * 0.3}s`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>

          {/* Expanding rings behind modal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="celebration-ring w-32 h-32" />
            <div className="celebration-ring w-32 h-32" style={{ animationDelay: "0.5s" }} />
            <div className="celebration-ring w-32 h-32" style={{ animationDelay: "1s" }} />
          </div>

          <div className="celebration-modal relative rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-lg)", animation: "glow-pulse 2s ease-in-out infinite, slide-up-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
            <div className="celebration-emoji text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Week {celebrationWeek} Complete!
            </h2>
            <p className="mb-2" style={{ color: "var(--text-secondary)" }}>
              You crushed every problem this week.
            </p>
            
            {(() => {
              const planAgeMs = Date.now() - new Date(plan.createdAt).getTime();
              const planAgeDays = planAgeMs / (1000 * 60 * 60 * 24);
              const expectedDays = celebrationWeek * 7;
              const savedDays = Math.floor(expectedDays - planAgeDays);
              
              if (savedDays >= 2) {
                return (
                  <div className="mt-3 mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 font-semibold text-sm">
                      🚀 {savedDays} days ahead of schedule!
                    </p>
                    <p className="text-green-300/60 text-xs mt-1">
                      At this pace, you'll finish your entire plan early.
                    </p>
                  </div>
                );
              } else if (savedDays >= 0) {
                return (
                  <div className="mt-3 mb-4 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 font-semibold text-sm">
                      ⚡ Right on schedule — great consistency!
                    </p>
                  </div>
                );
              } else {
                return (
                  <div className="mt-3 mb-4 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <p className="text-violet-400 font-semibold text-sm">
                      💪 Progress is progress — keep going!
                    </p>
                  </div>
                );
              }
            })()}
            
            {celebrationWeek < plan.timelineWeeks ? (
              <div className="space-y-2">
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                  Week {celebrationWeek + 1} is ready for you
                </p>
                <button
                  onClick={() => {
                    setCelebrationWeek(null);
                    setExpandedWeeks(new Set([celebrationWeek + 1]));
                    setTimeout(() => {
                      document.getElementById(`week-${celebrationWeek + 1}`)?.scrollIntoView({ 
                        behavior: "smooth", block: "start" 
                      });
                    }, 100);
                  }}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors"
                >
                  Start Week {celebrationWeek + 1} →
                </button>
                <button
                  onClick={() => setCelebrationWeek(null)}
                  className="w-full py-2 text-sm transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="celebration-emoji text-4xl mb-2">🏆</div>
                <p className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  You completed the entire plan!
                </p>
                <button
                  onClick={() => setCelebrationWeek(null)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold"
                >
                  View Analytics →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
