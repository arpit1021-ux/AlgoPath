"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DifficultyChartProps {
  data: Array<{ name: string; total: number; solved: number }>;
}

const getCSSVar = (name: string) => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
};

export function DifficultyChart({ data }: DifficultyChartProps) {
  const bgSecondary = getCSSVar("--bg-secondary") || "#0d0d1a";
  const border = getCSSVar("--border") || "rgba(255,255,255,0.08)";
  const textPrimary = getCSSVar("--text-primary") || "#f8fafc";
  const textSecondary = getCSSVar("--text-secondary") || "#94a3b8";

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} style={{ background: "transparent" }}>
        <CartesianGrid strokeDasharray="3 3" stroke={border} fill="transparent" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: textSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: textSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: bgSecondary,
            border: `1px solid ${border}`,
            borderRadius: "12px",
            color: textPrimary,
            fontSize: "13px",
          }}
          labelStyle={{ color: textSecondary }}
          cursor={{ fill: "rgba(99,102,241,0.05)" }}
        />
        <Bar dataKey="total" fill="rgba(99,102,241,0.2)" radius={[4, 4, 0, 0]} name="Assigned" />
        <Bar dataKey="solved" fill="#6366f1" radius={[4, 4, 0, 0]} name="Solved" />
      </BarChart>
    </ResponsiveContainer>
  );
}
