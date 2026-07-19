import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Plus, Rocket } from "lucide-react";
import { PlanCard } from "@/components/plan-card";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();

  const user = clerkId
    ? await db.user.findUnique({ where: { clerkId } })
    : null;

  const plans = user
    ? await db.plan.findMany({
        where: { userId: user.id, deletedAt: null },
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
    : [];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {clerkUser?.firstName ? `Hey, ${clerkUser.firstName}` : "Your Plans"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Pick up where you left off or start something new.
        </p>
      </div>

      {/* Plans Grid — Netflix style */}
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
          className="group aspect-[3/4] rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-primary/40 bg-transparent hover:bg-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-[var(--muted-foreground)] group-hover:text-primary transition-colors" />
          </div>
          <span className="text-xs font-medium text-[var(--muted-foreground)] group-hover:text-primary transition-colors">
            New Plan
          </span>
        </Link>
      </div>

      {/* Empty state */}
      {plans.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-[rgba(139,92,246,0.06)] flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-10 h-10 text-[#8b5cf6]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No plans yet
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto mb-6">
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
