"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, TrendingUp, Target, Brain,
  Building2, Calendar, AlertTriangle, CheckCircle2,
} from "lucide-react";

const DifficultyChart = dynamic(
  () => import("@/components/analytics/difficulty-chart").then((m) => m.DifficultyChart),
  { loading: () => <div className="h-[250px] w-full animate-pulse bg-muted rounded-lg" />, ssr: false }
);

interface ReadinessScore {
  overall: number;
  topicCoverage: number;
  difficultyCoverage: number;
  revisionCompletion: number;
  companyCoverage: number;
  consistency: number;
  companyScores: Record<string, number>;
}

interface WeakTopic {
  topic: string;
  solved: number;
  total: number;
  accuracy: number;
}

interface AnalyticsData {
  readiness: ReadinessScore;
  weakTopics: WeakTopic[];
  difficultyCompletion: Record<string, { total: number; solved: number }>;
  weeklyActivity: number;
}

function ReadinessGauge({ value }: { value: number }) {
  const color =
    value >= 70 ? "text-green-500" :
    value >= 40 ? "text-yellow-500" : "text-red-500";
  const label =
    value >= 70 ? "Interview Ready" :
    value >= 40 ? "On Track" : "Needs Work";

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className={`text-7xl font-bold tabular-nums ${color}`}>
        {value}%
      </div>
      <Badge
        className={`mt-3 text-sm ${
          value >= 70
            ? "bg-green-500/10 text-green-600 border-green-500/20"
            : value >= 40
            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            : "bg-red-500/10 text-red-600 border-red-500/20"
        }`}
        variant="outline"
      >
        {label}
      </Badge>
      <p className="text-xs text-muted-foreground mt-2">Overall Readiness</p>
    </div>
  );
}

const READINESS_ITEMS = [
  { key: "topicCoverage",      label: "Topic Coverage",      icon: Brain     },
  { key: "difficultyCoverage", label: "Difficulty Coverage", icon: TrendingUp },
  { key: "revisionCompletion", label: "Revision Completion", icon: Calendar   },
  { key: "companyCoverage",    label: "Company Coverage",    icon: Building2  },
  { key: "consistency",        label: "Consistency",         icon: Target     },
] as const;

export default function AnalyticsPage() {
  const params = useParams();
  const planId = params.planId as string;
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/analytics?planId=${planId}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setAnalytics(data); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics || !analytics.readiness) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">No analytics data available yet.</p>
        <Link href={`/dashboard/plans/${planId}`}>
          <Button>Back to Plan</Button>
        </Link>
      </div>
    );
  }

  const { readiness, weakTopics, difficultyCompletion, weeklyActivity } = analytics;

  const difficultyData = Object.entries(difficultyCompletion).map(([key, val]) => ({
    name: key.charAt(0) + key.slice(1).toLowerCase(),
    total: val.total,
    solved: val.solved,
  }));

  const totalProblems = Object.values(difficultyCompletion).reduce((s, v) => s + v.total, 0);
  const totalSolved   = Object.values(difficultyCompletion).reduce((s, v) => s + v.solved, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/plans/${planId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plan
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your preparation progress</p>
        </div>
      </div>

      {/* Top row: readiness gauge + breakdown + company scores */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Readiness gauge */}
        <Card className="border-border/50">
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Interview Readiness</CardTitle>
            <CardDescription>Overall preparation score</CardDescription>
          </CardHeader>
          <CardContent>
            <ReadinessGauge value={readiness.overall} />
          </CardContent>
        </Card>

        {/* Score breakdown */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Score Breakdown</CardTitle>
            <CardDescription>What's driving your score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {READINESS_ITEMS.map(({ key, label, icon: Icon }) => {
              const val = readiness[key];
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </span>
                    <span className="font-semibold tabular-nums">{val}%</span>
                  </div>
                  <Progress
                    value={val}
                    className={`h-1.5 ${
                      val >= 70 ? "[&>div]:bg-green-500" :
                      val >= 40 ? "[&>div]:bg-yellow-500" :
                      "[&>div]:bg-red-500"
                    }`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Company scores */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Company Readiness</CardTitle>
            <CardDescription>Score per target company</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(readiness.companyScores).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Solve problems to see company scores</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(readiness.companyScores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([company, score]) => (
                    <div key={company} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{company}</span>
                        <span className="tabular-nums text-muted-foreground">{score}%</span>
                      </div>
                      <Progress value={score} className="h-1.5" />
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Problems Solved",
            value: `${totalSolved}/${totalProblems}`,
            sub: `${totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0}% complete`,
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "Easy Solved",
            value: `${difficultyCompletion.EASY?.solved ?? 0}/${difficultyCompletion.EASY?.total ?? 0}`,
            sub: "Easy problems",
            icon: Target,
            color: "text-green-400",
            bg: "bg-green-400/10",
          },
          {
            label: "Medium Solved",
            value: `${difficultyCompletion.MEDIUM?.solved ?? 0}/${difficultyCompletion.MEDIUM?.total ?? 0}`,
            sub: "Medium problems",
            icon: TrendingUp,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
          },
          {
            label: "Activity (30d)",
            value: weeklyActivity,
            sub: "Actions logged",
            icon: Calendar,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className={`h-7 w-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom row: difficulty chart + weak topics */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Difficulty chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Difficulty Breakdown</CardTitle>
            <CardDescription>Assigned vs solved by difficulty</CardDescription>
          </CardHeader>
          <CardContent>
            <DifficultyChart data={difficultyData} />
          </CardContent>
        </Card>

        {/* Weak topics */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Weak Topics
            </CardTitle>
            <CardDescription>Topics that need more practice</CardDescription>
          </CardHeader>
          <CardContent>
            {weakTopics.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No weak topics detected</p>
                <p className="text-xs mt-1">Solve more problems to get insights</p>
              </div>
            ) : (
              <div className="space-y-2">
                {weakTopics.slice(0, 6).map((topic) => (
                  <div
                    key={topic.topic}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {topic.solved}/{topic.total} solved
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Progress value={topic.accuracy} className="w-16 h-1.5" />
                      <Badge
                        variant="outline"
                        className={
                          topic.accuracy < 30
                            ? "text-red-500 border-red-500/30 text-xs"
                            : topic.accuracy < 60
                            ? "text-yellow-500 border-yellow-500/30 text-xs"
                            : "text-green-500 border-green-500/30 text-xs"
                        }
                      >
                        {Math.round(topic.accuracy)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}