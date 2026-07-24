"use client";

import { cn } from "@/lib/utils";

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string;
  className?: string;
}) {
  const colors: Record<string, string> = {
    EASY: "text-[#34d399] bg-[rgba(52,211,153,0.08)] border-[rgba(52,211,153,0.15)]",
    MEDIUM: "text-[#fbbf24] bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.15)]",
    HARD: "text-[#f87171] bg-[rgba(248,113,113,0.08)] border-[rgba(248,113,113,0.15)]",
  };
  const label = difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium",
        colors[difficulty] || colors.EASY,
        className
      )}
    >
      {label}
    </span>
  );
}

export function ProgressBar({
  value,
  max = 100,
  height = 4,
  className,
  color,
}: {
  value: number;
  max?: number;
  height?: number;
  className?: string;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn(
        "w-full rounded-full overflow-hidden",
        className
      )}
      style={{ height, background: "rgba(255,255,255,0.06)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: color || "linear-gradient(90deg, #ffa116, #94a3b8)",
        }}
      />
    </div>
  );
}

export function AmbientBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
          top: "-10%",
          left: "20%",
          animation: "orbDrift1 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)",
          top: "40%",
          right: "10%",
          animation: "orbDrift2 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)",
          bottom: "10%",
          left: "40%",
          animation: "orbDrift1 20s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}

export function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  progress,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  sub?: string;
  progress?: number;
}) {
  return (
    <div className="card-surface-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
          }}
        >
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div
        className="text-[28px] font-bold tracking-tight"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
        }}
      >
        {value}
      </div>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
      {progress !== undefined && (
        <ProgressBar value={progress} className="mt-3" />
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card-surface p-6 space-y-4">
      <div className="h-4 bg-white/[0.04] rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-white/[0.04] rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-white/[0.04] rounded w-full animate-pulse" />
      <div className="h-2 bg-white/[0.04] rounded w-full animate-pulse" />
    </div>
  );
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards", opacity: 0 }}
    >
      {children}
    </div>
  );
}
