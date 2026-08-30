"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  queryDocuments, COL,
} from "@/lib/firebase/firestore";
import { where, orderBy } from "firebase/firestore";
import { masteryLevel, masteryLabel, SUBJECT_CONFIG } from "@/lib/utils";
import { MasteryChart } from "@/components/progress/MasteryChart";
import { WeeklyReport } from "@/components/progress/WeeklyReport";
import { XPBar } from "@/components/gamification/XPBar";
import { BadgeDisplay } from "@/components/gamification/BadgeDisplay";
import { PageLoader } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import type { StudentMastery, StudySession, StudentAchievement } from "@/types";

interface SubjectStat {
  label: string;
  color: string;
  textColor: string;
  chapters: { name: string; mastery: number }[];
  avgMastery: number;
}

export default function ProgressPage() {
  const { profile } = useAuth();

  const [masteries, setMasteries] = useState<StudentMastery[]>([]);
  const [sessions, setSessions]   = useState<StudySession[]>([]);
  const [earned, setEarned]       = useState<StudentAchievement[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([
      queryDocuments<StudentMastery>(COL.STUDENT_MASTERY, [where("studentId", "==", profile.id)]),
      queryDocuments<StudySession>(COL.STUDY_SESSIONS, [
        where("studentId", "==", profile.id),
        orderBy("startedAt", "desc"),
      ]).catch(() => [] as StudySession[]),
      queryDocuments<StudentAchievement>(COL.STUDENT_ACHIEVEMENTS, [
        where("studentId", "==", profile.id),
      ]).catch(() => [] as StudentAchievement[]),
    ]).then(([m, s, e]) => {
      setMasteries(m);
      setSessions(s);
      setEarned(e);
      setLoading(false);
    });
  }, [profile?.id]);

  if (loading) return <PageLoader />;

  // Build subject stats (SUBJECT_CONFIG uses "mathematics" etc. as keys)
  const subjectKeys = ["mathematics", "physics", "chemistry"] as const;
  const subjectStats: SubjectStat[] = subjectKeys.map((key) => {
    const cfg = SUBJECT_CONFIG[key];
    const chapters = masteries.map((m) => ({
      name:    m.topicId,
      mastery: Math.round(m.masteryPct),
    }));
    const avg = chapters.length
      ? Math.round(chapters.reduce((s, c) => s + c.mastery, 0) / chapters.length)
      : 0;
    return { label: cfg.label, color: cfg.bgClass, textColor: cfg.textClass, chapters, avgMastery: avg };
  });

  // Weekly session stats
  const weekAgo = Date.now() - 7 * 86400000;
  const weekSessions = sessions.filter((s) => new Date(s.startedAt).getTime() > weekAgo);
  const weekQuestions = weekSessions.reduce((s, x) => s + x.questionsAttempted, 0);
  const weekCorrect   = weekSessions.reduce((s, x) => s + x.questionsCorrect, 0);
  const weekXP        = weekSessions.reduce((s, x) => s + x.xpEarned, 0);
  const weekAccuracy  = weekQuestions > 0 ? Math.round((weekCorrect / weekQuestions) * 100) : 0;
  const weekMinutes   = weekSessions.reduce((s, x) => {
    const start = new Date(x.startedAt).getTime();
    const end   = x.endedAt ? new Date(x.endedAt).getTime() : start;
    return s + Math.round((end - start) / 60000);
  }, 0);

  const earnedStudentAchievements = earned;

  const xp = profile?.xpTotal ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Progress</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Track your learning journey</p>
      </div>

      {/* XP bar */}
      <XPBar xp={xp} />

      {/* This week summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Questions", value: weekQuestions },
          { label: "Accuracy",  value: `${weekAccuracy}%` },
          { label: "Minutes",   value: weekMinutes },
          { label: "XP Earned", value: weekXP },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-200 shadow-card p-3 text-center">
            <p className="text-xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label} this week</p>
          </div>
        ))}
      </div>

      {/* Mastery charts */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-5 space-y-6">
        <h2 className="text-base font-bold text-neutral-800">Subject Mastery</h2>
        {subjectStats.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${s.textColor}`}>{s.label}</span>
              <Badge variant="default" size="sm">{masteryLabel(masteryLevel(s.avgMastery))}</Badge>
            </div>
            <MasteryChart subject={s.label} data={s.chapters} color={s.textColor} />
          </div>
        ))}
      </div>

      {/* Badges */}
      {earnedStudentAchievements.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-5">
          <h2 className="text-base font-bold text-neutral-800 mb-3">Badges Earned</h2>
          <BadgeDisplay achievements={earnedStudentAchievements} />
        </div>
      )}

      {/* Weekly AI report */}
      <WeeklyReport stats={{
        questionsAttempted: weekQuestions,
        accuracy:           weekAccuracy,
        wordsLearned:       0,
        writingScore:       0,
        streakDays:         profile?.currentStreak ?? 0,
        xpEarned:           weekXP,
      }} />
    </div>
  );
}
