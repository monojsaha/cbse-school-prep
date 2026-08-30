import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-xl border text-sm",
              "bg-white text-neutral-800 placeholder:text-neutral-400",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
              error
                ? "border-error-400 focus:ring-error-500"
                : "border-neutral-200 hover:border-neutral-300",
              icon ? "pl-9 pr-3" : "px-3",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-error-600">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
