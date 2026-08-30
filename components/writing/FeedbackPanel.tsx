"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, BookOpen } from "lucide-react";
import type { WritingFeedback } from "@/types";

type FeedbackData = Omit<WritingFeedback, "id" | "submissionId">;

interface FeedbackPanelProps {
  feedback: FeedbackData;
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  const [tab, setTab] = useState<"overview" | "grammar" | "words">("overview");

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-2 text-sm font-medium">
        {([
          ["overview", "Overview"],
          ["grammar",  "Grammar"],
          ["words",    "Better Words"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              tab === id
                ? "bg-writing-500 text-white border-writing-500"
                : "border-neutral-200 text-neutral-600 hover:border-writing-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          {/* Strengths */}
          <div className="bg-success-50 border border-success-200 rounded-2xl px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-success-500 shrink-0" />
              <p className="text-sm font-bold text-success-800">What You Did Well</p>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-success-700">
                  <span className="text-success-400 mt-0.5 shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="bg-warning-50 border border-warning-200 rounded-2xl px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-warning-500 shrink-0" />
              <p className="text-sm font-bold text-warning-800">Areas to Improve</p>
            </div>
            <ul className="space-y-2">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-warning-700">
                  <span className="text-warning-400 mt-0.5 shrink-0">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Overall comment */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-brand-500 shrink-0" />
              <p className="text-sm font-bold text-brand-800">Overall Feedback</p>
            </div>
            <p className="text-sm text-brand-700 leading-relaxed">{feedback.overallComment}</p>
          </div>
        </div>
      )}

      {tab === "grammar" && (
        <div className="space-y-3">
          {feedback.grammarCorrections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">✓</p>
              <p className="text-sm font-semibold text-success-700">No major grammar issues found!</p>
            </div>
          ) : (
            feedback.grammarCorrections.map((gc, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-card px-4 py-3 space-y-2">
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="bg-error-50 rounded-lg px-3 py-2 border border-error-100">
                    <p className="text-2xs font-semibold text-error-500 uppercase mb-0.5">Original</p>
                    <p className="text-error-700 leading-relaxed">&ldquo;{gc.original}&rdquo;</p>
                  </div>
                  <div className="bg-success-50 rounded-lg px-3 py-2 border border-success-100">
                    <p className="text-2xs font-semibold text-success-500 uppercase mb-0.5">Suggested</p>
                    <p className="text-success-700 leading-relaxed">&ldquo;{gc.suggested}&rdquo;</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{gc.explanation}</p>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "words" && (
        <div className="space-y-3">
          {feedback.wordSuggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">📖</p>
              <p className="text-sm text-neutral-400">No word suggestions for this piece.</p>
            </div>
          ) : (
            feedback.wordSuggestions.map((ws, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-card px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-vocab-500" />
                  <span className="text-sm font-medium text-neutral-500">
                    Instead of <span className="font-semibold text-neutral-700">&ldquo;{ws.original}&rdquo;</span>, try:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ws.alternatives.map((s) => (
                    <span key={s} className="px-3 py-1 bg-vocab-50 text-vocab-700 rounded-full text-sm font-medium border border-vocab-200">
                      {s}
                    </span>
                  ))}
                </div>
                {ws.reason && (
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{ws.reason}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
