"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, Rocket, Trash2, BarChart3, RotateCcw,
  ChevronRight, Clock, Target,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  status: string;
  experienceLevel: string;
  timelineWeeks: number;
  weeklyHours: number;
  difficultyPreference: string;
  createdAt: string;
  targetCompanies: Array<{ company: { name: string; slug: string } }>;
  problems: Array<{ id: string; status: string }>;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Delete "${planName}"? This cannot be undone.`)) return;
    setDeletingId(planId);
    try {
      await fetch(`/api/plans/${planId}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (e) {
      console.error(e);
      alert("Failed to delete plan.");
    } finally {
      setDeletingId(null);
    }
  };

  const difficultyColor = (d: string) => {
    if (d === "EASY") return "text-green-500 border-green-500/30";
    if (d === "MEDIUM") return "text-yellow-500 border-yellow-500/30";
    if (d === "HARD") return "text-red-500 border-red-500/30";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Plans</h1>
          <p className="text-muted-foreground mt-1">
            Manage your interview preparation plans.
          </p>
        </div>
        <Link href="/dashboard/plans/new">
          <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20">
            <Rocket className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-muted-foreground">
          Loading plans...
        </div>
      )}

      {/* Empty state */}
      {!loading && plans.length === 0 && (
        <Card className="glass-card border-border/50">
          <CardContent>
            <div className="text-center py-16 text-muted-foreground">
              <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 opacity-50" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                No plans yet
              </h3>
              <p className="mb-6 max-w-md mx-auto">
                Create your first preparation plan to get a personalized roadmap
                tailored to your target companies and timeline.
              </p>
              <Link href="/dashboard/plans/new">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Create Your First Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans grid */}
      {!loading && plans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const solved = plan.problems.filter((p) => p.status === "SOLVED").length;
            const total = plan.problems.length;
            const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
            const isDeleting = deletingId === plan.id;

            return (
              <div
                key={plan.id}
                className="relative group rounded-xl border bg-card hover:shadow-md transition-all duration-200"
              >
                {/* Delete button */}
                <button
                  onClick={() => deletePlan(plan.id, plan.name)}
                  disabled={isDeleting}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 disabled:opacity-50"
                  title="Delete plan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="p-5">
                  {/* Plan name + status */}
                  <div className="flex items-start gap-2 mb-3 pr-8">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base leading-tight truncate">
                        {plan.name}
                      </h3>
                      {plan.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {plan.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        plan.status === "ACTIVE"
                          ? "text-emerald-500 border-emerald-500/30 shrink-0 text-xs"
                          : "text-muted-foreground shrink-0 text-xs"
                      }
                    >
                      {plan.status}
                    </Badge>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {plan.timelineWeeks}w · {plan.weeklyHours}h/week
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {plan.experienceLevel.toLowerCase()}
                    </span>
                  </div>

                  {/* Companies */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {plan.targetCompanies.slice(0, 4).map((tc) => (
                      <Badge
                        key={tc.company.slug}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tc.company.name}
                      </Badge>
                    ))}
                    {plan.targetCompanies.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{plan.targetCompanies.length - 4}
                      </Badge>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {solved}/{total} solved · {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/plans/${plan.id}`} className="flex-1">
                      <Button size="sm" className="w-full" variant="default">
                        Continue
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/plans/${plan.id}/analytics`}>
                      <Button size="sm" variant="outline" title="Analytics">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/plans/${plan.id}/revisions`}>
                      <Button size="sm" variant="outline" title="Revisions">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}