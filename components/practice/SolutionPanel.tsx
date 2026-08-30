"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

interface SolutionPanelProps {
  isCorrect: boolean;
  xpEarned: number;
  studentAnswer: string;
  correctAnswer: string;
  answerUnit?: string;
  explanation: string;
  whyItWorks: string;
  aiExplanation?: string;
  loadingAI?: boolean;
  onNext: () => void;
  onTrySimilar: () => void;
}

export function SolutionPanel({
  isCorrect, xpEarned, studentAnswer, correctAnswer, answerUnit,
  explanation, whyItWorks, aiExplanation, loadingAI,
  onNext, onTrySimilar,
}: SolutionPanelProps) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Result banner */}
      <div className={cn(
        "rounded-2xl p-4 flex items-center gap-3",
        isCorrect ? "bg-success-50 border border-success-200" : "bg-error-50 border border-error-200"
      )}>
        {isCorrect
          ? <CheckCircle2 size={24} className="text-success-500 shrink-0" />
          : <XCircle     size={24} className="text-error-500 shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm", isCorrect ? "text-success-800" : "text-error-800")}>
            {isCorrect ? "Correct! Well done!" : "Not quite right."}
          </p>
          <p className={cn("text-xs mt-0.5", isCorrect ? "text-success-600" : "text-error-600")}>
            {isCorrect
              ? `You earned +${xpEarned} XP`
              : `The correct answer was: ${correctAnswer}${answerUnit ? " " + answerUnit : ""}`
            }
          </p>
        </div>
        {isCorrect && (
          <Badge variant="brand" size="md" className="font-bold text-xp-600 bg-xp-50 border-xp-200">
            +{xpEarned} XP
          </Badge>
        )}
      </div>

      {/* Your answer vs correct */}
      {!isCorrect && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-error-50 rounded-xl border border-error-200 p-3">
            <p className="text-2xs text-error-500 font-semibold uppercase tracking-wider mb-1">Your Answer</p>
            <p className="text-sm font-semibold text-error-800">{studentAnswer || "—"}</p>
          </div>
          <div className="bg-success-50 rounded-xl border border-success-200 p-3">
            <p className="text-2xs text-success-500 font-semibold uppercase tracking-wider mb-1">Correct Answer</p>
            <p className="text-sm font-semibold text-success-800">
              {correctAnswer}{answerUnit ? " " + answerUnit : ""}
            </p>
          </div>
        </div>
      )}

      {/* Step-by-step solution */}
      <Card padding="md">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Step-by-Step Solution
        </p>
        <div className="prose-sf whitespace-pre-line text-sm leading-relaxed text-neutral-700">
          {explanation}
        </div>
      </Card>

      {/* AI explanation (dynamic, fetched from API) */}
      {loadingAI && (
        <div className="flex items-center gap-2 py-2">
          <Spinner size="sm" />
          <span className="text-sm text-neutral-400">Getting personalised explanation…</span>
        </div>
      )}
      {aiExplanation && (
        <Card padding="md" className="border-brand-100 bg-brand-50/50">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-brand-500" />
            <p className="text-xs font-semibold text-brand-700">AI Explanation</p>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">{aiExplanation}</p>
        </Card>
      )}

      {/* Why this works */}
      <button
        type="button"
        onClick={() => setShowWhy((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-neutral-200 hover:border-brand-300 transition-colors text-left"
      >
        <span className="text-sm font-medium text-neutral-700">
          💡 Why does this work?
        </span>
        <ChevronRight
          size={16}
          className={cn("text-neutral-400 transition-transform", showWhy && "rotate-90")}
        />
      </button>
      {showWhy && (
        <div className="px-4 py-3 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-900 leading-relaxed">{whyItWorks}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onTrySimilar}
          icon={<RefreshCw size={15} />}
          className="flex-1"
        >
          Try Similar
        </Button>
        <Button onClick={onNext} iconRight={<ChevronRight size={15} />} className="flex-1">
          Next Question
        </Button>
      </div>
    </div>
  );
}
