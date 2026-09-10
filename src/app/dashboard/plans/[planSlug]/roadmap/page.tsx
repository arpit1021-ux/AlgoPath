"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/toast";
import { ErrorState } from "@/components/ui/error-message";
import { mutate, type ApiError } from "@/lib/use-api-data";
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
  Target,
  TrendingUp,
  Play,
  Zap,
  Calendar,
  Trophy,
  Sparkles,
  ThumbsUp,
  LayoutDashboard,
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
  EASY:   "text-[#2cbb5d] bg-[rgba(44,187,93,0.1)] border-[rgba(44,187,93,0.2)]",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HARD:   "bg-red-100 text-red-700 border-red-200",
};

function CollapsibleSidebarSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-white/5 cursor-pointer"
        style={{ color: "var(--text-muted)" }}
      >
        <div className="flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {isOpen && (
        <div className="px-2 pb-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

/* --- Impure values, read once and outside render ---------------------------
   Date.now() and Math.random() return something different on every call, so
   reading them while rendering makes the same component produce two different
   trees. Both are captured once per mount instead: the clock as a snapshot,
   the confetti as a fixed set of pieces -- which also fixes the bug where any
   re-render mid-celebration re-rolled every piece and made the animation jump.
--------------------------------------------------------------------------- */

function nowMs() {
  return Date.now();
}

const CONFETTI_COLORS = [
  "#86868b", "#a1a1a6", "#d2d2d7", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#f97316",
];
const SHOWER_SHAPES = ["50%", "2px", "0"];
const BURST_SIZES = ["50%", "30%", "10%"];

interface ShowerPiece {
  x: string;
  w: string;
  h: string;
  duration: string;
  delay: string;
}
interface BurstPiece {
  tx: number;
  ty: number;
  size: string;
  duration: string;
  delay: string;
}

function makeConfetti(): { shower: ShowerPiece[]; burst: BurstPiece[] } {
  const shower = Array.from({ length: 40 }, () => ({
    x: `${Math.random() * 100}%`,
    w: `${6 + Math.random() * 10}px`,
    h: `${6 + Math.random() * 10}px`,
    duration: `${2 + Math.random() * 2}s`,
    delay: `${Math.random() * 0.8}s`,
  }));
  const burst = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * 360;
    const distance = 80 + Math.random() * 180;
    return {
      tx: Math.cos((angle * Math.PI) / 180) * distance,
      ty: Math.sin((angle * Math.PI) / 180) * distance,
      size: `${4 + Math.random() * 8}px`,
      duration: `${1.5 + Math.random() * 1}s`,
      delay: `${Math.random() * 0.3}s`,
    };
  });
  return { shower, burst };
}

export default function PlanRoadmapPage() {
  const params = useParams();
  const planSlug = params.planSlug as string;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [activeTopicFilter, setActiveTopicFilter] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarSections, setSidebarSections] = useState<Record<string, boolean>>({
    progress: true,
    details: true,
    pool: true,
    companies: true,
    nav: true,
  });
  const toggleSidebarSection = (key: string) => {
    setSidebarSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [noteStatus, setNoteStatus] = useState<
    Record<string, "idle" | "saving" | "saved" | "error">
  >({});
  const [celebrationWeek, setCelebrationWeek] = useState<number | null>(null);
  // Lazy initialisers: React calls these once, outside the render it is
  // committing, so the impure reads never happen twice for the same tree.
  const [now] = useState(nowMs);
  const [confetti] = useState(makeConfetti);

  // Bumped by retry; changing it re-runs the load effect below. The fetch
  // lives in the effect rather than in a callback the effect invokes, so no
  // state is set synchronously while React is committing.
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const res = await mutate(`/api/plans/${planSlug}`);
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.error);
        setLoading(false);
        return;
      }
      const fetchedPlan = (res.data as { plan: Plan | null }).plan ?? null;
      setPlan(fetchedPlan);
      if (fetchedPlan?.createdAt && fetchedPlan.timelineWeeks) {
        const currentWeek = Math.min(
          Math.max(
            Math.ceil(
              (nowMs() - new Date(fetchedPlan.createdAt).getTime()) /
                (7 * 24 * 60 * 60 * 1000)
            ),
            1
          ),
          fetchedPlan.timelineWeeks
        );
        setExpandedWeeks(new Set([currentWeek]));
      }
      setLoadError(null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [planSlug, loadAttempt]);

  // Retry runs from a click, where setting state up front is exactly right.
  const retryLoad = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    setLoadAttempt((n) => n + 1);
  }, []);

  const refetchPlan = useCallback(async () => {
    const res = await mutate(`/api/plans/${planSlug}`);
    if (res.ok) setPlan((res.data as { plan: Plan | null }).plan ?? null);
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
    const res = await mutate(`/api/plans/${planSlug}/problems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planProblemId, status }),
    });

    if (!res.ok) {
      // Roll the optimistic tick back and say so — a checkbox that silently
      // un-ticks itself on the next reload is indistinguishable from a bug.
      setCelebrationWeek(null);
      await refetchPlan();
      showToast({
        type: "error",
        message:
          res.status === 429
            ? res.error.message
            : `${res.error.title} — we couldn't save that change.`,
      });
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

    const res = await mutate(`/api/plans/${plan?.id}/problems/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planProblemIds: Array.from(idsToUpdate),
        status: "SOLVED",
      }),
    });

    if (!res.ok) {
      setCelebrationWeek(null);
      await refetchPlan();
      showToast({
        type: "error",
        message: `${res.error.title} — week ${weekNum} wasn't saved. Nothing was lost.`,
      });
    } else {
      showToast({
        type: "success",
        message: `${unsolved.length} problems marked solved!`,
      });
    }

    setMarkingAll(null);
  };

  const saveNote = async (planProblemId: string, content: string) => {
    setNotesMap((prev) => ({ ...prev, [planProblemId]: content }));
    setNoteStatus((prev) => ({ ...prev, [planProblemId]: "saving" }));

    const res = await mutate("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planProblemId, content }),
    });

    if (!res.ok) {
      // Keep the text in the box; the user's writing is the one thing here
      // that isn't re-derivable.
      setNoteStatus((prev) => ({ ...prev, [planProblemId]: "error" }));
      return;
    }

    setNoteStatus((prev) => ({ ...prev, [planProblemId]: "saved" }));
    setTimeout(() => {
      setNoteStatus((prev) =>
        prev[planProblemId] === "saved"
          ? { ...prev, [planProblemId]: "idle" }
          : prev
      );
    }, 2500);
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

  // A failed request is not a missing plan — say which one actually happened.
  if (loadError) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <ErrorState
          title={loadError.title}
          message={loadError.message}
          onRetry={retryLoad}
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          We couldn&apos;t find this plan
        </h2>
        <p className="text-sm mt-2 mb-4" style={{ color: "var(--text-secondary)" }}>
          It may have been deleted, or the link is out of date.
        </p>
        <Link href="/dashboard" className="inline-block">
          <Button>Back to Plans</Button>
        </Link>
      </div>
    );
  }

  // While a plan is generating the API returns { id, status } with no problems
  // array. Without this guard the next line throws and takes the page down.
  // Generation is owned by the plan page — sending the user there avoids two
  // pages both POSTing /generate and building the roadmap twice.
  if (plan.status === "GENERATING" || plan.status === "FAILED" || !plan.problems) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin mb-5"
          style={{ borderColor: "var(--accent-dim)", borderTopColor: "var(--accent)" }}
          role="status"
          aria-label="Building your roadmap"
        />
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Your roadmap is still being built
        </h2>
        <p className="text-sm max-w-sm mb-5" style={{ color: "var(--text-secondary)" }}>
          {plan.status === "FAILED"
            ? "The last attempt didn't finish. You can retry it from the plan page."
            : "This usually takes under a minute. The plan page shows live progress."}
        </p>
        <Link href={`/dashboard/plans/${planSlug}`}>
          <Button>Go to plan</Button>
        </Link>
      </div>
    );
  }

  const totalProblems = plan.problems.length;
  const solvedProblems = plan.problems.filter((p) => p.status === "SOLVED").length;
  const attemptedProblems = plan.problems.filter((p) => p.status === "ATTEMPTED").length;
  const completionRate = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  const currentWeek = Math.min(
    Math.max(
      Math.ceil(
        (now - new Date(plan.createdAt).getTime()) / (7 * 24 * 60 * 60 * 1000)
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

  const problemEstimatedTime = (problem: PlanProblem["problem"]) => {
    const timeMap = ESTIMATED_TIME[plan.experienceLevel] ?? ESTIMATED_TIME.INTERMEDIATE;
    return timeMap[problem.difficulty] ?? 30;
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
      <div className="flex flex-col lg:flex-row gap-0 min-h-screen -mx-4 -mt-4 lg:-mx-8 lg:-mt-8">
      <aside
        className={`shrink-0 overflow-y-auto transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen flex lg:flex-col overflow-x-auto lg:overflow-x-hidden w-full ${
          sidebarOpen ? "lg:w-[280px] p-4" : "lg:w-[52px] px-2 py-3"
        }`}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Master toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center p-1.5 rounded-lg transition-colors mb-3 shrink-0"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-input-hover)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {!sidebarOpen ? (
          /* Collapsed: icon-only nav */
          <div className="flex flex-col items-center gap-3">
            <Link href={`/dashboard/plans/${planSlug}`} title={plan.name}>
              <BarChart3 className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
            </Link>
            <div className="w-6 h-px" style={{ background: "var(--sidebar-border)" }} />
            <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>{completionRate}%</span>
            <div className="w-1 h-1 rounded-full bg-green-500" />
          </div>
        ) : (
          /* Expanded: full sidebar with collapsible sections */
          <div className="flex flex-col gap-1 flex-1 min-h-0">
            {/* Plan header */}
            <div className="pb-2 shrink-0" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
              <Link href={`/dashboard/plans/${planSlug}`} className="text-sm font-bold truncate whitespace-nowrap hover:opacity-80 transition-opacity block" style={{ color: "var(--text-primary)" }}>
                {plan.name}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                  {plan.status}
                </Badge>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Week {currentWeek}/{plan.timelineWeeks}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-0.5 py-1">
              {/* Progress section */}
              <CollapsibleSidebarSection
                title="Progress"
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                isOpen={sidebarSections.progress}
                onToggle={() => toggleSidebarSection("progress")}
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-secondary)" }}>{solvedProblems}/{totalProblems} solved</span>
                    <span className="font-semibold" style={{ color: "var(--accent-text)" }}>{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-1.5" />
                  <div className="flex gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span>{attemptedProblems} attempted</span>
                    <span>{totalProblems - solvedProblems - attemptedProblems} remaining</span>
                  </div>
                </div>
              </CollapsibleSidebarSection>

              {/* Details section */}
              <CollapsibleSidebarSection
                title="Details"
                icon={<Clock className="h-3.5 w-3.5" />}
                isOpen={sidebarSections.details}
                onToggle={() => toggleSidebarSection("details")}
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Duration</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{plan.timelineWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Hours/week</span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{plan.weeklyHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Level</span>
                    <span className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>{plan.experienceLevel.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-muted)" }}>Difficulty</span>
                    <span className="font-medium capitalize" style={{ color: "var(--text-primary)" }}>
                      {plan.difficultyPreference.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                </div>
              </CollapsibleSidebarSection>

              {/* Problem Pool section */}
              <CollapsibleSidebarSection
                title="Problem Pool"
                icon={<Target className="h-3.5 w-3.5" />}
                isOpen={sidebarSections.pool}
                onToggle={() => toggleSidebarSection("pool")}
              >
                <div className="space-y-1.5">
                  {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                    <div key={d} className="flex items-center justify-between text-xs">
                      <span className={cn("px-2 py-0.5 rounded-full border font-medium", DIFF_COLORS[d])}>
                        {d.charAt(0) + d.slice(1).toLowerCase()}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>{diffCounts[d]}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSidebarSection>

              {/* Companies section */}
              {plan.targetCompanies.length > 0 && (
                <CollapsibleSidebarSection
                  title="Companies"
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  isOpen={sidebarSections.companies}
                  onToggle={() => toggleSidebarSection("companies")}
                >
                  <div className="flex flex-wrap gap-1">
                    {plan.targetCompanies.map((tc) => (
                      <Badge key={tc.company.slug} variant="secondary" className="text-[10px]">
                        {tc.company.name}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleSidebarSection>
              )}

              {/* Nav links section */}
              <CollapsibleSidebarSection
                title="Navigate"
                icon={<Play className="h-3.5 w-3.5" />}
                isOpen={sidebarSections.nav}
                onToggle={() => toggleSidebarSection("nav")}
              >
                <div className="space-y-1">
                  <Link href={`/dashboard/plans/${planSlug}`} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-md transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
                    <LayoutDashboard className="h-3 w-3" /> Dashboard
                  </Link>
                  <Link href={`/dashboard/plans/${planSlug}/analytics`} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-md transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
                    <BarChart3 className="h-3 w-3" /> Analytics
                  </Link>
                  <Link href={`/dashboard/plans/${planSlug}/revisions`} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-md transition-colors hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
                    <RotateCcw className="h-3 w-3" /> Revisions
                  </Link>
                </div>
              </CollapsibleSidebarSection>
            </div>
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
                Clear filter
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
          
          const planAgeMs = now - new Date(plan.createdAt).getTime();
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
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(44,187,93,0.1)] border border-[rgba(44,187,93,0.2)] text-sm mb-2">
                <Zap className="w-5 h-5 text-[var(--success)] shrink-0" />
                <div>
                  <span className="text-[var(--success)] font-semibold">
                    {diff} problems ahead of schedule!
                  </span>
                  <span className="text-[var(--success)]/60 ml-2">
                    At this pace you&apos;ll finish {Math.round(diff / (totalP / plan.timelineWeeks / 7))} days early.
                  </span>
                </div>
              </div>
            );
          } else if (diff >= 0) {
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm mb-2">
                <Zap className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-blue-400 font-semibold">
                  On track — {actualSolved} problems solved, right on schedule.
                </span>
              </div>
            );
          } else if (diff >= -5) {
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm mb-2">
                <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
                <span className="text-yellow-400 font-semibold">
                  {Math.abs(diff)} problems behind schedule. Solve {Math.abs(diff)} more to catch up.
                </span>
              </div>
            );
          } else {
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm mb-2">
                <Calendar className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-red-400 font-semibold">
                  {Math.abs(diff)} problems behind. Consider increasing daily practice time.
                </span>
              </div>
            );
          }
        })()}

        {(() => {
          // The catalogue may not hold enough of the requested difficulty to
          // fill the hours offered. Say so, rather than letting a thin plan
          // look like a bug.
          const weeklyPlanned =
            plan.problems.length > 0
              ? plan.problems.reduce(
                  (sum, p) => sum + problemEstimatedTime(p.problem),
                  0
                ) / plan.timelineWeeks
              : 0;
          const offered = plan.weeklyHours * 60;
          if (weeklyPlanned >= offered * 0.85 || weeklyPlanned === 0) return null;
          const hrs = (weeklyPlanned / 60).toFixed(1);
          return (
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm mb-3"
              style={{
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-border)",
              }}
            >
              <Target className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent-text)" }} />
              <div>
                <span className="font-semibold" style={{ color: "var(--accent-text)" }}>
                  This plan fills about {hrs}h of your {plan.weeklyHours}h per week.
                </span>
                <span className="block mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  We keep your {plan.difficultyPreference.replace("_", " ").toLowerCase()} difficulty
                  mix exactly as you set it, and there are only so many problems at that level.
                  For a fuller week, shorten the timeline or soften the difficulty.
                </span>
              </div>
            </div>
          );
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
                                    ? "bg-[var(--accent)] border-[var(--accent)] text-[#1a1a1a]"
                                    : "border-muted-foreground/30 hover:border-[var(--accent)]"
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
                                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                                    <Clock className="h-3 w-3" />
                                    {problemEstimatedTime(pp.problem)}m
                                  </span>
                                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    · {pp.problem.acceptanceRate.toFixed(1)}%
                                  </span>
                                  {pp.problem.likes > 0 && (
                                    <span className="text-xs flex items-center gap-0.5" style={{ color: "var(--text-muted)" }}>
                                      <ThumbsUp className="h-3 w-3" />
                                      {pp.problem.likes >= 1000 ? `${(pp.problem.likes / 1000).toFixed(1)}k` : pp.problem.likes}
                                    </span>
                                  )}
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
                                {pp.problem.companies.length > 2 && (
                                  <span className="text-xs hidden sm:flex" style={{ color: "var(--text-muted)" }}>
                                    +{pp.problem.companies.length - 2}
                                  </span>
                                )}
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
                                  id={`note-${pp.id}`}
                                  aria-label={`Notes for ${pp.problem.title}`}
                                  defaultValue={notesMap[pp.id] ?? pp.notes?.[0]?.content ?? ""}
                                  onBlur={(e) => saveNote(pp.id, e.target.value)}
                                  rows={3}
                                  placeholder="Add notes for this problem..."
                                  className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
                                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                                />
                                <div
                                  className="flex items-center justify-between gap-3 mt-1.5 min-h-[20px]"
                                  role="status"
                                  aria-live="polite"
                                >
                                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                    {noteStatus[pp.id] === "saving" && "Saving…"}
                                    {noteStatus[pp.id] === "saved" && "Saved"}
                                    {noteStatus[pp.id] === "error" && (
                                      <span style={{ color: "var(--danger)" }}>
                                        Couldn&apos;t save — your text is still here.
                                      </span>
                                    )}
                                  </span>
                                  {noteStatus[pp.id] === "error" && (
                                    <button
                                      onClick={() => {
                                        const el = document.getElementById(
                                          `note-${pp.id}`
                                        ) as HTMLTextAreaElement | null;
                                        if (el) saveNote(pp.id, el.value);
                                      }}
                                      className="text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer"
                                      style={{
                                        background: "var(--bg-input)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-primary)",
                                      }}
                                    >
                                      Retry
                                    </button>
                                  )}
                                </div>
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
            {confetti.shower.map((piece, i) => (
              <div
                key={`shower-${i}`}
                className="confetti-shower-piece"
                style={{
                  "--x": piece.x,
                  "--color": CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  "--w": piece.w,
                  "--h": piece.h,
                  "--radius": SHOWER_SHAPES[i % SHOWER_SHAPES.length],
                  "--duration": piece.duration,
                  "--delay": piece.delay,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Burst confetti — centered explosion */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.burst.map((piece, i) => (
              <div
                key={`burst-${i}`}
                className="confetti-particle"
                style={{
                  left: "50%",
                  top: "40%",
                  "--tx": `${piece.tx}px`,
                  "--ty": `${piece.ty}px`,
                  "--color": CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  "--size": piece.size,
                  "--radius": BURST_SIZES[i % BURST_SIZES.length],
                  "--duration": piece.duration,
                  "--delay": piece.delay,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Expanding rings behind modal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="celebration-ring w-32 h-32" />
            <div className="celebration-ring w-32 h-32" style={{ animationDelay: "0.5s" }} />
            <div className="celebration-ring w-32 h-32" style={{ animationDelay: "1s" }} />
          </div>

          <div className="celebration-modal relative rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-lg)", animation: "glow-pulse 2s ease-in-out infinite, slide-up-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}>
            <div className="celebration-emoji mb-4 flex justify-center">
              <Sparkles className="w-14 h-14" style={{ color: "var(--accent-text)" }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Week {celebrationWeek} Complete!
            </h2>
            <p className="mb-2" style={{ color: "var(--text-secondary)" }}>
              You crushed every problem this week.
            </p>
            
            {(() => {
              const planAgeMs = now - new Date(plan.createdAt).getTime();
              const planAgeDays = planAgeMs / (1000 * 60 * 60 * 24);
              const expectedDays = celebrationWeek * 7;
              const savedDays = Math.floor(expectedDays - planAgeDays);
              
              if (savedDays >= 2) {
                return (
                  <div className="mt-3 mb-4 px-4 py-3 rounded-xl bg-[rgba(44,187,93,0.1)] border border-[rgba(44,187,93,0.2)]">
                    <p className="text-[var(--success)] font-semibold text-sm flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      {savedDays} days ahead of schedule!
                    </p>
                    <p className="text-[var(--success)]/60 text-xs mt-1">
                      At this pace, you&apos;ll finish your entire plan early.
                    </p>
                  </div>
                );
              } else if (savedDays >= 0) {
                return (
                  <div className="mt-3 mb-4 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 font-semibold text-sm flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      Right on schedule — great consistency!
                    </p>
                  </div>
                );
              } else {
                return (
                  <div className="mt-3 mb-4 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <p className="text-violet-400 font-semibold text-sm flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Progress is progress — keep going!
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
                <div className="celebration-emoji mb-2 flex justify-center">
                  <Trophy className="w-10 h-10" style={{ color: "var(--accent-text)" }} />
                </div>
                <p className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  You completed the entire plan!
                </p>
                <Link
                  href={`/dashboard/plans/${planSlug}/analytics`}
                  onClick={() => setCelebrationWeek(null)}
                  className="block w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-center"
                >
                  View Analytics →
                </Link>
                <button
                  onClick={() => setCelebrationWeek(null)}
                  className="w-full py-2 text-sm transition-colors cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
