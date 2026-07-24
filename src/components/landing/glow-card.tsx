"use client";

import { ReactNode } from "react";

interface GlowCardProps {
  index: number;
  total: number;
  number: string;
  title: string;
  description: string;
  iconSquares?: [string, string, string, string];
  children?: ReactNode;
  className?: string;
  wide?: boolean;
  accentWord?: string;
  isHovered?: boolean;
  hasHover?: boolean;
  onHover?: () => void;
}

export function GlowCard({
  index,
  total,
  number,
  title,
  description,
  iconSquares = ["#86868b", "#a1a1a6", "#d2d2d7", "#e8e8ed"],
  children,
  className = "",
  wide = false,
  accentWord,
  isHovered = false,
  hasHover = false,
  onHover,
}: GlowCardProps) {
  const words = title.split(" ");
  const accent = accentWord || words[0];
  const rest = accentWord ? title.slice(accentWord.length).trim() : words.slice(1).join(" ");

  const isBlurred = hasHover && !isHovered;

  return (
    <div
      className={`group relative rounded-2xl p-6 transition-all duration-500 ${wide ? "col-span-2" : ""} ${className}`}
      style={{
        background: isHovered
          ? "rgba(255, 255, 255, 0.08)"
          : "var(--bg-card)",
        border: isHovered
          ? "1px solid var(--border-hover)"
          : "1px solid var(--border)",
        boxShadow: isHovered
          ? "var(--shadow-md)"
          : "none",
        backdropFilter: "blur(12px)",
        opacity: isBlurred ? 0.3 : 1,
        filter: isBlurred ? "blur(4px)" : "none",
        transform: isHovered ? "scale(1.02)" : isBlurred ? "scale(0.97)" : "scale(1)",
        cursor: "pointer",
      }}
      onMouseEnter={onHover}
    >
      {/* Watermark number */}
      <div
        className="absolute -bottom-4 -right-2 select-none pointer-events-none transition-all duration-500"
        style={{
          fontSize: "clamp(4rem, 10vw, 7rem)",
          lineHeight: 1,
          fontWeight: 900,
          color: isHovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
        }}
      >
        {number}
      </div>

      {/* Numbered badge + icon grid */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-500"
          style={{
            background: isHovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
            color: "#f5f5f7",
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
          }}
        >
          {number}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {iconSquares.map((color, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-sm transition-all duration-500"
              style={{
                background: color,
                opacity: isHovered ? 1 : 0.6,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-2 transition-colors duration-500" style={{ color: "#f5f5f7" }}>
        <span style={{ color: isHovered ? "#f5f5f7" : "#a1a1a6" }}>{accent}</span>
        {rest ? ` ${rest}` : ""}
      </h3>
      <p className="text-sm leading-relaxed transition-colors duration-500" style={{ color: isHovered ? "#d2d2d7" : "#6e6e73" }}>
        {description}
      </p>

      {children}

      {/* Bottom progress bar */}
      <div
        className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full mt-6"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full origin-left"
          style={{
            width: `${((index + 1) / total) * 100}%`,
            background: isHovered
              ? "linear-gradient(90deg, #ffa116, #94a3b8)"
              : "linear-gradient(90deg, #64748b, #94a3b8)",
            opacity: isHovered ? 0.8 : 0.4,
            transform: "scaleX(1)",
            transition: "all 0.5s ease",
          }}
        />
      </div>

      {/* Corner accent */}
      <div
        className="absolute top-6 right-6 w-2 h-2 rounded-full transition-all duration-500"
        style={{
          background: isHovered ? "rgba(255, 161, 22, 0.5)" : "rgba(255,255,255,0.1)",
          boxShadow: isHovered ? "0 0 6px rgba(255, 161, 22, 0.3)" : "none",
        }}
      />
    </div>
  );
}
