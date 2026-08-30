import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/Progress";
import type { WritingRubric } from "@/types";

interface RubricDisplayProps {
  scores: WritingRubric;
  totalScore: number;
}

const DIMENSIONS = [
  { key: "content",     label: "Content & Ideas",      weight: 25 },
  { key: "structure",   label: "Structure & Flow",     weight: 20 },
  { key: "grammar",     label: "Grammar & Mechanics",  weight: 20 },
  { key: "vocabulary",  label: "Vocabulary",           weight: 15 },
  { key: "creativity",  label: "Creativity",           weight: 10 },
  { key: "style",       label: "Voice & Style",        weight: 10 },
] as const;

function scoreColor(pct: number) {
  if (pct >= 85) return "bg-success-500";
  if (pct >= 65) return "bg-brand-500";
  if (pct >= 45) return "bg-warning-400";
  return "bg-error-400";
}

function scoreLabel(pct: number) {
  if (pct >= 85) return { text: "Excellent", cls: "text-success-700 bg-success-50 border-success-200" };
  if (pct >= 65) return { text: "Good",      cls: "text-brand-700 bg-brand-50 border-brand-200" };
  if (pct >= 45) return { text: "Fair",      cls: "text-warning-700 bg-warning-50 border-warning-200" };
  return              { text: "Needs Work", cls: "text-error-700 bg-error-50 border-error-200" };
}

export function RubricDisplay({ scores, totalScore }: RubricDisplayProps) {
  const totalLabel = scoreLabel(totalScore);

  return (
    <div className="space-y-4">
      {/* Total score hero */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-neutral-200 shadow-card px-5 py-4">
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Score</p>
          <p className="text-4xl font-bold text-neutral-900 mt-1">{totalScore}<span className="text-lg text-neutral-400 font-normal">/100</span></p>
        </div>
        <span className={cn("px-3 py-1.5 rounded-full text-sm font-semibold border", totalLabel.cls)}>
          {totalLabel.text}
        </span>
      </div>

      {/* Dimension breakdown */}
      <div className="space-y-3">
        {DIMENSIONS.map(({ key, label, weight }) => {
          const raw = (scores as unknown as Record<string, number>)[key] ?? 0;
          const pct = Math.round((raw / weight) * 100);
          return (
            <div key={key} className="bg-white rounded-xl border border-neutral-200 px-4 py-3 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-neutral-700">{label}</p>
                <span className="text-sm font-bold text-neutral-900">{raw}<span className="text-neutral-400 font-normal text-xs">/{weight}</span></span>
              </div>
              <Progress value={pct} fillClassName={scoreColor(pct)} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
