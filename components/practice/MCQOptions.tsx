"use client";

import { cn } from "@/lib/utils";
import type { QuestionOption } from "@/types";

interface MCQOptionsProps {
  options: QuestionOption[];
  selected: string | null;
  submitted: boolean;
  correctAnswer: string;
  onSelect: (label: string) => void;
}

export function MCQOptions({ options, selected, submitted, correctAnswer, onSelect }: MCQOptionsProps) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        const isSelected  = selected === opt.label;
        const isCorrect   = opt.label === correctAnswer;
        const isWrong     = submitted && isSelected && !isCorrect;
        const showCorrect = submitted && isCorrect;

        return (
          <button
            key={opt.id}
            type="button"
            disabled={submitted}
            onClick={() => onSelect(opt.label)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left",
              "transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-500",
              "disabled:cursor-default",
              // States
              showCorrect && "border-success-500 bg-success-50",
              isWrong     && "border-error-400 bg-error-50",
              isSelected && !submitted && "border-brand-500 bg-brand-50",
              !isSelected && !submitted && "border-neutral-200 bg-white hover:border-brand-300 hover:bg-brand-50/40",
              !isSelected && submitted && !showCorrect && "border-neutral-200 bg-white opacity-60"
            )}
          >
            {/* Label circle */}
            <span className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              showCorrect && "bg-success-500 text-white",
              isWrong     && "bg-error-500 text-white",
              isSelected && !submitted && "bg-brand-500 text-white",
              !isSelected && !submitted && "bg-neutral-100 text-neutral-500",
              !isSelected && submitted && !showCorrect && "bg-neutral-100 text-neutral-400"
            )}>
              {opt.label}
            </span>

            <span className={cn(
              "text-sm font-medium flex-1",
              showCorrect && "text-success-700",
              isWrong     && "text-error-700",
              isSelected && !submitted && "text-brand-700",
              !showCorrect && !isWrong && !isSelected && "text-neutral-700"
            )}>
              {opt.text}
            </span>

            {submitted && (
              <span className="text-lg shrink-0">
                {showCorrect ? "✓" : isWrong ? "✗" : ""}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
