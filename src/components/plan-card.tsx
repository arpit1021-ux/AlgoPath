"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ProgressBar } from "@/components/ui-custom";
import { showToast } from "@/components/ui/toast";

function InfinityLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="20" fill="url(#plan-card-logo)" />
      <path
        d="M50,30 C50,15 30,15 30,30 C30,45 50,45 50,30 C50,15 70,15 70,30 C70,45 50,45 50,30 Z"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="plan-card-logo" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#ffa116" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
      </defs>
    </svg>
  );
}

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
  const [isHovered, setIsHovered] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Move focus into the dialog on open, restore it to the trigger on close,
  // and let Escape cancel from anywhere.
  useEffect(() => {
    if (!showDelete) return;
    cancelRef.current?.focus();
    // Captured now: by the time cleanup runs the ref may point somewhere else,
    // and focus has to return to the button that opened the dialog.
    const trigger = triggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDelete(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [showDelete]);

  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast({ message: "Plan deleted successfully", type: "success" });
        setShowDelete(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast({ message: data.error || "Failed to delete plan", type: "error" });
        setDeleting(false);
      }
    } catch {
      showToast({ message: "Network error — please try again", type: "error" });
      setDeleting(false);
    }
  };

  return (
    <>
    <div
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
      style={{
        background: "var(--bg-card)",
        border: isHovered ? "1px solid var(--border-hover)" : "1px solid var(--border)",
        boxShadow: isHovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: isHovered ? "translateY(-2px)" : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete button */}
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDelete(true);
        }}
        className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1.5 rounded-lg backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.5)", color: "var(--danger)" }}
        title={`Delete ${name}`}
        aria-label={`Delete ${name}`}
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      <Link href={`/dashboard/plans/${slug}`} className="contents">
        {/* Header with infinity logo */}
        <div
          className="h-1/2 relative flex items-center justify-center transition-all duration-300"
          style={{
            background: isHovered
              ? "linear-gradient(135deg, rgba(255,161,22,0.08) 0%, rgba(255,107,53,0.04) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          }}
        >
          <div
            className="transition-transform duration-300"
            style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
          >
            <InfinityLogo />
          </div>
          <span
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              background: status === "GENERATING"
                ? "var(--accent-dim)"
                : status === "FAILED"
                  ? "var(--danger-dim)"
                  : "rgba(44,187,93,0.12)",
              color: status === "GENERATING"
                ? "var(--accent)"
                : status === "FAILED"
                  ? "var(--danger)"
                  : "#2cbb5d",
              border: `1px solid ${
                status === "GENERATING"
                  ? "var(--accent-border)"
                  : status === "FAILED"
                    ? "rgba(239,68,68,0.2)"
                    : "rgba(44,187,93,0.2)"
              }`,
            }}
          >
            {status === "GENERATING" ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin inline-block" />
                Building...
              </span>
            ) : (
              status
            )}
          </span>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3
              className="font-semibold text-sm truncate transition-colors"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
              }}
            >
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
              <span style={{ color: "var(--text-muted)" }}>{solved}/{total}</span>
              <span style={{ color: "var(--text-muted)" }}>{pct}%</span>
            </div>
            <ProgressBar value={pct} />
          </div>
        </div>
      </Link>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-title-${id}`}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowDelete(false); setDeleting(false); }}
          />
          <div
            className="relative rounded-2xl p-6 max-w-sm w-full mx-4"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              id={`delete-title-${id}`}
              className="text-base font-semibold mb-2"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
              }}
            >
              Delete &ldquo;{name}&rdquo;?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              This will permanently delete this plan and all its progress. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                ref={cancelRef}
                onClick={() => { setShowDelete(false); setDeleting(false); }}
                className="btn-secondary text-sm py-2 px-4"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm py-2 px-4 rounded-lg font-medium text-white transition-all disabled:opacity-50"
                style={{ background: "var(--danger)" }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
