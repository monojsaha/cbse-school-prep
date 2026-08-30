import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { masteryLevel, masteryLabel } from "@/lib/utils";
import type { StudentMastery } from "@/types";

interface WeakAreasProps {
  masteries: StudentMastery[];
  topicNames: Record<string, string>;
  subjectSlugs: Record<string, string>;
}

export function WeakAreas({ masteries, topicNames, subjectSlugs }: WeakAreasProps) {
  const weak = masteries
    .filter((m) => m.masteryPct < 60)
    .sort((a, b) => a.masteryPct - b.masteryPct)
    .slice(0, 4);

  if (weak.length === 0) return null;

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-warning-500" />
        <h3 className="text-sm font-semibold text-neutral-800">Weak Areas</h3>
        <span className="ml-auto text-2xs text-neutral-400">Needs extra practice</span>
      </div>

      <div className="space-y-2.5">
        {weak.map((m) => {
          const slug = subjectSlugs[m.topicId] ?? "mathematics";
          const name = topicNames[m.topicId] ?? m.topicId;
          const level = masteryLevel(m.masteryPct);
          const badgeVariant = level === "needs_work" ? "error" : "warning";

          return (
            <div key={m.topicId} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 truncate font-medium">{name}</p>
                <p className="text-2xs text-neutral-400 mt-0.5">
                  {m.attempts} attempts · {m.correct} correct
                </p>
              </div>
              <Badge variant={badgeVariant} size="md">{m.masteryPct}%</Badge>
              <Link
                href={`/practice/${slug}?topic=${m.topicId}`}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 shrink-0"
              >
                Practice <ArrowRight size={12} />
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
