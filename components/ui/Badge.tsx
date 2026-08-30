import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export type BadgeVariant =
  | "default" | "brand" | "success" | "warning" | "error"
  | "math" | "physics" | "chemistry" | "writing" | "vocab"
  | "easy" | "medium" | "hard" | "challenge";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variants: Record<BadgeVariant, string> = {
  default:   "bg-neutral-100 text-neutral-600",
  brand:     "bg-brand-50 text-brand-700 border border-brand-200",
  success:   "bg-success-50 text-success-700",
  warning:   "bg-warning-50 text-warning-700",
  error:     "bg-error-50 text-error-700",
  math:      "bg-math-50 text-math-600 border border-math-200",
  physics:   "bg-physics-50 text-physics-600 border border-physics-200",
  chemistry: "bg-chemistry-50 text-chemistry-600 border border-chemistry-200",
  writing:   "bg-writing-50 text-writing-600 border border-writing-200",
  vocab:     "bg-vocab-50 text-vocab-600 border border-vocab-200",
  easy:      "bg-success-50 text-success-700",
  medium:    "bg-warning-50 text-warning-700",
  hard:      "bg-error-50 text-error-700",
  challenge: "bg-brand-50 text-brand-700 border border-brand-200",
};

export function Badge({ variant = "default", size = "sm", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" ? "px-2 py-0.5 text-2xs" : "px-2.5 py-1 text-xs",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
