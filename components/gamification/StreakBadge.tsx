import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  compact?: boolean;
  className?: string;
}

export function StreakBadge({ streak, compact, className }: StreakBadgeProps) {
  const color =
    streak >= 30 ? "text-red-600 bg-red-50 border-red-200"
    : streak >= 7  ? "text-orange-600 bg-orange-50 border-orange-200"
    : streak >= 3  ? "text-amber-600 bg-amber-50 border-amber-200"
    :                "text-neutral-600 bg-neutral-50 border-neutral-200";

  if (compact) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", color, "px-1.5 py-0.5 rounded-full border", className)}>
        <Flame size={11} className="fill-current opacity-80" />
        {streak}d
      </span>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold", color, className)}>
      <Flame size={15} className="fill-current opacity-80" />
      <span>{streak} day streak</span>
    </div>
  );
}
