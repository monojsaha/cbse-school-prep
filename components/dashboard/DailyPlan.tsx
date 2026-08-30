import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

interface PlanItem {
  label: string;
  href: string;
  minutes: number;
  color: string;
  textColor: string;
}

interface DailyPlanProps {
  totalMinutes: number;
  items: PlanItem[];
}

export function DailyPlan({ totalMinutes, items }: DailyPlanProps) {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800">Today&apos;s Plan</h3>
          <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {totalMinutes} minutes total
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-xl",
              "border transition-all duration-150 hover:shadow-sm group cursor-pointer",
              item.color
            )}>
              <div className="flex items-center gap-2.5">
                <div className={cn("w-1.5 h-6 rounded-full", item.textColor.replace("text-", "bg-"))} />
                <span className={cn("text-sm font-medium", item.textColor)}>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">{item.minutes} min</span>
                <ArrowRight size={14} className="text-neutral-300 group-hover:text-neutral-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
