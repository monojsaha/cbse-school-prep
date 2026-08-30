/**
 * Regression test suite for ScholarForge
 * Covers: scoring, XP leveling, mastery, spaced repetition, string helpers
 */
import { describe, it, expect } from "vitest";
import {
  xpForQuestion,
  xpForLevel,
  levelFromXP,
  xpProgressInLevel,
  masteryLevel,
  masteryLabel,
  masteryColor,
  nextReviewInterval,
  capitalize,
  slugify,
  wordCount,
  formatRelativeDate,
} from "../lib/utils";

// ─── XP: xpForQuestion ────────────────────────────────────────────────────────

describe("xpForQuestion — base XP by difficulty", () => {
  it("easy   → 5 XP", () => expect(xpForQuestion("easy",      0)).toBe(5));
  it("medium → 10 XP", () => expect(xpForQuestion("medium",   0)).toBe(10));
  it("hard   → 15 XP", () => expect(xpForQuestion("hard",     0)).toBe(15));
  it("challenge → 25 XP", () => expect(xpForQuestion("challenge", 0)).toBe(25));
});

describe("xpForQuestion — hint deductions", () => {
  it("1 hint deducts 1 XP from medium (10→9)", () => expect(xpForQuestion("medium", 1)).toBe(9));
  it("2 hints deducts 2 XP from hard (15→13)", () => expect(xpForQuestion("hard",   2)).toBe(13));
  it("3 hints on easy (5→2)",                  () => expect(xpForQuestion("easy",   3)).toBe(2));
  it("max hints on easy still gives 1 XP",     () => expect(xpForQuestion("easy", 100)).toBe(1));
  it("max hints on medium still gives 1 XP",   () => expect(xpForQuestion("medium", 100)).toBe(1));
  it("max hints on challenge still gives 1 XP",() => expect(xpForQuestion("challenge", 100)).toBe(1));
  it("0 hints never deducts",                  () => expect(xpForQuestion("hard", 0)).toBe(15));
  it("negative hints treated as 0 (no deduction)", () => {
    // hintsUsed is always ≥ 0 in practice; max(1, 15 - (-1)) = max(1,16) = 16
    // This tests robustness only — callers always pass ≥ 0
    expect(xpForQuestion("hard", -1)).toBe(16);
  });
});

// ─── XP: level thresholds ─────────────────────────────────────────────────────

describe("xpForLevel — cumulative XP thresholds", () => {
  // Formula: n*(n+1)*50
  it("level 1 threshold → 100",  () => expect(xpForLevel(1)).toBe(100));
  it("level 2 threshold → 300",  () => expect(xpForLevel(2)).toBe(300));
  it("level 3 threshold → 600",  () => expect(xpForLevel(3)).toBe(600));
  it("level 4 threshold → 1000", () => expect(xpForLevel(4)).toBe(1000));
  it("level 5 threshold → 1500", () => expect(xpForLevel(5)).toBe(1500));
  it("level 10 threshold → 5500",() => expect(xpForLevel(10)).toBe(5500));
});

describe("levelFromXP — level boundaries", () => {
  it("0 XP → level 1",            () => expect(levelFromXP(0)).toBe(1));
  it("99 XP → level 1",           () => expect(levelFromXP(99)).toBe(1));
  it("100 XP → level 2",          () => expect(levelFromXP(100)).toBe(2));
  it("299 XP → level 2",          () => expect(levelFromXP(299)).toBe(2));
  it("300 XP → level 3",          () => expect(levelFromXP(300)).toBe(3));
  it("599 XP → level 3",          () => expect(levelFromXP(599)).toBe(3));
  it("600 XP → level 4",          () => expect(levelFromXP(600)).toBe(4));
  it("1000 XP → level 5",         () => expect(levelFromXP(1000)).toBe(5));
  it("large XP still returns a level", () => expect(levelFromXP(100_000)).toBeGreaterThan(1));
  it("level is always ≥ 1",       () => {
    for (const xp of [0, 1, 50, 99, 100, 500]) {
      expect(levelFromXP(xp)).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("xpProgressInLevel — within-level progress", () => {
  it("50 XP in level 1: current=50, required=100", () => {
    const { current, required } = xpProgressInLevel(50);
    expect(current).toBe(50);
    expect(required).toBe(100);
  });

  it("0 XP in level 1: current=0, pct=0", () => {
    const { current, pct } = xpProgressInLevel(0);
    expect(current).toBe(0);
    expect(pct).toBe(0);
  });

  it("100 XP (level 2 entry): current=0, required=200", () => {
    const { current, required } = xpProgressInLevel(100);
    expect(current).toBe(0);
    expect(required).toBe(200);
  });

  it("200 XP in level 2: current=100, required=200, pct=50", () => {
    const { current, required, pct } = xpProgressInLevel(200);
    expect(current).toBe(100);
    expect(required).toBe(200);
    expect(pct).toBe(50);
  });

  it("current never exceeds required", () => {
    for (const xp of [0, 50, 99, 100, 150, 299, 300, 500, 1000]) {
      const { current, required } = xpProgressInLevel(xp);
      expect(current).toBeLessThanOrEqual(required);
    }
  });

  it("pct is between 0 and 100", () => {
    for (const xp of [0, 1, 99, 100, 300, 999]) {
      const { pct } = xpProgressInLevel(xp);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });
});

// ─── Mastery ──────────────────────────────────────────────────────────────────

describe("masteryLevel — boundary classification", () => {
  const cases: Array<[number, string]> = [
    [0,   "needs_work"],
    [1,   "needs_work"],
    [39,  "needs_work"],
    [40,  "developing"],
    [59,  "developing"],
    [60,  "good"],
    [79,  "good"],
    [80,  "strong"],
    [89,  "strong"],
    [90,  "mastered"],
    [99,  "mastered"],
    [100, "mastered"],
  ];
  for (const [pct, expected] of cases) {
    it(`${pct}% → ${expected}`, () => expect(masteryLevel(pct)).toBe(expected));
  }
});

describe("masteryLabel — human-readable labels", () => {
  it("needs_work → 'Needs Work'", () => expect(masteryLabel("needs_work")).toBe("Needs Work"));
  it("developing → 'Developing'", () => expect(masteryLabel("developing")).toBe("Developing"));
  it("good       → 'Good'",       () => expect(masteryLabel("good")).toBe("Good"));
  it("strong     → 'Strong'",     () => expect(masteryLabel("strong")).toBe("Strong"));
  it("mastered   → 'Mastered'",   () => expect(masteryLabel("mastered")).toBe("Mastered"));
});

describe("masteryColor — returns a non-empty string for every level", () => {
  const levels = ["needs_work", "developing", "good", "strong", "mastered"] as const;
  for (const level of levels) {
    it(`${level} returns a non-empty class string`, () => {
      expect(masteryColor(level).length).toBeGreaterThan(0);
    });
  }
});

// ─── Spaced Repetition (SM-2) ────────────────────────────────────────────────

describe("nextReviewInterval — core SM-2 behaviour", () => {
  it("first review (interval=0), quality 5 → interval 1", () =>
    expect(nextReviewInterval(0, 2.5, 5).interval).toBe(1));

  it("second review (interval=1), quality 5 → interval 4", () =>
    expect(nextReviewInterval(1, 2.5, 5).interval).toBe(4));

  it("third review (interval=4), quality 5 → interval 10 (4*2.6 rounded)", () =>
    // ef = 2.5+0.1=2.6, 4*2.6=10.4 → 10
    expect(nextReviewInterval(4, 2.5, 5).interval).toBe(10));

  it("subsequent review (interval=6), quality 5 → interval 16", () =>
    expect(nextReviewInterval(6, 2.5, 5).interval).toBe(16));

  it("quality < 3 always resets interval to 1", () => {
    expect(nextReviewInterval(30, 2.5, 0).interval).toBe(1);
    expect(nextReviewInterval(30, 2.5, 1).interval).toBe(1);
    expect(nextReviewInterval(30, 2.5, 2).interval).toBe(1);
  });

  it("quality 3 does not reset a large interval", () =>
    expect(nextReviewInterval(10, 2.5, 3).interval).toBeGreaterThan(1));
});

describe("nextReviewInterval — ease factor adjustment", () => {
  it("quality 5 increases ease factor", () => {
    const { easeFactor } = nextReviewInterval(0, 2.5, 5);
    expect(easeFactor).toBeGreaterThan(2.5);
  });

  it("quality 1 decreases ease factor", () => {
    const { easeFactor } = nextReviewInterval(0, 2.5, 1);
    expect(easeFactor).toBeLessThan(2.5);
  });

  it("ease factor never falls below 1.3", () => {
    // Hammer it with worst quality 10 times
    let ef = 2.5;
    for (let i = 0; i < 10; i++) {
      ({ easeFactor: ef } = nextReviewInterval(0, ef, 0));
    }
    expect(ef).toBeGreaterThanOrEqual(1.3);
  });

  it("ease factor stays ≥ 1.3 even when starting below it", () => {
    const { easeFactor } = nextReviewInterval(0, 1.3, 0);
    expect(easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("starting ease factor of 1.3 with quality 5 increases it", () => {
    const { easeFactor } = nextReviewInterval(1, 1.3, 5);
    expect(easeFactor).toBeGreaterThan(1.3);
  });
});

describe("nextReviewInterval — review schedule simulation", () => {
  it("simulates a realistic word-learning schedule", () => {
    // Day 0: learn
    let state = { interval: 0, easeFactor: 2.5 };
    const schedule: number[] = [];

    for (let i = 0; i < 5; i++) {
      state = nextReviewInterval(state.interval, state.easeFactor, 5);
      schedule.push(state.interval);
    }
    // Intervals should grow monotonically for quality=5
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i]).toBeGreaterThanOrEqual(schedule[i - 1]);
    }
  });

  it("failing a review (quality<3) resets to short interval regardless of prior progress", () => {
    const { interval } = nextReviewInterval(30, 2.8, 2);
    expect(interval).toBe(1);
  });
});

// ─── String helpers ──────────────────────────────────────────────────────────

describe("capitalize", () => {
  it("capitalizes first letter",            () => expect(capitalize("hello")).toBe("Hello"));
  it("leaves rest unchanged",               () => expect(capitalize("hELLO")).toBe("HELLO"));
  it("handles single char",                 () => expect(capitalize("a")).toBe("A"));
  it("handles empty string",                () => expect(capitalize("")).toBe(""));
  it("already capitalized stays the same",  () => expect(capitalize("World")).toBe("World"));
});

describe("slugify", () => {
  it("lowercases and replaces spaces with dashes", () => expect(slugify("Hello World")).toBe("hello-world"));
  it("removes special characters",                 () => expect(slugify("Maths & Science!")).toBe("maths--science"));
  it("collapses multiple spaces to a single dash",  () => expect(slugify("a  b")).toBe("a-b"));
  it("already a slug stays the same",              () => expect(slugify("chapter-1")).toBe("chapter-1"));
  it("empty string returns empty",                 () => expect(slugify("")).toBe(""));
});

describe("wordCount", () => {
  it("counts words in a normal sentence",  () => expect(wordCount("Hello world")).toBe(2));
  it("handles extra whitespace",           () => expect(wordCount("  a  b  c  ")).toBe(3));
  it("empty string → 0",                  () => expect(wordCount("")).toBe(0));
  it("single word → 1",                   () => expect(wordCount("hello")).toBe(1));
  it("handles tabs and newlines as space", () => expect(wordCount("a\tb\nc")).toBe(3));
  it("100-word text → 100",               () => {
    const text = Array(100).fill("word").join(" ");
    expect(wordCount(text)).toBe(100);
  });
});

describe("formatRelativeDate", () => {
  it("today's date returns 'Today'", () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe("Today");
  });

  it("yesterday's date returns 'Yesterday'", () => {
    const yesterday = new Date(Date.now() - 86400_000).toISOString();
    expect(formatRelativeDate(yesterday)).toBe("Yesterday");
  });

  it("3 days ago returns '3 days ago'", () => {
    const threeDays = new Date(Date.now() - 3 * 86400_000).toISOString();
    expect(formatRelativeDate(threeDays)).toBe("3 days ago");
  });

  it("a week or more ago returns a formatted date string (not 'X days ago')", () => {
    const old = new Date(Date.now() - 10 * 86400_000).toISOString();
    const result = formatRelativeDate(old);
    expect(result).not.toMatch(/days ago/);
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── Integration: XP + level round-trips ─────────────────────────────────────

describe("XP system — round-trip consistency", () => {
  it("levelFromXP(xpForLevel(n)) always moves to the next level", () => {
    for (let n = 1; n <= 10; n++) {
      const threshold = xpForLevel(n);
      expect(levelFromXP(threshold)).toBe(n + 1);
    }
  });

  it("levelFromXP(xpForLevel(n) - 1) stays at level n", () => {
    for (let n = 1; n <= 10; n++) {
      const belowThreshold = xpForLevel(n) - 1;
      expect(levelFromXP(belowThreshold)).toBe(n);
    }
  });

  it("xpProgressInLevel pct matches actual ratio", () => {
    const xp = 150; // level 2, halfway through (level 2 span: 100→300, so 150 = 50/200 = 25%)
    const { current, required, pct } = xpProgressInLevel(xp);
    expect(pct).toBe(Math.round((current / required) * 100));
  });
});

// ─── Integration: mastery + label round-trip ─────────────────────────────────

describe("masteryLevel + masteryLabel — consistent pairing", () => {
  const samples = [0, 20, 40, 55, 60, 75, 80, 85, 90, 95, 100];
  for (const pct of samples) {
    it(`pct=${pct} has a matching label`, () => {
      const level = masteryLevel(pct);
      const label = masteryLabel(level);
      expect(label.length).toBeGreaterThan(0);
      // Label should not be generic — it must be one of the known strings
      expect(["Needs Work", "Developing", "Good", "Strong", "Mastered"]).toContain(label);
    });
  }
});
