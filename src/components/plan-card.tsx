"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket, Trash2 } from "lucide-react";
import { ProgressBar } from "@/components/ui-custom";

interface PlanCardProps {
  id: string;
  slug: string;
  name: string;
  status: string;
  solved: number;
  total: number;
  companies: string[];
}

export function PlanCard({ id, slug, name, status, solved, total, companies }: PlanCardProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete plan.");
      }
    } catch {
      alert("Failed to delete plan.");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <div
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 flex flex-col"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setShowDelete(true);
        }}
        className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-[#f87171] hover:bg-[rgba(248,113,113,0.2)]"
        title="Delete plan"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <Link href={`/dashboard/plans/${slug}`} className="contents">
        {/* Gradient header */}
        <div className="h-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Rocket className="w-10 h-10 text-primary/30 -rotate-12" />
          </div>
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(52,211,153,0.12)] text-[#34d399] border border-[rgba(52,211,153,0.2)]">
            {status}
          </span>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors" style={{ color: "var(--text-primary)" }}>
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              {companies.map((c) => (
                <span
                  key={c}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  {c}
                </span>
              ))}
              {companies.length > 2 && (
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>+{companies.length - 2}</span>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{solved}/{total}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{pct}%</span>
            </div>
            <ProgressBar value={pct} />
          </div>
        </div>
      </Link>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDelete(false)}
          />
          <div className="relative bg-[#12131a] border border-white/[0.06] rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-[#f0f0f5] mb-2">
              Delete &ldquo;{name}&rdquo;?
            </h3>
            <p className="text-sm text-[#8b8d9e] mb-6">
              This will permanently delete this plan and all its progress. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDelete(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm py-2 px-4 rounded-lg font-medium bg-[#f87171] text-white hover:brightness-110 transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
