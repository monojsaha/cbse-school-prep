import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border text-sm px-3 py-2.5",
            "bg-white text-neutral-800 placeholder:text-neutral-400",
            "transition-colors duration-150 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            error
              ? "border-error-400 focus:ring-error-500"
              : "border-neutral-200 hover:border-neutral-300",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error-600">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
