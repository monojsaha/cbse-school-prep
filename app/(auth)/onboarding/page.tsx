"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { upsertProfile } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const BOARDS  = [{ id: "icse", name: "ICSE / CISCE" }, { id: "cbse", name: "CBSE" }, { id: "state", name: "State Board" }];
const CLASSES = [5, 6, 7, 8, 9, 10];
const GOALS   = ["Score better in exams", "Build strong fundamentals", "Enjoy learning", "Get ahead of the class"];
const TIMES   = [{ val: 15, label: "15 min" }, { val: 20, label: "20 min" }, { val: 30, label: "30 min" }, { val: 45, label: "45 min" }];
const STEPS   = ["Welcome", "Your Class", "Your Board", "Your Goal", "Study Time", "Ready!"];

function StepDot({ index, current }: { index: number; current: number }) {
  const done = index < current;
  const active = index === current;
  return (
    <div className={cn(
      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
      done   && "bg-brand-500 text-white",
      active && "bg-brand-500 text-white ring-4 ring-brand-100",
      !done && !active && "bg-neutral-200 text-neutral-500"
    )}>
      {done ? <Check size={14} /> : index + 1}
    </div>
  );
}

function OptionButton({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full px-4 py-3 rounded-xl border text-sm font-medium text-left",
        "transition-all duration-150",
        selected
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-neutral-200 text-neutral-700 hover:border-brand-300 hover:bg-brand-50/50"
      )}
    >
      {label}
    </button>
  );
}

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName]     = useState("");
  const [grade, setGrade]   = useState<number | null>(7);
  const [board, setBoard]   = useState("icse");
  const [goal, setGoal]     = useState("");
  const [time, setTime]     = useState(20);
  const [school, setSchool] = useState("");
  const [saving, setSaving] = useState(false);

  const canNext = [
    name.trim().length >= 2,
    grade !== null,
    board !== "",
    goal !== "",
    time > 0,
    true,
  ][step];

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await upsertProfile(user.uid, {
        id: user.uid,
        name: name.trim(),
        classId: `class_${grade}`,
        boardId: board,
        school: school.trim() || undefined,
        learningGoal: goal,
        dailyStudyMinutes: time,
        xpTotal: 0,
        currentStreak: 0,
        longestStreak: 0,
        role: "student",
        createdAt: new Date().toISOString(),
      });
      await refreshProfile();
      router.replace("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className="flex items-center gap-1">
            <StepDot index={i} current={step} />
            {i < STEPS.length - 1 && (
              <div className={cn("w-6 h-0.5 transition-colors", i < step ? "bg-brand-400" : "bg-neutral-200")} />
            )}
          </div>
        ))}
      </div>

      <Card padding="lg">
        {/* Step 0 — Name */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">What's your name?</h2>
              <p className="text-sm text-neutral-500 mt-1">We'll personalise your experience.</p>
            </div>
            <Input
              label="Your name"
              placeholder="e.g. Aryan Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Input
              label="School (optional)"
              placeholder="e.g. St. Xavier's School"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
        )}

        {/* Step 1 — Class */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Which class are you in?</h2>
              <p className="text-sm text-neutral-500 mt-1">We'll show the right content for your level.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {CLASSES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={cn(
                    "py-3 rounded-xl border text-sm font-semibold transition-all",
                    grade === g
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-neutral-200 text-neutral-700 hover:border-brand-300"
                  )}
                >
                  Class {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Board */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Which board do you follow?</h2>
              <p className="text-sm text-neutral-500 mt-1">This helps us align questions to your curriculum.</p>
            </div>
            <div className="flex flex-col gap-2">
              {BOARDS.map((b) => (
                <OptionButton
                  key={b.id}
                  label={b.name}
                  selected={board === b.id}
                  onClick={() => setBoard(b.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Goal */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">What's your learning goal?</h2>
              <p className="text-sm text-neutral-500 mt-1">We'll tailor your practice sessions.</p>
            </div>
            <div className="flex flex-col gap-2">
              {GOALS.map((g) => (
                <OptionButton key={g} label={g} selected={goal === g} onClick={() => setGoal(g)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Study time */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">How long can you study each day?</h2>
              <p className="text-sm text-neutral-500 mt-1">Even 15 minutes daily makes a big difference.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TIMES.map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTime(val)}
                  className={cn(
                    "py-4 rounded-xl border text-sm font-semibold transition-all",
                    time === val
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-neutral-200 text-neutral-700 hover:border-brand-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — Ready */}
        {step === 5 && (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center shadow-md">
              <span className="text-3xl">🎓</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">You're all set, {name}!</h2>
              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                Your personalised learning journey is ready. Let's start with your dashboard and explore what ScholarForge has to offer.
              </p>
            </div>
            <div className="bg-brand-50 rounded-xl px-4 py-3 w-full text-left">
              <p className="text-xs text-neutral-500 mb-1">Your setup</p>
              <p className="text-sm text-neutral-700">
                <strong>Class {grade}</strong> · <strong>{BOARDS.find(b => b.id === board)?.name}</strong> · {time} min/day
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && step < 5 && (
            <Button variant="secondary" onClick={back} icon={<ChevronLeft size={16} />}>
              Back
            </Button>
          )}
          {step < 5 ? (
            <Button
              onClick={next}
              disabled={!canNext}
              fullWidth
              iconRight={<ChevronRight size={16} />}
            >
              Continue
            </Button>
          ) : (
            <Button onClick={finish} loading={saving} fullWidth size="lg">
              Go to Dashboard
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
