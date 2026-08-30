"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Zap, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import {
  getStudentMastery, getStudentAchievements,
} from "@/lib/firebase/firestore";
import { greeting, SUBJECT_CONFIG } from "@/lib/utils";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { SubjectCard } from "@/components/dashboard/SubjectCard";
import { DailyPlan } from "@/components/dashboard/DailyPlan";
import { WeakAreas } from "@/components/dashboard/WeakAreas";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { XPBar } from "@/components/gamification/XPBar";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { BadgeDisplay } from "@/components/gamification/BadgeDisplay";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { StudentMastery, StudentAchievement } from "@/types";

// Demo mastery data shown until real data loads
const DEMO_MASTERY: Record<string, number> = {
  mathematics: 72,
  physics: 68,
  chemistry: 81,
};

const DAILY_PLAN_ITEMS = [
  { label: "Vocabulary — 3 new words",     href: "/vocabulary",           minutes: 5,  color: "bg-vocab-50 border-vocab-100",     textColor: "text-vocab-700" },
  { label: "Algebra — Linear equations",   href: "/practice/mathematics", minutes: 5,  color: "bg-math-50 border-math-100",       textColor: "text-math-700" },
  { label: "Physics — Motion & speed",     href: "/practice/physics",     minutes: 5,  color: "bg-physics-50 border-physics-100", textColor: "text-physics-700" },
  { label: "Writing — Descriptive practice",href: "/writing",             minutes: 5,  color: "bg-writing-50 border-writing-100", textColor: "text-writing-700" },
];

export default function DashboardPage() {
  const { profile } = useAuth();
  const [masteries, setMasteries]     = useState<StudentMastery[]>([]);
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    getStudentMastery(profile.id).then(setMasteries);
    getStudentAchievements(profile.id).then(setAchievements);
  }, [profile?.id]);

  const name      = profile?.name?.split(" ")[0] ?? "Scholar";
  const xp        = profile?.xpTotal ?? 0;
  const streak    = profile?.currentStreak ?? 0;

  // Compute average mastery per subject from real data (fall back to demo)
  const subjectMastery = (slug: string) => {
    const real = masteries.filter((m) => m.topicId.startsWith(slug));
    if (real.length === 0) return DEMO_MASTERY[slug] ?? 0;
    return Math.round(real.reduce((a, b) => a + b.masteryPct, 0) / real.length);
  };

  // Accuracy: correct / total across all attempts
  const totalAttempts = masteries.reduce((a, b) => a + b.attempts, 0);
  const totalCorrect  = masteries.reduce((a, b) => a + b.correct, 0);
  const accuracy      = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-5">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-400">{greeting()}</p>
          <h1 className="text-2xl font-bold text-neutral-900 mt-0.5">
            {name} <span className="text-base font-normal text-neutral-400">👋</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Ready to grow your brain today?</p>
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* ── XP Bar ──────────────────────────────────────────────── */}
      <XPBar xp={xp} />

      {/* ── Stats ───────────────────────────────────────────────── */}
      <StatsBar
        accuracy={accuracy}
        minutesThisWeek={profile?.dailyStudyMinutes ? profile.dailyStudyMinutes * 5 : 45}
        problemsSolved={totalAttempts}
        writingScore={null}
      />

      {/* ── Continue + Daily Challenge ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/practice">
          <Card hover padding="md" className="border-brand-200 bg-gradient-to-br from-brand-500 to-brand-600 border-0 text-white">
            <p className="text-xs text-brand-100 font-medium mb-1">Continue Learning</p>
            <p className="text-base font-bold">Resume Practice</p>
            <p className="text-sm text-brand-200 mt-0.5">Pick up where you left off</p>
            <div className="flex justify-end mt-3">
              <ChevronRight size={20} className="text-brand-200" />
            </div>
          </Card>
        </Link>
        <Link href="/vocabulary">
          <Card hover padding="md" className="border-xp-400/30 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={13} className="text-xp-500 fill-xp-400" />
              <p className="text-xs text-amber-600 font-medium">Daily Challenge</p>
            </div>
            <p className="text-base font-bold text-neutral-900">Today&apos;s Challenge</p>
            <p className="text-sm text-neutral-500 mt-0.5">1 Math · 1 Science · 1 Word</p>
            <div className="flex justify-end mt-3">
              <ChevronRight size={20} className="text-neutral-400" />
            </div>
          </Card>
        </Link>
      </div>

      {/* ── Subject Cards ────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Subjects</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <SubjectCard
            href="/practice/mathematics"
            label="Mathematics"
            icon="Calculator"
            mastery={subjectMastery("mathematics")}
            bgClass={SUBJECT_CONFIG.mathematics.bgClass}
            textClass={SUBJECT_CONFIG.mathematics.textClass}
            borderClass="border-math-200"
            fillClass="bg-math-500"
            description="Class 7 ICSE"
          />
          <SubjectCard
            href="/practice/physics"
            label="Physics"
            icon="Atom"
            mastery={subjectMastery("physics")}
            bgClass={SUBJECT_CONFIG.physics.bgClass}
            textClass={SUBJECT_CONFIG.physics.textClass}
            borderClass="border-physics-200"
            fillClass="bg-physics-500"
            description="Class 7 ICSE"
          />
          <SubjectCard
            href="/practice/chemistry"
            label="Chemistry"
            icon="FlaskConical"
            mastery={subjectMastery("chemistry")}
            bgClass={SUBJECT_CONFIG.chemistry.bgClass}
            textClass={SUBJECT_CONFIG.chemistry.textClass}
            borderClass="border-chemistry-200"
            fillClass="bg-chemistry-500"
            description="Class 7 ICSE"
          />
          <SubjectCard
            href="/writing"
            label="Writing Studio"
            icon="PenLine"
            lastScore={76}
            bgClass={SUBJECT_CONFIG.writing.bgClass}
            textClass={SUBJECT_CONFIG.writing.textClass}
            borderClass="border-writing-200"
            fillClass="bg-writing-500"
            description="Essays & Stories"
          />
          <SubjectCard
            href="/vocabulary"
            label="Word Explorer"
            icon="BookOpen"
            questionsToday={3}
            bgClass={SUBJECT_CONFIG.vocabulary.bgClass}
            textClass={SUBJECT_CONFIG.vocabulary.textClass}
            borderClass="border-vocab-200"
            fillClass="bg-vocab-500"
            description="Daily vocabulary"
          />
          <Link href="/progress">
            <Card hover padding="md" className="border-neutral-200 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-3">
                <Trophy size={20} className="text-neutral-500" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">My Progress</p>
                <p className="text-xs text-neutral-400 mt-0.5">Charts & reports</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* ── Daily Plan + Weak Areas (side by side on desktop) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyPlan totalMinutes={20} items={DAILY_PLAN_ITEMS} />
        <WeakAreas masteries={masteries} topicNames={{}} subjectSlugs={{}} />
      </div>

      {/* ── Streak Calendar ──────────────────────────────────────── */}
      <StreakCalendar studiedDates={[]} />

      {/* ── Badges ──────────────────────────────────────────────── */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>My Badges</CardTitle>
          <Link href="/progress" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5">
            View all <ChevronRight size={12} />
          </Link>
        </CardHeader>
        <BadgeDisplay achievements={achievements} />
      </Card>

      {/* ── Today's words teaser ─────────────────────────────────── */}
      <Card padding="md" className="border-vocab-200 bg-vocab-50/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-800">Today&apos;s Words</h3>
          <Link href="/vocabulary" className="text-xs font-medium text-vocab-600 hover:text-vocab-700 flex items-center gap-0.5">
            Start <ChevronRight size={12} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {["meticulous", "reluctant", "vivid"].map((word) => (
            <span key={word} className="px-3 py-1.5 bg-white rounded-xl border border-vocab-200 text-sm font-medium text-vocab-700 shadow-sm">
              {word}
            </span>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-2">Learn these words + write your own sentences to earn XP</p>
      </Card>

    </div>
  );
}
