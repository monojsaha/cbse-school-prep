import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  size?: "xs" | "sm" | "md";
  animated?: boolean;
}

const sizes = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
};

export function Progress({
  value,
  max = 100,
  className,
  trackClassName,
  fillClassName,
  size = "sm",
  animated = false,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={cn("w-full bg-neutral-100 rounded-full overflow-hidden", sizes[size], trackClassName, className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          animated && "animate-pulse-slow",
          fillClassName ?? "bg-brand-500"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
