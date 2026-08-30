import Link from "next/link";
import { Calculator, Atom, FlaskConical, PenLine, BookOpen, Trophy, ChevronRight } from "lucide-react";
import { cn, masteryColor, masteryLevel } from "@/lib/utils";
import { Progress } from "@/components/ui/Progress";

const ICONS = {
  Calculator, Atom, FlaskConical, PenLine, BookOpen, Trophy,
};

interface SubjectCardProps {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  mastery?: number;
  lastScore?: number | null;
  questionsToday?: number;
  bgClass: string;
  textClass: string;
  borderClass: string;
  fillClass: string;
  description: string;
}

export function SubjectCard({
  href, label, icon, mastery, lastScore, questionsToday = 0,
  bgClass, textClass, borderClass, fillClass, description,
}: SubjectCardProps) {
  const Icon = ICONS[icon];
  const level = mastery !== undefined ? masteryLevel(mastery) : null;
  const levelColor = level ? masteryColor(level) : "";

  return (
    <Link href={href}>
      <div className={cn(
        "bg-white rounded-2xl border shadow-card p-4",
        "hover:shadow-card-md transition-all duration-200 group cursor-pointer",
        borderClass
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgClass)}>
            <Icon size={20} className={textClass} />
          </div>
          <ChevronRight size={16} className="text-neutral-300 group-hover:text-neutral-500 transition-colors mt-0.5" />
        </div>

        <p className="font-semibold text-neutral-900 text-sm">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>

        {mastery !== undefined ? (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xs text-neutral-400">Mastery</span>
              <span className={cn("text-2xs font-semibold px-1.5 py-0.5 rounded-full", levelColor)}>
                {mastery}%
              </span>
            </div>
            <Progress value={mastery} fillClassName={fillClass} size="xs" />
          </div>
        ) : lastScore !== null && lastScore !== undefined ? (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-2xs text-neutral-400">Last score:</span>
            <span className="text-2xs font-bold text-neutral-800">{lastScore}/100</span>
          </div>
        ) : (
          <div className="mt-3">
            <span className={cn("text-2xs font-medium px-2 py-0.5 rounded-full", bgClass, textClass)}>
              {questionsToday > 0 ? `${questionsToday} done today` : "Start now"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
