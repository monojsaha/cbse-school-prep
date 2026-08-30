import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  subjectLabel: string;
  chapterName?: string;
  topicName?: string;
  children: React.ReactNode;
}

import type { BadgeVariant } from "@/components/ui/Badge";

const DIFFICULTY_VARIANT: Record<string, BadgeVariant> = {
  easy: "easy", medium: "medium", hard: "hard", challenge: "challenge",
};

const SUBJECT_VARIANT: Record<string, BadgeVariant> = {
  mathematics: "math", physics: "physics", chemistry: "chemistry",
};

export function QuestionCard({
  question, index, total, subjectLabel, chapterName, topicName, children,
}: QuestionCardProps) {
  const subjectVariant = SUBJECT_VARIANT[question.subjectId] ?? "brand";
  const diffVariant = DIFFICULTY_VARIANT[question.difficulty] ?? "default";

  return (
    <div className="space-y-4">
      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={subjectVariant} size="md">{subjectLabel}</Badge>
          {chapterName && (
            <>
              <span className="text-neutral-300">›</span>
              <span className="text-xs text-neutral-500">{chapterName}</span>
            </>
          )}
          {topicName && (
            <>
              <span className="text-neutral-300">›</span>
              <span className="text-xs text-neutral-500 font-medium">{topicName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={diffVariant} size="md" className="capitalize">{question.difficulty}</Badge>
          <span className="text-xs text-neutral-400 font-medium tabular-nums">{index}/{total}</span>
        </div>
      </div>

      {/* Question text */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-5">
        {question.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={question.imageUrl}
            alt="Question diagram"
            className="w-full max-h-48 object-contain rounded-xl mb-4 bg-neutral-50"
          />
        )}
        <p className="text-base font-medium text-neutral-900 leading-relaxed">
          {question.questionText}
        </p>
        {question.answerUnit && (
          <p className="text-xs text-neutral-400 mt-2">
            Express your answer in: <strong className="text-neutral-600">{question.answerUnit}</strong>
          </p>
        )}
      </div>

      {/* Answer area (MCQ / numeric / short) */}
      {children}
    </div>
  );
}
