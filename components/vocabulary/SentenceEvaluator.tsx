"use client";

import { useState } from "react";
import { Send, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Progress } from "@/components/ui/Progress";
import type { VocabEvaluation } from "@/types";

interface SentenceEvaluatorProps {
  word: string;
  meaning: string;
  onSubmit: (sentence: string) => Promise<VocabEvaluation>;
  onDone: (result: VocabEvaluation) => void;
}

export function SentenceEvaluator({ word, meaning, onSubmit, onDone }: SentenceEvaluatorProps) {
  const [sentence, setSentence] = useState("");
  const [result, setResult]     = useState<VocabEvaluation | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!sentence.trim() || loading) return;
    setLoading(true);
    try {
      const eval_ = await onSubmit(sentence.trim());
      setResult(eval_);
      onDone(eval_);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSentence("");
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-brand-50 rounded-xl px-4 py-3 border border-brand-100">
        <p className="text-sm font-semibold text-brand-800 mb-1">Your Challenge</p>
        <p className="text-sm text-brand-700">
          Write your own sentence using the word <strong className="font-bold">&ldquo;{word}&rdquo;</strong>.
          Show that you understand its meaning: <em className="text-brand-600">{meaning}</em>
        </p>
      </div>

      {!result ? (
        <>
          <Textarea
            placeholder={`Write a sentence using "${word}"…`}
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            rows={3}
            hint="Make it your own — don't copy the example sentence."
          />
          <Button
            onClick={handleSubmit}
            disabled={sentence.trim().length < 5 || loading}
            fullWidth
            loading={loading}
            icon={loading ? undefined : <Send size={15} />}
          >
            Evaluate My Sentence
          </Button>
        </>
      ) : (
        <div className="space-y-4 animate-slide-up">
          {/* Score */}
          <div className={cn(
            "rounded-2xl p-4 border",
            result.isCorrect ? "bg-success-50 border-success-200" : "bg-warning-50 border-warning-200"
          )}>
            <div className="flex items-center gap-3 mb-3">
              {result.isCorrect
                ? <CheckCircle2 size={22} className="text-success-500 shrink-0" />
                : <XCircle     size={22} className="text-warning-500 shrink-0" />
              }
              <div className="flex-1">
                <p className={cn(
                  "font-semibold text-sm",
                  result.isCorrect ? "text-success-800" : "text-warning-800"
                )}>
                  {result.isCorrect ? "Correct usage!" : "Almost right — review the feedback below"}
                </p>
              </div>
              <span className={cn(
                "text-xl font-bold",
                result.score >= 80 ? "text-success-600" : result.score >= 60 ? "text-warning-600" : "text-error-600"
              )}>
                {result.score}/100
              </span>
            </div>
            <Progress
              value={result.score}
              fillClassName={result.score >= 80 ? "bg-success-500" : result.score >= 60 ? "bg-warning-500" : "bg-error-500"}
              size="sm"
            />
          </div>

          {/* Your sentence */}
          <div className="bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Your Sentence</p>
            <p className="text-sm text-neutral-800 italic leading-relaxed">&ldquo;{sentence}&rdquo;</p>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-xl px-4 py-3 border border-neutral-200 space-y-2">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Feedback</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{result.feedback}</p>
            {result.suggestion && (
              <div className="bg-brand-50 rounded-lg px-3 py-2 border border-brand-100 mt-2">
                <p className="text-xs font-semibold text-brand-600 mb-1">Suggested improvement</p>
                <p className="text-sm text-brand-800 italic">&ldquo;{result.suggestion}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Meaning", ok: result.meaningCorrect },
              { label: "Grammar", ok: result.grammarCorrect },
              { label: "Context", ok: result.contextCorrect },
            ].map(({ label, ok }) => (
              <div key={label} className={cn(
                "rounded-xl border py-2 px-1",
                ok ? "border-success-200 bg-success-50" : "border-error-100 bg-error-50"
              )}>
                <p className="text-lg mb-0.5">{ok ? "✓" : "✗"}</p>
                <p className={cn("text-xs font-medium", ok ? "text-success-700" : "text-error-700")}>{label}</p>
              </div>
            ))}
          </div>

          {!result.isCorrect && (
            <Button variant="secondary" onClick={reset} icon={<RefreshCw size={14} />} fullWidth>
              Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
