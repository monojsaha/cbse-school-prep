"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import {
  getChaptersForSubject, getTopicsForChapter,
  getStudentMastery, queryDocuments, COL,
} from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { cn, masteryLevel, masteryColor, SUBJECT_CONFIG } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import type { Chapter, Topic, Subject, StudentMastery } from "@/types";

export default function SubjectPage() {
  const { subject } = useParams<{ subject: string }>();
  const { profile } = useAuth();
  const config = SUBJECT_CONFIG[subject as keyof typeof SUBJECT_CONFIG];

  const [chapters, setChapters]   = useState<Chapter[]>([]);
  const [topics, setTopics]       = useState<Record<string, Topic[]>>({});
  const [masteries, setMasteries] = useState<StudentMastery[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!profile?.classId) return;
    (async () => {
      setLoading(true);
      // Get the subject document — single-field filter avoids needing a composite index
      const allSubjects = await queryDocuments<Subject>(COL.SUBJECTS, [
        where("classId", "==", profile.classId),
      ]);
      const subjects = allSubjects.filter((s) => s.slug === subject);
      if (!subjects.length) { setLoading(false); return; }
      const sid = subjects[0].id;
      setSubjectId(sid);

      const [chs, ms] = await Promise.all([
        getChaptersForSubject(sid),
        profile.id ? getStudentMastery(profile.id) : Promise.resolve([]),
      ]);
      setChapters(chs);
      setMasteries(ms);

      // Load topics for each chapter in parallel
      const topicMap: Record<string, Topic[]> = {};
      await Promise.all(
        chs.map(async (ch) => {
          topicMap[ch.id] = await getTopicsForChapter(ch.id);
        })
      );
      setTopics(topicMap);
      setLoading(false);
    })();
  }, [profile, subject]);

  const masteryForTopic = (topicId: string) =>
    masteries.find((m) => m.topicId === topicId);

  if (!config) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-neutral-500">Subject not found.</p>
    </div>
  );

  const { textClass, bgClass } = config;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-5">
      {/* Back */}
      <Link href="/practice" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ChevronLeft size={16} /> Practice
      </Link>

      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgClass)}>
          <BookOpen size={20} className={textClass} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{config.label}</h1>
          <p className="text-xs text-neutral-400">Class 7 · {chapters.length} chapters</p>
        </div>
      </div>

      {/* Quick start */}
      <Link href={`/practice/${subject}/session`}>
        <Card hover padding="md" className={cn("border-0 bg-gradient-to-r", `from-${subject === "mathematics" ? "math" : subject === "physics" ? "physics" : "chemistry"}-500`, "to-brand-600")}>
          <p className="text-white font-bold text-base">Start Quick Practice</p>
          <p className="text-white/80 text-sm mt-0.5">Mixed questions across all chapters</p>
          <div className="flex justify-end mt-3">
            <ChevronRight size={20} className="text-white/60" />
          </div>
        </Card>
      </Link>

      {/* Chapters */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {chapters.map((ch) => {
            const chapterTopics = topics[ch.id] ?? [];
            const isOpen = expanded === ch.id;
            const chapterMasteries = chapterTopics.map((t) => masteryForTopic(t.id)).filter(Boolean) as StudentMastery[];
            const avgMastery = chapterMasteries.length
              ? Math.round(chapterMasteries.reduce((a, b) => a + b.masteryPct, 0) / chapterMasteries.length)
              : null;

            return (
              <div key={ch.id} className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
                {/* Chapter header */}
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : ch.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">{ch.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{chapterTopics.length} topics</p>
                  </div>
                  {avgMastery !== null && (
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <Progress value={avgMastery} size="xs" fillClassName={`bg-${subject === "mathematics" ? "math" : subject === "physics" ? "physics" : "chemistry"}-500`} />
                      </div>
                      <span className="text-xs font-semibold text-neutral-600 tabular-nums w-8 text-right">{avgMastery}%</span>
                    </div>
                  )}
                  <ChevronRight
                    size={16}
                    className={cn("text-neutral-400 transition-transform shrink-0 ml-1", isOpen && "rotate-90")}
                  />
                </button>

                {/* Topics */}
                {isOpen && (
                  <div className="border-t border-neutral-100 divide-y divide-neutral-50">
                    {chapterTopics.map((topic) => {
                      const m = masteryForTopic(topic.id);
                      const level = m ? masteryLevel(m.masteryPct) : null;

                      return (
                        <Link
                          key={topic.id}
                          href={`/practice/${subject}/session?topicId=${topic.id}&chapterId=${ch.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-brand-50 transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-700 group-hover:text-brand-700 font-medium transition-colors">
                              {topic.name}
                            </p>
                            {m && (
                              <p className="text-2xs text-neutral-400 mt-0.5">
                                {m.attempts} attempts · {m.correct} correct
                              </p>
                            )}
                          </div>
                          {level && (
                            <Badge
                              variant={level === "mastered" || level === "strong" ? "success" : level === "needs_work" ? "error" : "warning"}
                              size="sm"
                            >
                              {m?.masteryPct}%
                            </Badge>
                          )}
                          {!level && (
                            <span className="text-2xs text-neutral-400">Not started</span>
                          )}
                          <ChevronRight size={14} className="text-neutral-300 group-hover:text-brand-400 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
