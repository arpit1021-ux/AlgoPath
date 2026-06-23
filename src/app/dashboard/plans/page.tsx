"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Rocket,
  Trash2,
  BarChart3,
  RotateCcw,
  ChevronRight,
  Clock,
  Target,
} from "lucide-react";
import { ProgressBar, SkeletonCard } from "@/components/ui-custom";
import { cn } from "@/lib/utils";

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

const statusColors: Record<string, string> = {
  ACTIVE: "bg-[rgba(52,211,153,0.08)] text-[#34d399] border-[rgba(52,211,153,0.15)]",
  PAUSED: "bg-[rgba(251,191,36,0.08)] text-[#fbbf24] border-[rgba(251,191,36,0.15)]",
  ARCHIVED: "bg-white/[0.04] text-[#8b8d9e] border-white/[0.06]",
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "progress" | "name">("newest");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredPlans = plans
    .filter((p) => statusFilter === "ALL" || p.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === "progress") {
        const aPct = a.problems.length > 0 ? a.problems.filter((p) => p.status === "SOLVED").length / a.problems.length : 0;
        const bPct = b.problems.length > 0 ? b.problems.filter((p) => p.status === "SOLVED").length / b.problems.length : 0;
        return bPct - aPct;
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const statusCounts = {
    ALL: plans.length,
    ACTIVE: plans.filter((p) => p.status === "ACTIVE").length,
    PAUSED: plans.filter((p) => p.status === "PAUSED").length,
    COMPLETED: plans.filter((p) => p.status === "COMPLETED").length,
  };

  const deletePlan = async (planId: string) => {
    setDeletingId(planId);
    try {
      await fetch(`/api/plans/${planId}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (e) {
      console.error(e);
      alert("Failed to delete plan.");
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/[0.04] rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f0f0f5]">My Plans</h1>
          <p className="text-sm text-[#8b8d9e] mt-1">
            Manage your interview preparation plans.
          </p>
        </div>
        <Link
          href="/dashboard/plans/new"
          className="btn-primary flex items-center gap-2 text-sm self-start"
        >
          <Rocket className="w-4 h-4" />
          New Plan
        </Link>
      </div>

      {/* Filters & Sort */}
      {plans.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
            {(["ALL", "ACTIVE", "PAUSED", "COMPLETED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "text-[#8b8d9e] hover:text-[#f0f0f5]"
                )}
              >
                {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                <span className="ml-1.5 text-[10px] opacity-60">{statusCounts[status]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8b8d9e]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-[#f0f0f5] focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Newest</option>
              <option value="progress">Progress</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="card-surface py-20">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[rgba(139,92,246,0.06)] flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-[#8b5cf6]" />
            </div>
            <h3 className="text-xl font-semibold text-[#f0f0f5] mb-2">
              No plans yet
            </h3>
            <p className="text-sm text-[#8b8d9e] max-w-sm mx-auto mb-6">
              Create your first preparation plan to get a personalized roadmap
              tailored to your target companies and timeline.
            </p>
            <Link
              href="/dashboard/plans/new"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Create Your First Plan
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const solved = plan.problems.filter(
              (p) => p.status === "SOLVED"
            ).length;
            const total = plan.problems.length;
            const pct =
              total > 0 ? Math.round((solved / total) * 100) : 0;

            return (
              <div
                key={plan.id}
                className="card-surface-hover p-6 relative group"
              >
                {/* Delete button */}
                <button
                  onClick={() => setDeleteConfirm(plan.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[rgba(248,113,113,0.1)] text-[#4b4d5e] hover:text-[#f87171]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Title + Status */}
                <div className="flex items-start justify-between mb-3 pr-8">
                  <h3 className="font-semibold text-base text-[#f0f0f5] truncate">
                    {plan.name}
                  </h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium border ${statusColors[plan.status] || statusColors.ARCHIVED}`}
                  >
                    {plan.status}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-[#8b8d9e] mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {plan.timelineWeeks}w · {plan.weeklyHours}h/w
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {plan.experienceLevel.toLowerCase()}
                  </span>
                </div>

                {/* Company Chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {plan.targetCompanies.slice(0, 4).map((tc) => (
                    <span
                      key={tc.company.slug}
                      className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[11px] text-[#8b8d9e]"
                    >
                      {tc.company.name}
                    </span>
                  ))}
                  {plan.targetCompanies.length > 4 && (
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] text-[11px] text-[#4b4d5e]">
                      +{plan.targetCompanies.length - 4}
                    </span>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#4b4d5e] font-medium">Progress</span>
                    <span className="font-medium text-[#8b8d9e]">
                      {solved}/{total} solved · {pct}%
                    </span>
                  </div>
                  <ProgressBar value={pct} />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                      href={`/dashboard/plans/${plan.id}`}
                      className="flex-1 btn-primary text-xs py-2.5 flex items-center justify-center gap-1"
                    >
                      {solved > 0 ? "Resume" : "Start Plan"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                  <Link
                    href={`/dashboard/plans/${plan.id}/analytics`}
                    className="w-9 h-9 rounded-lg border border-white/[0.06] bg-transparent flex items-center justify-center text-[#8b8d9e] hover:bg-[#1a1b26] hover:text-[#f0f0f5] transition-all"
                    title="Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/plans/${plan.id}/revisions`}
                    className="w-9 h-9 rounded-lg border border-white/[0.06] bg-transparent flex items-center justify-center text-[#8b8d9e] hover:bg-[#1a1b26] hover:text-[#f0f0f5] transition-all"
                    title="Revisions"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

        {plans.length > 0 && filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#8b8d9e] mb-3">No plans match this filter</p>
            <button
              onClick={() => setStatusFilter("ALL")}
              className="text-xs text-primary hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-[#12131a] border border-white/[0.06] rounded-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <h3 className="text-base font-semibold text-[#f0f0f5] mb-2">
              Delete Plan
            </h3>
            <p className="text-sm text-[#8b8d9e] mb-6">
              Are you sure you want to delete this plan? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePlan(deleteConfirm)}
                disabled={deletingId !== null}
                className="text-sm py-2 px-4 rounded-lg font-medium bg-[#f87171] text-white hover:brightness-110 transition-all disabled:opacity-50"
              >
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
