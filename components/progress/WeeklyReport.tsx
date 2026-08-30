"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

interface WeeklyReportProps {
  stats: {
    questionsAttempted: number;
    accuracy: number;
    wordsLearned: number;
    writingScore: number;
    streakDays: number;
    xpEarned: number;
  };
}

export function WeeklyReport({ stats }: WeeklyReportProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/ai/weekly-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats),
    })
      .then((r) => r.json())
      .then((d) => setReport(d.report))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-2xl border border-brand-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-brand-500" />
        <p className="text-sm font-bold text-brand-800">AI Weekly Report</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-3">
          <Spinner size="sm" />
        </div>
      ) : report ? (
        <p className="text-sm text-brand-700 leading-relaxed whitespace-pre-line">{report}</p>
      ) : (
        <p className="text-sm text-neutral-400">Report unavailable. Check back later.</p>
      )}
    </div>
  );
}
