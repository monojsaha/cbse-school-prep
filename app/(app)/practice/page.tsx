import Link from "next/link";
import { Calculator, Atom, FlaskConical, Leaf, BookA, Globe, Landmark, Scale, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const SUBJECTS = [
  {
    slug: "mathematics",
    label: "Mathematics",
    icon: Calculator,
    description: "Integers, algebra, geometry, ratio, data handling",
    chapters: "10 chapters · 60+ questions",
    bgClass: "bg-math-50",
    textClass: "text-math-600",
    borderClass: "border-math-200",
  },
  {
    slug: "physics",
    label: "Physics",
    icon: Atom,
    description: "Motion, force, light, sound, electricity",
    chapters: "5 chapters · 30+ questions",
    bgClass: "bg-physics-50",
    textClass: "text-physics-600",
    borderClass: "border-physics-200",
  },
  {
    slug: "chemistry",
    label: "Chemistry",
    icon: FlaskConical,
    description: "Matter, atoms, reactions, acids, metals",
    chapters: "5 chapters · 30+ questions",
    bgClass: "bg-chemistry-50",
    textClass: "text-chemistry-600",
    borderClass: "border-chemistry-200",
  },
  {
    slug: "biology",
    label: "Biology",
    icon: Leaf,
    description: "Nutrition, transport, respiration, reproduction in living things",
    chapters: "5 chapters · 30+ questions",
    bgClass: "bg-biology-50",
    textClass: "text-biology-600",
    borderClass: "border-biology-200",
  },
  {
    slug: "english-grammar",
    label: "English Grammar",
    icon: BookA,
    description: "Parts of speech, tenses, voice, comprehension, writing",
    chapters: "6 chapters · 40+ questions",
    bgClass: "bg-grammar-50",
    textClass: "text-grammar-600",
    borderClass: "border-grammar-200",
  },
  {
    slug: "geography",
    label: "Geography",
    icon: Globe,
    description: "Environment, climate, land, water, vegetation, human settlements",
    chapters: "6 chapters · 35+ questions",
    bgClass: "bg-geo-50",
    textClass: "text-geo-600",
    borderClass: "border-geo-200",
  },
  {
    slug: "history",
    label: "History",
    icon: Landmark,
    description: "Medieval India, Delhi Sultanate, Mughals, regional kingdoms",
    chapters: "6 chapters · 35+ questions",
    bgClass: "bg-history-50",
    textClass: "text-history-600",
    borderClass: "border-history-200",
  },
  {
    slug: "civics",
    label: "Civics",
    icon: Scale,
    description: "Equality, government, democracy, gender & social justice",
    chapters: "5 chapters · 25+ questions",
    bgClass: "bg-civics-50",
    textClass: "text-civics-600",
    borderClass: "border-civics-200",
  },
];

export default function PracticeHomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Practice</h1>
        <p className="text-sm text-neutral-500 mt-1">Choose a subject to start solving problems</p>
      </div>

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
    </div>
  );
}
