import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  bordered?: boolean;
}

const paddings = {
  none: "",
  sm:   "p-3",
  md:   "p-4 sm:p-5",
  lg:   "p-5 sm:p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = "md", hover = false, bordered = true, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-2xl",
        bordered && "border border-neutral-200",
        "shadow-card",
        hover && "transition-shadow duration-200 hover:shadow-card-md cursor-pointer",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold text-neutral-800", className)} {...props}>
      {children}
    </h3>
  );
}
