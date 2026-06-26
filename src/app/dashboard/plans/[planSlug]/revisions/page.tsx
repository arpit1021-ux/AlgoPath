"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  RotateCcw, CheckCircle2, AlertTriangle,
  ExternalLink, Calendar, ArrowLeft, Clock,
} from "lucide-react";

interface Revision {
  id: string;
  revisionNumber: number;
  scheduledDate: string;
  status: string;
  planProblem: {
    id: string;
    problem: {
      title: string;
      titleSlug: string;
      difficulty: string;
      acceptanceRate: number;
    };
    plan: { name: string };
  };
}

const DIFF_COLORS: Record<string, string> = {
  EASY:   "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HARD:   "bg-red-100 text-red-700 border-red-200",
};

const REVISION_LABELS: Record<number, string> = {
  1: "+2 days",
  2: "+7 days",
  3: "+21 days",
  4: "+45 days",
};

function RevisionCard({
  rev,
  isOverdue,
  onComplete,
  completing,
}: {
  rev: Revision;
  isOverdue: boolean;
  onComplete: (id: string) => void;
  completing: boolean;
}) {
  const daysOverdue = isOverdue
    ? Math.floor((Date.now() - new Date(rev.scheduledDate).getTime()) / 86400000)
    : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-colors",
        isOverdue
          ? "border-yellow-500/30 bg-yellow-500/5"
          : "border-border hover:bg-muted/30"
      )}
    >
      {/* Problem info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <a
            href={`https://leetcode.com/problems/${rev.planProblem.problem.titleSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm hover:underline truncate"
          >
            {rev.planProblem.problem.title}
          </a>
          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border font-medium",
            DIFF_COLORS[rev.planProblem.problem.difficulty] ?? "bg-muted"
          )}>
            {rev.planProblem.problem.difficulty.charAt(0) +
              rev.planProblem.problem.difficulty.slice(1).toLowerCase()}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <RotateCcw className="h-3 w-3" />
            Revision {rev.revisionNumber}
            {REVISION_LABELS[rev.revisionNumber] && (
              <span className="text-muted-foreground/60">
                ({REVISION_LABELS[rev.revisionNumber]} interval)
              </span>
            )}
          </span>
          {isOverdue ? (
            <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {daysOverdue}d overdue
            </span>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due {new Date(rev.scheduledDate).toLocaleDateString("en-US", {
                month: "short", day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Action button */}
      <Button
        size="sm"
        variant={isOverdue ? "default" : "outline"}
        disabled={completing}
        onClick={() => onComplete(rev.id)}
        className="shrink-0"
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
        {completing ? "Saving..." : "Done"}
      </Button>
    </div>
  );
}

export default function RevisionsPage() {
  const params = useParams();
  const planSlug = params.planSlug as string;
  const [todayRevisions, setTodayRevisions] = useState<Revision[]>([]);
  const [overdueRevisions, setOverdueRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/revisions?planSlug=${planSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setTodayRevisions(data.today ?? []);
          setOverdueRevisions(data.overdue ?? []);
        }
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planSlug]);

  const completeRevision = async (revisionId: string) => {
    // Optimistic remove
    setCompleting((prev) => new Set(prev).add(revisionId));
    setTodayRevisions((prev) => prev.filter((r) => r.id !== revisionId));
    setOverdueRevisions((prev) => prev.filter((r) => r.id !== revisionId));

    try {
      await fetch("/api/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId }),
      });
    } catch (e) {
      console.error(e);
      // Rollback on error
      fetch(`/api/revisions?planSlug=${planSlug}`)
        .then((r) => r.json())
        .then((data) => {
          setTodayRevisions(data.today ?? []);
          setOverdueRevisions(data.overdue ?? []);
        });
    } finally {
      setCompleting((prev) => {
        const next = new Set(prev);
        next.delete(revisionId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-white/5" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-white/5" />
        <div className="h-64 rounded-xl bg-white/5" />
      </div>
    );
  }

  const totalDue = todayRevisions.length + overdueRevisions.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/plans/${planSlug}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Revisions</h1>
          <p className="text-sm text-muted-foreground">
            Spaced repetition schedule · intervals: 2d → 7d → 21d → 45d
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50" style={{ boxShadow: "var(--shadow-sm)" }}>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Due Today</p>
            <div className="text-3xl font-bold text-primary">{todayRevisions.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50" style={{ boxShadow: "var(--shadow-sm)" }}>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Overdue</p>
            <div className={cn(
              "text-3xl font-bold",
              overdueRevisions.length > 0 ? "text-yellow-500" : "text-muted-foreground"
            )}>
              {overdueRevisions.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50" style={{ boxShadow: "var(--shadow-sm)" }}>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Total Pending</p>
            <div className="text-3xl font-bold">{totalDue}</div>
          </CardContent>
        </Card>
      </div>

      {/* All done state */}
      {totalDue === 0 && (
        <Card className="border-border/50" style={{ boxShadow: "var(--shadow-sm)" }}>
          <CardContent className="py-20 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>All caught up!</p>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
              No revisions due. Keep solving problems to build your revision queue.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
              <span className="px-2 py-1 rounded bg-white/5">2d</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-white/5">7d</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-white/5">21d</span>
              <span>→</span>
              <span className="px-2 py-1 rounded bg-white/5">45d</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue */}
      {overdueRevisions.length > 0 && (
        <Card className="border-yellow-500/20" style={{ boxShadow: "var(--shadow-sm)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Overdue
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 ml-1">
                {overdueRevisions.length}
              </Badge>
            </CardTitle>
            <CardDescription>These revisions are past their scheduled date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueRevisions.map((rev) => (
              <RevisionCard
                key={rev.id}
                rev={rev}
                isOverdue
                onComplete={completeRevision}
                completing={completing.has(rev.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today */}
      {todayRevisions.length > 0 && (
        <Card className="border-border/50" style={{ boxShadow: "var(--shadow-sm)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Due Today
              <Badge variant="outline" className="ml-1">
                {todayRevisions.length}
              </Badge>
            </CardTitle>
            <CardDescription>Review these problems today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayRevisions.map((rev) => (
              <RevisionCard
                key={rev.id}
                rev={rev}
                isOverdue={false}
                onComplete={completeRevision}
                completing={completing.has(rev.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="border-border/50 bg-muted/30" style={{ boxShadow: "var(--shadow-sm)" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">How Spaced Repetition Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Solve problem", color: "bg-primary/10 text-primary" },
              { label: "Review in 2 days", color: "bg-blue-500/10 text-blue-600" },
              { label: "Review in 7 days", color: "bg-violet-500/10 text-violet-600" },
              { label: "Review in 21 days", color: "bg-orange-500/10 text-orange-600" },
              { label: "Review in 45 days", color: "bg-green-500/10 text-green-600" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", step.color)}>
                  {step.label}
                </span>
                {i < 4 && <span className="text-muted-foreground text-xs">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}