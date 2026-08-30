"use client";

import { useState } from "react";
import { Lightbulb, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { QuestionHint } from "@/types";

interface HintSystemProps {
  hints: QuestionHint[];
  revealed: number;       // how many hints shown (0, 1, 2, 3)
  onReveal: () => void;   // parent tracks XP cost
  disabled?: boolean;
}

export function HintSystem({ hints, revealed, onReveal, disabled }: HintSystemProps) {
  const [expanded, setExpanded] = useState(false);

  if (hints.length === 0) return null;

  const canRevealMore = revealed < hints.length;
  const xpCost = canRevealMore ? 1 : 0;

  return (
    <div className={cn(
      "rounded-xl border transition-colors",
      revealed > 0 ? "border-warning-200 bg-warning-50" : "border-neutral-200 bg-neutral-50"
    )}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Lightbulb size={15} className={revealed > 0 ? "text-warning-500" : "text-neutral-400"} />
          <span className={cn("text-sm font-medium", revealed > 0 ? "text-warning-700" : "text-neutral-600")}>
            {revealed > 0 ? `Hint ${revealed} of ${hints.length} shown` : "Need a hint?"}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-neutral-400 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Revealed hints */}
          {hints.slice(0, revealed).map((hint, i) => (
            <div key={hint.id} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-full bg-warning-400 text-white text-2xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-warning-800 leading-relaxed">{hint.text}</p>
            </div>
          ))}

          {/* Reveal next button */}
          {canRevealMore && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReveal}
              className="text-warning-600 hover:bg-warning-100 w-full justify-center border border-warning-200"
            >
              <Lightbulb size={14} className="mr-1" />
              Reveal Hint {revealed + 1} (−{xpCost} XP)
            </Button>
          )}

          {!canRevealMore && (
            <p className="text-xs text-warning-600 text-center font-medium">
              All hints revealed
            </p>
          )}
        </div>
      )}
    </div>
  );
}
