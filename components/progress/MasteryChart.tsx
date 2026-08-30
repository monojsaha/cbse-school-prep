"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChapterStat {
  name: string;
  mastery: number;
}

interface MasteryChartProps {
  subject: string;
  data: ChapterStat[];
  color: string;
}

function barColor(val: number) {
  if (val >= 80) return "#22c55e";
  if (val >= 60) return "#6366f1";
  if (val >= 40) return "#f59e0b";
  return "#ef4444";
}

export function MasteryChart({ subject, data, color }: MasteryChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-neutral-400">No practice data yet for {subject}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className={cn("text-sm font-semibold", color)}>{subject}</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -24, bottom: 40 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <Tooltip
            formatter={(v: number) => [`${v}%`, "Mastery"]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Bar dataKey="mastery" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={barColor(d.mastery)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
