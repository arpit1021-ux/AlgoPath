import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db, getUserByClerkId } from "@/lib/db";
import { Plus } from "lucide-react";
import { PlanCard } from "@/components/plan-card";

function InfinityLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="20" fill="url(#empty-logo)" />
      <path
        d="M50,30 C50,15 30,15 30,30 C30,45 50,45 50,30 C50,15 70,15 70,30 C70,45 50,45 50,30 Z"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="empty-logo" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#ffa116" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const metadata = {
  title: "My Plans",
  description: "Every preparation plan you\u2019re running, with progress at a glance.",
};

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  // currentUser() is a network call to Clerk and the plan query is a call to
  // Postgres — they do not depend on each other, so run them together instead
  // of one after the other. Filtering on the user relation also removes the
  // separate clerkId -> user lookup that used to sit in between.
  const [clerkUser, plans] = await Promise.all([
    currentUser(),
    clerkId
      ? db.plan.findMany({
          where: { user: { clerkId }, deletedAt: null },
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
            targetCompanies: {
              select: { company: { select: { name: true } } },
            },
            problems: {
              select: { id: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
          }}
        >
          {clerkUser?.firstName ? `Hey, ${clerkUser.firstName}` : "Your Plans"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Pick up where you left off or start something new.
        </p>
      </div>

      {/* Plans Grid — hidden when empty so the empty state owns the screen */}
      {plans.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            id={plan.id}
            slug={plan.slug}
            name={plan.name}
            status={plan.status}
            solved={plan.problems.filter((p) => p.status === "SOLVED").length}
            total={plan.problems.length}
            companies={plan.targetCompanies.slice(0, 2).map((tc) => tc.company.name)}
          />
        ))}

        {/* Create new plan card */}
        <Link
          href="/dashboard/plans/new"
          className="group aspect-[3/4] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 hover:border-[var(--border-hover)] hover:shadow-md"
          style={{ borderColor: "var(--border)", background: "transparent" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ background: "var(--bg-input)" }}
          >
            <Plus className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
          </div>
          <span
            className="text-xs font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            New Plan
          </span>
        </Link>
      </div>
      )}

      {/* Empty state */}
      {plans.length === 0 && (
        <div className="text-center py-16">
          <div className="flex justify-center mb-6">
            <InfinityLogo className="w-16 h-16" />
          </div>
          <h3
            className="text-xl font-semibold mb-2"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
            }}
          >
            No plans yet
          </h3>
          <p className="text-sm max-w-sm mx-auto mb-6" style={{ color: "var(--text-secondary)" }}>
            Create your first preparation plan to get a personalized roadmap
            tailored to your target companies and timeline.
          </p>
          <Link
            href="/dashboard/plans/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Plan
          </Link>
        </div>
      )}
    </div>
  );
}
