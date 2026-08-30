"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, SkipForward } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { getQuestionsForTopic, addDocument, updateDocument, COL } from "@/lib/firebase/firestore";
import { where, limit, collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { xpForQuestion, SUBJECT_CONFIG } from "@/lib/utils";
import { QuestionCard } from "@/components/practice/QuestionCard";
import { MCQOptions } from "@/components/practice/MCQOptions";
import { NumericInput } from "@/components/practice/NumericInput";
import { HintSystem } from "@/components/practice/HintSystem";
import { SolutionPanel } from "@/components/practice/SolutionPanel";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { PageLoader } from "@/components/ui/Spinner";
import type { Question } from "@/types";

const SESSION_LENGTH = 10;

export default function SessionPage() {
  const { subject } = useParams<{ subject: string }>();
  const params      = useSearchParams();
  const router      = useRouter();
  const { profile } = useAuth();

  const topicId   = params.get("topicId")   ?? undefined;
  const chapterId = params.get("chapterId") ?? undefined;

  const [questions, setQuestions]       = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [answer, setAnswer]             = useState("");
  const [selectedMCQ, setSelectedMCQ]   = useState<string | null>(null);
  const [submitted, setSubmitted]       = useState(false);
  const [isCorrect, setIsCorrect]       = useState<boolean | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [xpEarned, setXpEarned]         = useState(0);
  const [totalXP, setTotalXP]           = useState(0);
  const [sessionId, setSessionId]       = useState<string>("");
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [loadingAI, setLoadingAI]       = useState(false);
  const [loading, setLoading]           = useState(true);
  const [chapterName, setChapterName]   = useState("");
  const [topicName, setTopicName]       = useState("");

  const config = SUBJECT_CONFIG[subject as keyof typeof SUBJECT_CONFIG];

  // Load questions
  useEffect(() => {
    if (!profile?.classId) return;
    (async () => {
      setLoading(true);

      // Start a session doc
      const sid = await addDocument(COL.STUDY_SESSIONS, {
        studentId: profile.id,
        startedAt: new Date().toISOString(),
        sessionType: "practice",
        questionsAttempted: 0,
        questionsCorrect: 0,
        xpEarned: 0,
      });
      setSessionId(sid);

      let qs: Question[] = [];
      if (topicId) {
        qs = await getQuestionsForTopic(topicId, SESSION_LENGTH);

        // Fetch topic and chapter names
        const topicSnap = await getDocs(query(collection(db, COL.TOPICS), where("__name__", "==", topicId)));
        if (!topicSnap.empty) setTopicName(topicSnap.docs[0].data().name ?? "");

        if (chapterId) {
          const chSnap = await getDocs(query(collection(db, COL.CHAPTERS), where("__name__", "==", chapterId)));
          if (!chSnap.empty) setChapterName(chSnap.docs[0].data().name ?? "");
        }
      } else {
        // Mixed session — pull from all topics in this subject's chapters
        const subjectsSnap = await getDocs(query(
          collection(db, COL.SUBJECTS),
          where("classId", "==", profile.classId),
          where("slug", "==", subject)
        ));
        if (!subjectsSnap.empty) {
          const subjectId = subjectsSnap.docs[0].id;
          qs = await getDocs(query(
            collection(db, COL.QUESTIONS),
            where("subjectId", "==", subjectId),
            where("isPublished", "==", true),
            limit(SESSION_LENGTH)
          )).then((snap) =>
            snap.docs.map((d) => ({ id: d.id, ...d.data() } as Question))
          );
        }
      }

      setQuestions(qs);
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.classId, topicId, subject]);

  const current = questions[currentIdx];

  // Check answer
  const checkAnswer = useCallback(async () => {
    if (!current || !profile?.id) return;

    const studentAnswer = current.questionType === "mcq" ? (selectedMCQ ?? "") : answer;
    const correct = current.questionType === "numeric"
      ? Math.abs(parseFloat(studentAnswer) - parseFloat(current.correctAnswer)) < 0.001
      : studentAnswer.trim().toUpperCase() === current.correctAnswer.trim().toUpperCase();

    const xp = correct ? xpForQuestion(current.difficulty, hintsRevealed) : 0;
    setIsCorrect(correct);
    setXpEarned(xp);
    setTotalXP((t) => t + xp);
    setSubmitted(true);

    // Log attempt
    await addDocument(COL.QUESTION_ATTEMPTS, {
      studentId: profile.id,
      questionId: current.id,
      sessionId,
      answerGiven: studentAnswer,
      isCorrect: correct,
      hintsUsed: hintsRevealed,
      timeSeconds: 0,
      xpEarned: xp,
      attemptedAt: new Date().toISOString(),
    });

    // Update mastery
    const masteryId = `${profile.id}_${current.topicId}`;
    await updateDocument(COL.STUDENT_MASTERY, masteryId, {
      studentId: profile.id,
      topicId: current.topicId,
    }).catch(async () => {
      // Doc doesn't exist yet — create it
      await addDocument(COL.STUDENT_MASTERY, {
        id: masteryId,
        studentId: profile.id,
        topicId: current.topicId,
        attempts: 1,
        correct: correct ? 1 : 0,
        masteryPct: correct ? 100 : 0,
        lastPracticedAt: new Date().toISOString(),
      });
    });

    // Fetch AI explanation for wrong answers (non-blocking)
    if (!correct) {
      setLoadingAI(true);
      fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: current,
          correctAnswer: current.correctAnswer,
          studentAnswer,
          classLevel: 7,
        }),
      })
        .then((r) => r.json())
        .then((d) => setAiExplanation(d.explanation ?? ""))
        .catch(() => {})
        .finally(() => setLoadingAI(false));
    }
  }, [current, selectedMCQ, answer, hintsRevealed, profile, sessionId]);

  const nextQuestion = useCallback(() => {
    setSubmitted(false);
    setIsCorrect(null);
    setAnswer("");
    setSelectedMCQ(null);
    setHintsRevealed(0);
    setAiExplanation("");
    setCurrentIdx((i) => i + 1);
  }, []);

  const handleRevealHint = useCallback(() => {
    setHintsRevealed((h) => h + 1);
    setXpEarned((x) => Math.max(0, x - 1));
  }, []);

  if (loading) return <PageLoader />;

  if (!questions.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-2xl mb-2">📚</p>
        <h2 className="text-lg font-bold text-neutral-800 mb-2">No questions yet</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Questions for this topic haven&apos;t been added yet. Try a different topic or check back soon.
        </p>
        <Button variant="secondary" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Session complete
  if (currentIdx >= questions.length) {
    const correct = questions.filter((_, i) =>
      i < currentIdx
    ).length; // approximate
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-5">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-neutral-900">Session Complete!</h2>
        <p className="text-neutral-500">You completed {questions.length} questions</p>
        <div className="bg-xp-50 border border-xp-200 rounded-2xl p-5">
          <p className="text-sm text-neutral-500 mb-1">XP Earned this session</p>
          <p className="text-4xl font-bold text-xp-600">+{totalXP}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => router.push(`/practice/${subject}`)}>
            Back to Chapters
          </Button>
          <Button onClick={() => { setCurrentIdx(0); setTotalXP(0); }}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const hints = current.hints ?? [];
  const canSubmit = current.questionType === "mcq" ? !!selectedMCQ : answer.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-5">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <Progress
            value={currentIdx + 1}
            max={questions.length}
            fillClassName="bg-brand-500"
            size="sm"
          />
        </div>
        <span className="text-xs text-neutral-400 font-medium tabular-nums shrink-0">
          +{totalXP} XP
        </span>
      </div>

      {/* Question */}
      <QuestionCard
        question={current}
        index={currentIdx + 1}
        total={questions.length}
        subjectLabel={config?.label ?? subject}
        chapterName={chapterName}
        topicName={topicName}
      >
        {/* MCQ */}
        {current.questionType === "mcq" && current.options && (
          <MCQOptions
            options={current.options}
            selected={selectedMCQ}
            submitted={submitted}
            correctAnswer={current.correctAnswer}
            onSelect={setSelectedMCQ}
          />
        )}

        {/* Numeric */}
        {current.questionType === "numeric" && (
          <NumericInput
            value={answer}
            unit={current.answerUnit}
            submitted={submitted}
            isCorrect={isCorrect}
            onChange={setAnswer}
          />
        )}

        {/* Short answer / fill blank / true-false */}
        {(current.questionType === "short_answer" ||
          current.questionType === "fill_blank" ||
          current.questionType === "true_false") && (
          <div>
            {current.questionType === "true_false" ? (
              <div className="flex gap-3">
                {["True", "False"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswer(opt)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      answer === opt
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-neutral-200 text-neutral-700 hover:border-brand-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitted}
                placeholder="Type your answer…"
                className="w-full h-10 rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}
          </div>
        )}
      </QuestionCard>

      {/* Hints */}
      {!submitted && (
        <HintSystem
          hints={hints}
          revealed={hintsRevealed}
          onReveal={handleRevealHint}
          disabled={submitted}
        />
      )}

      {/* Submit / Skip */}
      {!submitted ? (
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={nextQuestion}
            icon={<SkipForward size={16} />}
            className="text-neutral-400"
          >
            Skip
          </Button>
          <Button
            onClick={checkAnswer}
            disabled={!canSubmit}
            fullWidth
            size="lg"
          >
            Check Answer
          </Button>
        </div>
      ) : (
        <SolutionPanel
          isCorrect={isCorrect ?? false}
          xpEarned={xpEarned}
          studentAnswer={current.questionType === "mcq" ? (selectedMCQ ?? "") : answer}
          correctAnswer={current.correctAnswer}
          answerUnit={current.answerUnit}
          explanation={current.explanation}
          whyItWorks={current.whyItWorks}
          aiExplanation={aiExplanation}
          loadingAI={loadingAI}
          onNext={nextQuestion}
          onTrySimilar={nextQuestion}
        />
      )}
    </div>
  );
}
