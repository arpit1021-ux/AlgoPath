import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function BadgesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/login");

  const user = await db.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/login");

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
        problems: { select: { status: true } },
      },
    }),
  ]);

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activityDates = new Set(
    recentActivity.map((a: { createdAt: Date }) => {
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

  const totalProblemsInPlans = allPlans.reduce((sum, p) => sum + p.problems.length, 0);

  const badges = [
    {
      name: "First Blood",
      description: "Solve your first problem",
      icon: "🎯",
      earned: totalSolved >= 1,
      progress: Math.min(totalSolved, 1),
      target: 1,
    },
    {
      name: "Week Warrior",
      description: "Solve 7 problems",
      icon: "⚔️",
      earned: totalSolved >= 7,
      progress: Math.min(totalSolved, 7),
      target: 7,
    },
    {
      name: "Consistency King",
      description: "3+ day streak",
      icon: "🔥",
      earned: streak >= 3,
      progress: Math.min(streak, 3),
      target: 3,
    },
    {
      name: "Halfway There",
      description: "Reach 50% in any plan",
      icon: "🏆",
      earned: allPlans.some((p) => {
        const total = p.problems.length;
        const solved = p.problems.filter((pp) => pp.status === "SOLVED").length;
        return total > 0 && (solved / total) * 100 >= 50;
      }),
      progress: allPlans.length > 0 ? Math.max(...allPlans.map((p) => {
        const total = p.problems.length;
        const solved = p.problems.filter((pp) => pp.status === "SOLVED").length;
        return total > 0 ? Math.min(Math.round((solved / total) * 100), 50) : 0;
      })) : 0,
      target: 50,
    },
    {
      name: "Revision Master",
      description: "Complete 10 revisions",
      icon: "🔄",
      earned: totalRevisions >= 10,
      progress: Math.min(totalRevisions, 10),
      target: 10,
    },
    {
      name: "Century Club",
      description: "Solve 100 problems",
      icon: "💯",
      earned: totalSolved >= 100,
      progress: Math.min(totalSolved, 100),
      target: 100,
    },
    {
      name: "Problem Slayer",
      description: "Solve 25 problems",
      icon: "⚡",
      earned: totalSolved >= 25,
      progress: Math.min(totalSolved, 25),
      target: 25,
    },
    {
      name: "Streak Master",
      description: "7+ day streak",
      icon: "🌟",
      earned: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
    },
    {
      name: "Plan Completer",
      description: "Finish an entire plan",
      icon: "🎓",
      earned: allPlans.some((p) => {
        const total = p.problems.length;
        const solved = p.problems.filter((pp) => pp.status === "SOLVED").length;
        return total > 0 && solved === total;
      }),
      progress: allPlans.length > 0 ? Math.max(...allPlans.map((p) => {
        const total = p.problems.length;
        const solved = p.problems.filter((pp) => pp.status === "SOLVED").length;
        return total > 0 && solved === total ? 1 : 0;
      })) : 0,
      target: 1,
    },
  ];

  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Badges</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Track your achievements and milestones.
        </p>
      </div>

      <div className="card-surface p-6 flex items-center gap-4" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-dim)" }}>
          <Trophy className="w-7 h-7" style={{ color: "var(--accent-text)" }} />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {earned} / {badges.length}
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Badges Earned</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const pct = badge.target > 0 ? Math.round((badge.progress / badge.target) * 100) : 0;
          return (
            <div
              key={badge.name}
              className="card-surface-hover p-5 flex flex-col items-center text-center"
              style={{ boxShadow: "var(--shadow-sm)", opacity: badge.earned ? 1 : 0.5 }}
            >
              <div className="text-4xl mb-3">{badge.icon}</div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{badge.name}</h3>
              <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{badge.description}</p>
              {badge.earned ? (
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--success)" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Earned
                </div>
              ) : (
                <div className="w-full">
                  <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "var(--bg-input)" }}>
                    <div
                      className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {badge.progress}/{badge.target}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
