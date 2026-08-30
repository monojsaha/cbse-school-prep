import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Difficulty, MasteryLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return formatDate(iso);
}

// ─── XP System ────────────────────────────────────────────────────────────────

const XP_TABLE: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
  challenge: 25,
};

export function xpForQuestion(difficulty: Difficulty, hintsUsed: number): number {
  return Math.max(1, XP_TABLE[difficulty] - hintsUsed);
}

export function xpForLevel(level: number): number {
  // Level n requires n*(n+1)*50 cumulative XP
  return level * (level + 1) * 50;
}

export function levelFromXP(xp: number): number {
  // xpForLevel(n) = n*(n+1)*50 is the XP required to reach level n+1
  let level = 1;
  while (xpForLevel(level) <= xp) level++;
  return level;
}

export function xpProgressInLevel(xp: number): { current: number; required: number; pct: number } {
  const level = levelFromXP(xp);
  // XP threshold to reach this level (= XP threshold of previous level)
  const start = level <= 1 ? 0 : xpForLevel(level - 1);
  const end = xpForLevel(level);
  const current = xp - start;
  const required = end - start;
  return { current, required, pct: Math.round((current / required) * 100) };
}

// ─── Mastery System ──────────────────────────────────────────────────────────

export function masteryLevel(pct: number): MasteryLevel {
  if (pct < 40) return "needs_work";
  if (pct < 60) return "developing";
  if (pct < 80) return "good";
  if (pct < 90) return "strong";
  return "mastered";
}

export function masteryLabel(level: MasteryLevel): string {
  const labels: Record<MasteryLevel, string> = {
    needs_work: "Needs Work",
    developing: "Developing",
    good: "Good",
    strong: "Strong",
    mastered: "Mastered",
  };
  return labels[level];
}

export function masteryColor(level: MasteryLevel): string {
  const colors: Record<MasteryLevel, string> = {
    needs_work: "text-error-600 bg-error-50",
    developing: "text-warning-600 bg-warning-50",
    good: "text-brand-600 bg-brand-50",
    strong: "text-chemistry-600 bg-chemistry-50",
    mastered: "text-success-600 bg-success-50",
  };
  return colors[level];
}

// ─── Subject Utilities ────────────────────────────────────────────────────────

export const SUBJECT_CONFIG = {
  mathematics: {
    label: "Mathematics",
    color: "math",
    bgClass: "bg-math-50",
    textClass: "text-math-600",
    borderClass: "border-math-200",
    icon: "Calculator",
  },
  physics: {
    label: "Physics",
    color: "physics",
    bgClass: "bg-physics-50",
    textClass: "text-physics-600",
    borderClass: "border-physics-200",
    icon: "Atom",
  },
  chemistry: {
    label: "Chemistry",
    color: "chemistry",
    bgClass: "bg-chemistry-50",
    textClass: "text-chemistry-600",
    borderClass: "border-chemistry-200",
    icon: "FlaskConical",
  },
  biology: {
    label: "Biology",
    color: "biology",
    bgClass: "bg-biology-50",
    textClass: "text-biology-600",
    borderClass: "border-biology-200",
    icon: "Leaf",
  },
  "english-grammar": {
    label: "English Grammar",
    color: "grammar",
    bgClass: "bg-grammar-50",
    textClass: "text-grammar-600",
    borderClass: "border-grammar-200",
    icon: "BookA",
  },
  geography: {
    label: "Geography",
    color: "geo",
    bgClass: "bg-geo-50",
    textClass: "text-geo-600",
    borderClass: "border-geo-200",
    icon: "Globe",
  },
  history: {
    label: "History",
    color: "history",
    bgClass: "bg-history-50",
    textClass: "text-history-600",
    borderClass: "border-history-200",
    icon: "Landmark",
  },
  civics: {
    label: "Civics",
    color: "civics",
    bgClass: "bg-civics-50",
    textClass: "text-civics-600",
    borderClass: "border-civics-200",
    icon: "Scale",
  },
  writing: {
    label: "Writing Studio",
    color: "writing",
    bgClass: "bg-writing-50",
    textClass: "text-writing-600",
    borderClass: "border-writing-200",
    icon: "PenLine",
  },
  vocabulary: {
    label: "Word Explorer",
    color: "vocab",
    bgClass: "bg-vocab-50",
    textClass: "text-vocab-600",
    borderClass: "border-vocab-200",
    icon: "BookOpen",
  },
} as const;

// ─── String Helpers ──────────────────────────────────────────────────────────

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Spaced Repetition (SM-2 simplified) ─────────────────────────────────────

export function nextReviewInterval(
  current: number,
  easeFactor: number,
  quality: number // 0-5
): { interval: number; easeFactor: number } {
  const ef = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  let interval: number;
  if (quality < 3) {
    interval = 1;
  } else if (current === 0) {
    interval = 1;
  } else if (current === 1) {
    interval = 4;
  } else {
    interval = Math.round(current * ef);
  }
  return { interval, easeFactor: ef };
}
