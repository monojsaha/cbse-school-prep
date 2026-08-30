"use client";

import { useState } from "react";
import { Volume2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { VocabularyWord } from "@/types";

interface WordCardProps {
  word: VocabularyWord;
  isNew?: boolean;
}

export function WordCard({ word, isNew }: WordCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-vocab-200 shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-vocab-50 to-pink-50 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-2">
          {isNew && (
            <Badge variant="vocab" size="sm" className="mb-2">New Word</Badge>
          )}
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-neutral-900 capitalize">{word.word}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-neutral-500 italic">{word.pronunciation}</span>
              <button
                type="button"
                aria-label="Hear pronunciation"
                className="text-neutral-400 hover:text-vocab-500 transition-colors"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    const u = new SpeechSynthesisUtterance(word.word);
                    u.lang = "en-IN";
                    window.speechSynthesis.speak(u);
                  }
                }}
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>
          <Badge variant="default" className="shrink-0 capitalize mt-1">{word.partOfSpeech}</Badge>
        </div>
      </div>

      {/* Meaning */}
      <div className="px-5 py-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Meaning</p>
          <p className="text-sm font-semibold text-neutral-800">{word.meaning}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Simple Explanation</p>
          <p className="text-sm text-neutral-600 leading-relaxed">{word.simpleExplanation}</p>
        </div>
        <div className="bg-neutral-50 rounded-xl px-3 py-2.5 border border-neutral-100">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Example</p>
          <p className="text-sm text-neutral-700 italic leading-relaxed">
            &ldquo;{word.exampleSentence}&rdquo;
          </p>
        </div>

        {/* Expand for synonyms/antonyms */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between text-sm text-brand-600 hover:text-brand-700 font-medium py-1"
        >
          <span>Synonyms &amp; Antonyms</span>
          <ChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
        </button>

        {expanded && (
          <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
            <div>
              <p className="text-xs font-semibold text-success-600 uppercase tracking-wider mb-2">Synonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {word.synonyms.map((s) => (
                  <span key={s} className="px-2 py-1 bg-success-50 text-success-700 rounded-lg text-xs font-medium border border-success-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-error-600 uppercase tracking-wider mb-2">Antonyms</p>
              <div className="flex flex-wrap gap-1.5">
                {word.antonyms.map((a) => (
                  <span key={a} className="px-2 py-1 bg-error-50 text-error-700 rounded-lg text-xs font-medium border border-error-100">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
