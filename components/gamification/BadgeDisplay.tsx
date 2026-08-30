import { cn } from "@/lib/utils";
import type { StudentAchievement } from "@/types";

const BADGE_ICONS: Record<string, string> = {
  first_10:    "🎯",
  math_explorer:     "🔢",
  science_investigator: "🔬",
  word_wizard:         "📚",
  creative_thinker:    "✍️",
  streak_7:            "🔥",
  grammar_guardian:    "📝",
  hundred_problems:    "💯",
  writing_debut:       "🖊️",
  vocab_starter:       "🗣️",
};

interface BadgeDisplayProps {
  achievements: StudentAchievement[];
  maxVisible?: number;
  className?: string;
}

export function BadgeDisplay({ achievements, maxVisible = 8, className }: BadgeDisplayProps) {
  const visible = achievements.slice(0, maxVisible);

  if (achievements.length === 0) {
    return (
      <p className="text-sm text-neutral-400 italic">
        Earn your first badge by solving 10 problems!
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visible.map((sa) => (
        <div
          key={sa.achievementId}
          title={sa.achievement?.name}
          className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-default"
        >
          {BADGE_ICONS[sa.achievementId] ?? "🏅"}
        </div>
      ))}
      {achievements.length > maxVisible && (
        <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-500">
          +{achievements.length - maxVisible}
        </div>
      )}
    </div>
  );
}
