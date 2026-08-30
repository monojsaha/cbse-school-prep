import { Target, Clock, BookOpen, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

interface StatsBarProps {
  accuracy: number;
  minutesThisWeek: number;
  problemsSolved: number;
  writingScore: number | null;
}

export function StatsBar({ accuracy, minutesThisWeek, problemsSolved, writingScore }: StatsBarProps) {
  const stats: Stat[] = [
    { label: "Accuracy",  value: `${accuracy}%`,          icon: Target,   color: "text-success-600 bg-success-50" },
    { label: "This Week", value: `${minutesThisWeek} min`, icon: Clock,    color: "text-brand-600 bg-brand-50" },
    { label: "Solved",    value: problemsSolved,           icon: BookOpen, color: "text-math-600 bg-math-50" },
    { label: "Writing",   value: writingScore ? `${writingScore}/100` : "—", icon: PenLine, color: "text-writing-600 bg-writing-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-2xl border border-neutral-200 shadow-card p-3.5 flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", color)}>
            <Icon size={17} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-neutral-400 truncate">{label}</p>
            <p className="text-base font-bold text-neutral-900 leading-tight">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
