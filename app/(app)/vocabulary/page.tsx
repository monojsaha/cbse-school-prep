"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  getDailyVocabWords, queryDocuments, addDocument,
  setDocument, COL,
} from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { nextReviewInterval } from "@/lib/utils";
import { WordCard } from "@/components/vocabulary/WordCard";
import { SentenceEvaluator } from "@/components/vocabulary/SentenceEvaluator";
import { WordBank } from "@/components/vocabulary/WordBank";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import type { VocabularyWord, StudentWord, VocabEvaluation } from "@/types";

interface WordBankEntry { studentWord: StudentWord; word: VocabularyWord }

export default function VocabularyPage() {
  const { profile } = useAuth();

  const [dailyWords, setDailyWords]   = useState<VocabularyWord[]>([]);
  const [wordIndex, setWordIndex]     = useState(0);
  const [phase, setPhase]             = useState<"learn" | "use" | "done">("learn");
  const [bankEntries, setBankEntries] = useState<WordBankEntry[]>([]);
  const [tab, setTab]                 = useState<"today" | "bank">("today");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!profile?.id || !profile?.classId) return;
    (async () => {
      setLoading(true);
      const [words, swDocs] = await Promise.all([
        getDailyVocabWords(profile.id, profile.classId, 5),
        queryDocuments<StudentWord>(COL.STUDENT_WORDS, [where("studentId", "==", profile.id)]),
      ]);
      setDailyWords(words);

      // Build bank entries (only words already in student_words)
      const entries: WordBankEntry[] = [];
      for (const sw of swDocs) {
        const vocabSnaps = await queryDocuments<VocabularyWord>(COL.VOCAB_WORDS, [
          where("__name__", "==", sw.wordId),
        ]).catch(() => [] as VocabularyWord[]);
        if (vocabSnaps.length) entries.push({ studentWord: sw, word: vocabSnaps[0] });
      }
      setBankEntries(entries);
      setLoading(false);
    })();
  }, [profile?.id, profile?.classId]);

  const currentWord = dailyWords[wordIndex];

  const handleEvaluate = async (sentence: string): Promise<VocabEvaluation> => {
    const res = await fetch("/api/ai/evaluate-vocab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: currentWord.word,
        meaning: currentWord.meaning,
        sentence,
        classLevel: 7,
      }),
    });
    return res.json();
  };

  const handleDone = async (result: VocabEvaluation) => {
    if (!profile?.id || !currentWord) return;

    const quality = result.score >= 80 ? 5 : result.score >= 60 ? 3 : 1;
    const swId    = `${profile.id}_${currentWord.id}`;
    const existing = bankEntries.find((e) => e.word.id === currentWord.id);
    const { interval, easeFactor } = nextReviewInterval(
      existing?.studentWord.intervalDays ?? 0,
      existing?.studentWord.easeFactor   ?? 2.5,
      quality
    );
    const nextReview = new Date(Date.now() + interval * 86400000).toISOString();

    const swData: Partial<StudentWord> = {
      studentId:     profile.id,
      wordId:        currentWord.id,
      state:         result.score >= 90 ? "mastered" : result.score >= 50 ? "reviewing" : "learning",
      intervalDays:  interval,
      easeFactor,
      nextReviewAt:  nextReview,
      totalAttempts: (existing?.studentWord.totalAttempts ?? 0) + 1,
      correctUses:   (existing?.studentWord.correctUses   ?? 0) + (result.isCorrect ? 1 : 0),
    };

    // setDocument uses the compound key swId as the doc ID (upsert)
    await setDocument(COL.STUDENT_WORDS, swId, { ...swData });

    await addDocument(COL.VOCAB_ATTEMPTS, {
      studentId:    profile.id,
      wordId:       currentWord.id,
      challengeType:"write_sentence",
      isCorrect:    result.isCorrect,
      score:        result.score,
      attemptedAt:  new Date().toISOString(),
    });

    // If correct, auto-advance after a moment
    if (result.isCorrect) {
      setTimeout(() => setPhase("done"), 1200);
    }
  };

  const handleNextWord = () => {
    if (wordIndex + 1 < dailyWords.length) {
      setWordIndex((i) => i + 1);
      setPhase("learn");
    } else {
      setTab("bank");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Word Explorer</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Learn · Use · Remember</p>
        </div>
        <Badge variant="vocab" size="md">
          {wordIndex + 1} / {dailyWords.length} today
        </Badge>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {(["today", "bank"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              tab === t
                ? "bg-vocab-500 text-white border-vocab-500"
                : "border-neutral-200 text-neutral-600 hover:border-vocab-300"
            }`}
          >
            {t === "today" ? "Today's Words" : "My Word Bank"}
          </button>
        ))}
      </div>

      {/* Today tab */}
      {tab === "today" && (
        <>
          {dailyWords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">🎉</p>
              <h2 className="text-lg font-bold text-neutral-800">All caught up!</h2>
              <p className="text-sm text-neutral-500 mt-1">No words due for review. Come back tomorrow!</p>
            </div>
          ) : currentWord && (
            <>
              {/* Word dots progress */}
              <div className="flex gap-1.5 justify-center">
                {dailyWords.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < wordIndex ? "bg-vocab-500" : i === wordIndex ? "bg-vocab-400 scale-125" : "bg-neutral-200"
                    }`}
                  />
                ))}
              </div>

              {/* Word card */}
              {phase === "learn" && (
                <>
                  <WordCard word={currentWord} isNew />
                  <Button
                    onClick={() => setPhase("use")}
                    fullWidth
                    size="lg"
                    className="bg-vocab-500 hover:bg-vocab-600"
                  >
                    I understand — Now use it! →
                  </Button>
                </>
              )}

              {phase === "use" && (
                <>
                  <WordCard word={currentWord} />
                  <SentenceEvaluator
                    word={currentWord.word}
                    meaning={currentWord.meaning}
                    onSubmit={handleEvaluate}
                    onDone={handleDone}
                  />
                </>
              )}

              {phase === "done" && (
                <div className="text-center py-8 space-y-4">
                  <p className="text-4xl">⭐</p>
                  <h3 className="text-xl font-bold text-neutral-900">
                    &ldquo;{currentWord.word}&rdquo; mastered!
                  </h3>
                  <p className="text-sm text-neutral-500">+10 XP earned</p>
                  {wordIndex + 1 < dailyWords.length ? (
                    <Button onClick={handleNextWord} size="lg">
                      Next Word →
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-success-700 bg-success-50 rounded-xl px-4 py-3 border border-success-200">
                        🎉 You&apos;ve completed all {dailyWords.length} words for today!
                      </p>
                      <Button variant="secondary" onClick={() => setTab("bank")} fullWidth>
                        View My Word Bank
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Word Bank tab */}
      {tab === "bank" && <WordBank entries={bankEntries} />}
    </div>
  );
}
