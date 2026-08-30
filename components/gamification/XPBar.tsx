"use client";

import { Zap } from "lucide-react";
import { cn, levelFromXP, xpProgressInLevel, xpForLevel } from "@/lib/utils";
import { Progress } from "@/components/ui/Progress";

interface XPBarProps {
  xp: number;
  className?: string;
  compact?: boolean;
}

export function XPBar({ xp, className, compact = false }: XPBarProps) {
  const level = levelFromXP(xp);
  const { current, required, pct } = xpProgressInLevel(xp);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1">
          <Zap size={13} className="text-xp-500 fill-xp-400" />
          <span className="text-xs font-bold text-neutral-700">Lv {level}</span>
        </div>
        <div className="flex-1">
          <Progress value={pct} fillClassName="bg-xp-500" size="xs" />
        </div>
        <span className="text-2xs text-neutral-400 tabular-nums">{current}/{required}</span>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-2xl border border-neutral-200 p-4 shadow-card", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-xp-500/10 flex items-center justify-center">
            <Zap size={16} className="text-xp-500 fill-xp-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Level</p>
            <p className="text-base font-bold text-neutral-900 leading-none">{level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">Total XP</p>
          <p className="text-base font-bold text-xp-600 leading-none">{xp.toLocaleString()}</p>
        </div>
      </div>
      <Progress value={pct} fillClassName="bg-gradient-to-r from-xp-400 to-xp-500" size="md" />
      <p className="text-2xs text-neutral-400 mt-1.5 text-right">
        {current} / {required} XP to Level {level + 1}
      </p>
    </div>
  );
}
