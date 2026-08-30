"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface WritingEditorProps {
  prompt: string;
  minWords: number;
  maxWords: number;
  onChange: (text: string) => void;
  disabled?: boolean;
}

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function WritingEditor({ prompt, minWords, maxWords, onChange, disabled }: WritingEditorProps) {
  const [text, setText]     = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null);
  const words               = countWords(text);
  const pct                 = Math.min(100, Math.round((words / minWords) * 100));

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  const handleChange = (v: string) => {
    setText(v);
    onChange(v);
  };

  const barColor =
    words < minWords ? "bg-warning-400" :
    words > maxWords ? "bg-error-400" : "bg-success-500";

  return (
    <div className="space-y-3">
      {/* Prompt reminder */}
      <div className="bg-writing-50 rounded-xl border border-writing-200 px-4 py-3">
        <p className="text-xs font-semibold text-writing-600 uppercase tracking-wider mb-1">Your Prompt</p>
        <p className="text-sm text-writing-900 leading-relaxed font-medium">{prompt}</p>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
        <span className="flex items-center gap-1.5">
          <FileText size={13} />
          <span className={cn(
            words < minWords ? "text-warning-600" : words > maxWords ? "text-error-600" : "text-success-600"
          )}>
            {words} words
          </span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-400">{minWords}–{maxWords} required</span>
        </span>
        <span className="flex items-center gap-1 text-neutral-500">
          <Clock size={13} />
          {mins}:{secs}
        </span>
      </div>

      {/* Word count bar */}
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        placeholder="Start writing here… take your time and express yourself clearly."
        rows={16}
        className={cn(
          "w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4",
          "text-sm leading-relaxed text-neutral-800 placeholder:text-neutral-400",
          "focus:outline-none focus:ring-2 focus:ring-writing-400 focus:border-transparent",
          "font-[inherit] shadow-card transition-shadow hover:shadow-card-md",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      />

      {words > maxWords && (
        <p className="text-xs text-error-600 font-medium">
          {words - maxWords} word{words - maxWords > 1 ? "s" : ""} over limit — please trim your response.
        </p>
      )}
    </div>
  );
}
