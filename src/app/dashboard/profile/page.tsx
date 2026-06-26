import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { User, Trophy, Target, Flame, CheckCircle2, RotateCcw, Lock } from "lucide-react";
import { ProgressBar } from "@/components/ui-custom";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Not authenticated</div>
      </div>
    );
  }

  const user = await db.user.findUnique({ where: { clerkId } });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">User not found</div>
      </div>
    );
  }

  const [totalSolved, totalRevisions, recentActivity, allPlans] = await Promise.all([
    db.planProblem.count({
      where: { plan: { userId: user.id, deletedAt: null }, status: "SOLVED" },
    }),
    db.revision.count({
      where: { userId: user.id, status: "COMPLETED" },
    }),
    db.activityLog.findMany({
      where: { userId: user.id },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.plan.findMany({
      where: { userId: user.id, deletedAt: null },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        problems: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activityDates = new Set(
    recentActivity.map((a) => {
      const d = new Date(a.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let checkDate = new Date(today);
  while (true) {
    if (activityDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const activePlans = allPlans.filter((p) => p.status === "ACTIVE").length;

  // Badge definitions
  const badges = [
    {
      name: "First Blood",
      description: "Solve your first problem",
      earned: totalSolved >= 1,
      icon: "🎯",
    },
    {
      name: "Week Warrior",
      description: "Solve 7 problems",
      earned: totalSolved >= 7,
      icon: "⚔️",
    },
    {
      name: "Consistency King",
      description: "3+ day streak",
      earned: streak >= 3,
      icon: "🔥",
    },
    {
      name: "Halfway There",
      description: "Reach 50% in any plan",
      earned: allPlans.some((p) => {
        const total = p.problems.length;
        const solved = p.problems.filter((pp) => pp.status === "SOLVED").length;
        return total > 0 && (solved / total) * 100 >= 50;
      }),
      icon: "🏆",
    },
    {
      name: "Revision Master",
      description: "Complete 10 revisions",
      earned: totalRevisions >= 10,
      icon: "🔄",
    },
    {
      name: "Century Club",
      description: "Solve 100 problems",
      earned: totalSolved >= 100,
      icon: "💯",
    },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Hero section */}
      <div className="flex items-center gap-6 p-6 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        {clerkUser?.imageUrl ? (
          <img
            src={clerkUser.imageUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full border-2"
            style={{ borderColor: "var(--accent-border)" }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#2563eb] flex items-center justify-center border-2" style={{ borderColor: "var(--accent-border)" }}>
            <User className="h-10 w-10 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {clerkUser?.firstName} {clerkUser?.lastName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {clerkUser?.emailAddresses?.[0]?.emailAddress}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" }}>
              Active Member
            </span>
          </div>
        </div>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details from Clerk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            {clerkUser?.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                alt="Avatar"
                className="h-16 w-16 rounded-xl object-cover ring-2 ring-border"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <p className="font-semibold text-lg">
                {clerkUser?.firstName || "User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {clerkUser?.emailAddresses?.[0]?.emailAddress || "No email"}
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                defaultValue={clerkUser?.fullName || ""}
                className="mt-1"
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                defaultValue={clerkUser?.emailAddresses?.[0]?.emailAddress || ""}
                className="mt-1"
                disabled
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Profile information is managed through Clerk. Update via the
              UserButton in the sidebar.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold gradient-text">{totalSolved}</div>
              <p className="text-xs text-muted-foreground mt-1">Problems Solved</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold gradient-text">{totalRevisions}</div>
              <p className="text-xs text-muted-foreground mt-1">Revisions Done</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold gradient-text flex items-center justify-center gap-1">
                {streak}
                <Flame className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold gradient-text">{activePlans}</div>
              <p className="text-xs text-muted-foreground mt-1">Active Plans</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans list */}
      {allPlans.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allPlans.map((plan) => {
              const total = plan.problems.length;
              const solved = plan.problems.filter((p) => p.status === "SOLVED").length;
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
              return (
                <div key={plan.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Link
                      href={`/dashboard/plans/${plan.slug}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {plan.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">{solved}/{total} · {pct}%</span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Your earned badges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl border text-center transition-colors",
                  badge.earned
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/20 border-border/50 opacity-50"
                )}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-sm font-semibold">{badge.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                {!badge.earned && (
                  <Lock className="h-3 w-3 text-muted-foreground mt-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
