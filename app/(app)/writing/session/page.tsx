"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { queryDocuments, addDocument, COL } from "@/lib/firebase/firestore";
import { where } from "firebase/firestore";
import { WritingEditor } from "@/components/writing/WritingEditor";
import { RubricDisplay } from "@/components/writing/RubricDisplay";
import { FeedbackPanel } from "@/components/writing/FeedbackPanel";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Spinner";
import type { WritingPrompt, WritingEvaluation } from "@/types";

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function WritingSessionInner() {
  const { profile }  = useAuth();
  const router       = useRouter();
  const params       = useSearchParams();
  const promptId     = params.get("promptId") ?? "";

  const [prompt, setPrompt]           = useState<WritingPrompt | null>(null);
  const [text, setText]               = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [evaluation, setEvaluation]   = useState<WritingEvaluation | null>(null);
  const [draftNum, setDraftNum]       = useState(1);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!promptId) { router.push("/writing"); return; }
    queryDocuments<WritingPrompt>(COL.WRITING_PROMPTS, [where("__name__", "==", promptId)])
      .then((docs) => {
        setPrompt(docs[0] ?? null);
        setLoading(false);
      });
  }, [promptId, router]);

  const handleSubmit = async () => {
    if (!profile?.id || !prompt) return;
    const words = countWords(text);
    if (words < prompt.minWords) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ai/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text, prompt: prompt.topicText, writingType: prompt.writingType, classLevel: 7,
        }),
      });
      const result: WritingEvaluation = await res.json();
      setEvaluation(result);

      // Persist submission
      const total = result.scores.content + result.scores.structure + result.scores.grammar + result.scores.vocabulary + result.scores.creativity + result.scores.style;
      await addDocument(COL.WRITING_SUBMISSIONS, {
        studentId:    profile.id,
        promptId:     prompt.id,
        draftNumber:  draftNum,
        content:      text,
        wordCount:    words,
        submittedAt:  new Date().toISOString(),
        scoreTotal:   total,
        scores:       result.scores,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevise = () => {
    setEvaluation(null);
    setDraftNum((d) => d + 1);
  };

  if (loading || !prompt) return <PageLoader />;

  const total = evaluation
    ? evaluation.scores.content + evaluation.scores.structure + evaluation.scores.grammar + evaluation.scores.vocabulary + evaluation.scores.creativity + evaluation.scores.style
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-writing-500 uppercase tracking-wider mb-0.5">
            {prompt.writingType} • Draft {draftNum}
          </p>
          <h1 className="text-xl font-bold text-neutral-900 leading-snug">{prompt.title}</h1>
        </div>
        {draftNum > 1 && (
          <span className="text-xs font-bold px-2.5 py-1 bg-writing-100 text-writing-700 rounded-full border border-writing-200">
            Revision #{draftNum}
          </span>
        )}
      </div>

      {!evaluation ? (
        <>
          <WritingEditor
            prompt={prompt.topicText}
            minWords={prompt.minWords}
            maxWords={prompt.maxWords}
            onChange={setText}
            disabled={submitting}
          />
          <Button
            onClick={handleSubmit}
            disabled={countWords(text) < prompt.minWords}
            loading={submitting}
            fullWidth
            size="lg"
            className="bg-writing-500 hover:bg-writing-600 border-0"
          >
            {submitting ? "Evaluating your writing…" : "Submit for Feedback ✓"}
          </Button>
          {countWords(text) < prompt.minWords && (
            <p className="text-center text-xs text-neutral-400">
              Write at least {prompt.minWords} words to submit
            </p>
          )}
        </>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <RubricDisplay scores={evaluation.scores} totalScore={total} />
          <FeedbackPanel feedback={evaluation.feedback} />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleRevise} fullWidth>
              Revise &amp; Resubmit
            </Button>
            <Button onClick={() => router.push("/writing")} fullWidth>
              Try Another Prompt
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WritingSessionPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <WritingSessionInner />
    </Suspense>
  );
}
