import Link from "next/link";
import { Calculator, Atom, FlaskConical, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const SUBJECTS = [
  {
    slug: "mathematics",
    label: "Mathematics",
    icon: Calculator,
    description: "Algebra, geometry, mensuration, arithmetic and more",
    chapters: "22 chapters · 120+ questions",
    bgClass: "bg-math-50",
    textClass: "text-math-600",
    borderClass: "border-math-200",
    gradient: "from-math-50 to-blue-50",
  },
  {
    slug: "physics",
    label: "Physics",
    icon: Atom,
    description: "Motion, force, energy, light, sound, electricity",
    chapters: "15 chapters · 80+ questions",
    bgClass: "bg-physics-50",
    textClass: "text-physics-600",
    borderClass: "border-physics-200",
    gradient: "from-physics-50 to-violet-50",
  },
  {
    slug: "chemistry",
    label: "Chemistry",
    icon: FlaskConical,
    description: "Matter, elements, reactions, acids, bases and more",
    chapters: "14 chapters · 80+ questions",
    bgClass: "bg-chemistry-50",
    textClass: "text-chemistry-600",
    borderClass: "border-chemistry-200",
    gradient: "from-chemistry-50 to-emerald-50",
  },
];

const PRACTICE_MODES = [
  { id: "practice",   label: "Practice",   description: "Unlimited, self-paced" },
  { id: "quick_test", label: "Quick Test",  description: "10 questions, timed" },
  { id: "revision",   label: "Revision",   description: "Weak areas first" },
  { id: "challenge",  label: "Challenge",  description: "Hard & challenge questions" },
];

export default function PracticeHomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Practice</h1>
        <p className="text-sm text-neutral-500 mt-1">Choose a subject to start solving problems</p>
      </div>

      {/* Subject cards */}
      <div className="space-y-3">
        {SUBJECTS.map(({ slug, label, icon: Icon, description, chapters, bgClass, textClass, borderClass }) => (
          <Link key={slug} href={`/practice/${slug}`}>
            <Card hover padding="md" className={`${borderClass} group`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center shrink-0`}>
                  <Icon size={24} className={textClass} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900">{label}</p>
                  <p className="text-sm text-neutral-500 mt-0.5 truncate">{description}</p>
                  <p className="text-xs text-neutral-400 mt-1">{chapters}</p>
                </div>
                <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Practice mode guide */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Practice Modes</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {PRACTICE_MODES.map(({ id, label, description }) => (
            <div key={id} className="bg-white rounded-xl border border-neutral-200 p-3.5 shadow-card">
              <p className="text-sm font-semibold text-neutral-800">{label}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
