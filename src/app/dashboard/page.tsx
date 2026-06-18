import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Calendar, CheckCircle2, Clock,
  Flame, Target, TrendingUp, Plus, Sparkles, Rocket,
} from "lucide-react";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  const user = clerkId
    ? await db.user.findUnique({ where: { clerkId } })
    : null;

  const [plans, todayRevisions] = user
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
      ])
    : [[], 0];

  const allProblems = plans.flatMap((p) => p.problems);
  const totalSolved = allProblems.filter((p) => p.status === "SOLVED").length;
  const totalProblems = allProblems.length;
  const overallProgress = totalProblems > 0
    ? Math.round((totalSolved / totalProblems) * 100)
    : 0;

  const todayProblems = plans.length > 0
    ? await db.planProblem.findMany({
        where: {
          plan: { userId: user!.id, status: "ACTIVE" },
          status: "TODO",
        },
        select: {
          id: true,
          weekNumber: true,
          problem: { select: { title: true, difficulty: true, titleSlug: true } },
          plan: { select: { id: true, name: true } },
        },
        orderBy: [{ weekNumber: "asc" }],
        take: 6,
      })
    : [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 p-8 border border-primary/10">
        <div className="absolute top-4 right-4 opacity-10">
          <Rocket className="h-32 w-32 text-primary" />
        </div>
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back! <span className="inline-block">👋</span>
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Track your interview preparation progress and stay on schedule with
            your personalized roadmap.
          </p>
          <Link href="/dashboard/plans/new" className="mt-4 inline-block">
            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Problems Solved
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSolved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalProblems > 0
                ? `${totalProblems - totalSolved} remaining`
                : "Create a plan to start"}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Plans
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{plans.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plans.length === 0 ? "Create your first plan" : `${plans.length} in progress`}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="card-hover glass-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Revisions
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayRevisions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayRevisions === 0 ? "No revisions due" : "Due today"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Today&apos;s Tasks</CardTitle>
                <CardDescription>Unsolved problems from your active plans</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {todayProblems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">No tasks for today</p>
                <p className="text-sm mt-1 mb-4">Create a plan to get started</p>
                <Link href="/dashboard/plans/new">
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Plan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {todayProblems.map((pp) => (
                  <div
                    key={pp.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <a
                        href={`https://leetcode.com/problems/${pp.problem.titleSlug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:underline block truncate"
                      >
                        {pp.problem.title}
                      </a>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {pp.plan.name} · Week {pp.weekNumber}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        pp.problem.difficulty === "EASY"
                          ? "text-green-500 border-green-500/30 ml-2 shrink-0"
                          : pp.problem.difficulty === "MEDIUM"
                          ? "text-yellow-500 border-yellow-500/30 ml-2 shrink-0"
                          : "text-red-500 border-red-500/30 ml-2 shrink-0"
                      }
                    >
                      {pp.problem.difficulty}
                    </Badge>
                  </div>
                ))}
                <Link href="/dashboard/plans" className="block pt-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all plans →
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Progress */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Plan Progress</CardTitle>
                <CardDescription>Progress across your active plans</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active plans yet
              </p>
            ) : (
              plans.map((plan) => {
                const solved = plan.problems.filter((p) => p.status === "SOLVED").length;
                const total = plan.problems.length;
                const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
                return (
                  <div key={plan.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <Link
                        href={`/dashboard/plans/${plan.id}`}
                        className="font-medium hover:underline truncate max-w-[200px]"
                      >
                        {plan.name}
                      </Link>
                      <span className="text-muted-foreground text-xs ml-2">
                        {solved}/{total} · {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Plans */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Active Plans</CardTitle>
              <CardDescription>Your current preparation plans</CardDescription>
            </div>
            <Link href="/dashboard/plans/new">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                New Plan
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">No active plans</p>
              <p className="text-sm mt-1 mb-4 max-w-sm mx-auto">
                Create your first preparation plan to get a personalized roadmap
              </p>
              <Link href="/dashboard/plans/new">
                <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Plan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => {
                const solved = plan.problems.filter((p) => p.status === "SOLVED").length;
                const total = plan.problems.length;
                const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
                return (
                  <Link key={plan.id} href={`/dashboard/plans/${plan.id}`}>
                    <div className="p-4 rounded-xl border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-sm leading-tight">{plan.name}</h3>
                        <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                          {plan.timelineWeeks}w
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {plan.targetCompanies.slice(0, 3).map((tc) => (
                          <Badge key={tc.company.name} variant="outline" className="text-xs">
                            {tc.company.name}
                          </Badge>
                        ))}
                      </div>
                      <Progress value={pct} className="h-1.5 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {solved}/{total} solved · {pct}%
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}