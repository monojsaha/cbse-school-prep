"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PenLine, Clock, Star, Lightbulb } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { getWritingPrompts } from "@/lib/firebase/firestore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import type { WritingPrompt } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  story:      "Creative Story",
  essay:      "Essay",
  letter:     "Letter",
  diary:      "Diary Entry",
  speech:     "Speech",
  report:     "Report",
  poem:       "Poem",
  dialogue:   "Dialogue",
};

const TYPE_COLORS: Record<string, string> = {
  story:    "bg-writing-50  border-writing-200  text-writing-700",
  essay:    "bg-brand-50    border-brand-200    text-brand-700",
  letter:   "bg-success-50  border-success-200  text-success-700",
  diary:    "bg-vocab-50    border-vocab-200    text-vocab-700",
  speech:   "bg-physics-50  border-physics-200  text-physics-700",
  report:   "bg-math-50     border-math-200     text-math-700",
  poem:     "bg-xp-50       border-xp-200       text-xp-700",
  dialogue: "bg-neutral-50  border-neutral-200  text-neutral-700",
};

const DIFF_BADGE: Record<string, "success" | "warning" | "error"> = {
  easy: "success", medium: "warning", hard: "error",
};

export default function WritingPage() {
  const { profile }           = useAuth();
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [filter, setFilter]   = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.classId) return;
    getWritingPrompts(profile.classId).then((p) => {
      setPrompts(p);
      setLoading(false);
    });
  }, [profile?.classId]);

  const types = ["all", ...Array.from(new Set(prompts.map((p) => p.writingType)))];
  const visible = filter === "all" ? prompts : prompts.filter((p) => p.writingType === filter);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Writing Studio</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Pick a prompt and start writing</p>
        </div>
        <span className="text-3xl">✍️</span>
      </div>

      {/* Quick tips */}
      <div className="bg-writing-50 rounded-2xl border border-writing-200 px-4 py-3 flex gap-3">
        <Lightbulb size={16} className="text-writing-500 shrink-0 mt-0.5" />
        <p className="text-sm text-writing-700 leading-relaxed">
          <strong>Tip:</strong> Read the prompt carefully before writing. Plan for 2 minutes, write for 15, and review for 3.
        </p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize",
              filter === t
                ? "bg-writing-500 text-white border-writing-500"
                : "border-neutral-200 text-neutral-600 hover:border-writing-300"
            )}
          >
            {t === "all" ? "All Types" : TYPE_LABELS[t] ?? t}
          </button>
        ))}
      </div>

      {/* Prompt cards */}
      {visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">📝</p>
          <p className="text-sm text-neutral-400">No prompts available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((prompt) => (
            <div
              key={prompt.id}
              className={cn(
                "bg-white rounded-2xl border shadow-card p-4 transition-shadow hover:shadow-card-hover",
                TYPE_COLORS[prompt.writingType] ?? "border-neutral-200"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-writing-100 flex items-center justify-center shrink-0 mt-0.5">
                  <PenLine size={15} className="text-writing-600" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={DIFF_BADGE[prompt.difficulty] ?? "default"} size="sm" className="capitalize">
                      {prompt.difficulty}
                    </Badge>
                    <Badge variant="default" size="sm" className="capitalize">
                      {TYPE_LABELS[prompt.writingType] ?? prompt.writingType}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <Clock size={11} />
                      {prompt.minWords}–{prompt.maxWords} words
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">{prompt.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">{prompt.topicText}</p>
                  <Link href={`/writing/session?promptId=${prompt.id}`}>
                    <Button size="sm" className="mt-2 bg-writing-500 hover:bg-writing-600 border-0">
                      <Star size={13} className="mr-1" />
                      Start Writing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
