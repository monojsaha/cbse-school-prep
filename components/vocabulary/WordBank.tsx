"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { StudentWord, VocabularyWord } from "@/types";

interface WordBankEntry {
  studentWord: StudentWord;
  word: VocabularyWord;
}

interface WordBankProps {
  entries: WordBankEntry[];
}

const TABS = [
  { id: "learning",  label: "Learning",  color: "text-warning-700 bg-warning-50 border-warning-200" },
  { id: "reviewing", label: "Reviewing", color: "text-brand-700 bg-brand-50 border-brand-200" },
  { id: "mastered",  label: "Mastered",  color: "text-success-700 bg-success-50 border-success-200" },
] as const;

export function WordBank({ entries }: WordBankProps) {
  const [tab, setTab]       = useState<"learning" | "reviewing" | "mastered">("learning");
  const [search, setSearch] = useState("");

  const filtered = entries.filter(
    (e) =>
      e.studentWord.state === tab &&
      (search === "" || e.word.word.toLowerCase().includes(search.toLowerCase()))
  );

  const count = (state: string) => entries.filter((e) => e.studentWord.state === state).length;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, color }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "px-3 py-1.5 rounded-full border text-sm font-medium transition-all",
              tab === id ? color : "border-neutral-200 text-neutral-500 hover:border-neutral-300"
            )}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-70">({count(id)})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words…"
          className="w-full h-9 rounded-xl border border-neutral-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Word list */}
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">📖</p>
          <p className="text-sm text-neutral-400">
            {search ? "No words match your search" : `No words in ${tab} yet`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(({ word, studentWord }) => (
            <div
              key={word.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-neutral-200 px-4 py-3 shadow-card"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-800 capitalize">{word.word}</p>
                <p className="text-xs text-neutral-500 truncate mt-0.5">{word.meaning}</p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="default" className="text-2xs capitalize">{word.partOfSpeech}</Badge>
                <p className="text-2xs text-neutral-400 mt-1">
                  {studentWord.correctUses}/{studentWord.totalAttempts} correct
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
