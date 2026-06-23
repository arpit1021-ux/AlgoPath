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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" fill="transparent" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Bar dataKey="total" fill="#3b3b5c" name="Assigned" />
        <Bar dataKey="solved" fill="#7c3aed" name="Solved" />
      </BarChart>
    </ResponsiveContainer>
  );
}
