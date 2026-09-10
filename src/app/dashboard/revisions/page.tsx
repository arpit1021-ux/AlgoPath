"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useApiData, mutate } from "@/lib/use-api-data";
import { ErrorState } from "@/components/ui/error-message";
import { RevisionsSkeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/toast";
import {
  RotateCcw, CheckCircle2, AlertTriangle,
  ExternalLink, Calendar, Clock,
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
    plan: { name: string; id: string };
  };
}

interface RevisionsResponse {
  today: Revision[];
  overdue: Revision[];
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
  now,
  onComplete,
  completing,
}: {
  rev: Revision;
  isOverdue: boolean;
  /** Snapshot of the clock taken once by the page, so every card in a list
      measures "days overdue" against the same instant. */
  now: number;
  onComplete: (id: string) => void;
  completing: boolean;
}) {
  const daysOverdue = isOverdue
    ? Math.floor((now - new Date(rev.scheduledDate).getTime()) / 86400000)
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
          <Badge variant="secondary" className="text-[10px]">
            {rev.planProblem.plan.name}
          </Badge>
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

/* One clock read per mount, handed to every card. Calling Date.now() inside
   a card would be an impure render and could give two cards in the same list
   different answers. */
function nowMs() {
  return Date.now();
}

export default function AllRevisionsPage() {
  const [now] = useState(nowMs);
  const { data, loading, error, retry, setData } =
    useApiData<RevisionsResponse>("/api/revisions");
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  const todayRevisions = data?.today ?? [];
  const overdueRevisions = data?.overdue ?? [];

  const completeRevision = async (revisionId: string) => {
    setCompleting((prev) => new Set(prev).add(revisionId));

    // Optimistic remove — kept only if the server actually accepts the write.
    const snapshot = data;
    setData((prev) =>
      prev
        ? {
            today: (prev.today ?? []).filter((r) => r.id !== revisionId),
            overdue: (prev.overdue ?? []).filter((r) => r.id !== revisionId),
          }
        : prev
    );

    const res = await mutate("/api/revisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revisionId }),
    });

    if (!res.ok) {
      setData(() => snapshot);
      showToast({
        type: "error",
        message: `${res.error.title} — that revision is back in your list.`,
      });
    } else {
      showToast({ type: "success", message: "Reviewed — next one is scheduled." });
    }

    setCompleting((prev) => {
      const next = new Set(prev);
      next.delete(revisionId);
      return next;
    });
  };

  if (loading) return <RevisionsSkeleton />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-16">
        <ErrorState title={error.title} message={error.message} onRetry={retry} />
      </div>
    );
  }

  const totalDue = todayRevisions.length + overdueRevisions.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Revisions</h1>
        <p className="text-sm text-muted-foreground">
          Pending revisions across all your plans
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Due Today</p>
            <div className="text-3xl font-bold text-primary">{todayRevisions.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
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
        <Card className="border-border/50">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Total Pending</p>
            <div className="text-3xl font-bold">{totalDue}</div>
          </CardContent>
        </Card>
      </div>

      {totalDue === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-16 text-center text-muted-foreground">
            <CheckCircle2 className="h-14 w-14 mx-auto mb-4 text-green-500 opacity-80" />
            <p className="text-lg font-semibold text-foreground">All caught up!</p>
            <p className="text-sm mt-1">
              No revisions due. Solve more problems to generate revision tasks.
            </p>
          </CardContent>
        </Card>
      )}

      {overdueRevisions.length > 0 && (
        <Card className="border-yellow-500/20">
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
                now={now}
                onComplete={completeRevision}
                completing={completing.has(rev.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {todayRevisions.length > 0 && (
        <Card className="border-border/50">
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
                now={now}
                onComplete={completeRevision}
                completing={completing.has(rev.id)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
