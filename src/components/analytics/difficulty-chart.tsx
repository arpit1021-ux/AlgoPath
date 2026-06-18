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

export function DifficultyChart({ data }: DifficultyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#e5e7eb" name="Assigned" />
        <Bar dataKey="solved" fill="#22c55e" name="Solved" />
      </BarChart>
    </ResponsiveContainer>
  );
}
