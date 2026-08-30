"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";

interface NumericInputProps {
  value: string;
  unit?: string;
  submitted: boolean;
  isCorrect: boolean | null;
  onChange: (val: string) => void;
}

export function NumericInput({ value, unit, submitted, isCorrect, onChange }: NumericInputProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Input
          label="Your Answer"
          type="text"
          inputMode="decimal"
          placeholder="Enter your answer…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={submitted}
          className={cn(
            submitted && isCorrect === true  && "border-success-500 bg-success-50 text-success-700",
            submitted && isCorrect === false && "border-error-400 bg-error-50 text-error-700"
          )}
        />
      </div>
      {unit && (
        <div className={cn(
          "h-10 px-3 rounded-xl border flex items-center text-sm font-medium shrink-0",
          submitted && isCorrect === true  && "border-success-500 bg-success-50 text-success-700",
          submitted && isCorrect === false && "border-error-400 bg-error-50 text-error-700",
          !submitted && "border-neutral-200 bg-neutral-50 text-neutral-500"
        )}>
          {unit}
        </div>
      )}
    </div>
  );
}
