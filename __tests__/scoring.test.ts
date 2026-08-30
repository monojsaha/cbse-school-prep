import { describe, it, expect } from "vitest";
import { xpForQuestion, levelFromXP, xpProgressInLevel, masteryLevel } from "../lib/utils";

describe("xpForQuestion", () => {
  it("gives 5 XP for easy with no hints", () => {
    expect(xpForQuestion("easy", 0)).toBe(5);
  });
  it("gives 10 XP for medium with no hints", () => {
    expect(xpForQuestion("medium", 0)).toBe(10);
  });
  it("gives 15 XP for hard with no hints", () => {
    expect(xpForQuestion("hard", 0)).toBe(15);
  });
  it("gives 25 XP for challenge with no hints", () => {
    expect(xpForQuestion("challenge", 0)).toBe(25);
  });
  it("deducts 1 XP per hint used", () => {
    expect(xpForQuestion("medium", 2)).toBe(8);
  });
  it("never goes below 1 XP", () => {
    expect(xpForQuestion("easy", 100)).toBe(1);
  });
});

describe("levelFromXP", () => {
  it("level 1 at 0 XP", () => {
    expect(levelFromXP(0)).toBe(1);
  });
  it("level 1 just below threshold", () => {
    // Level 1 → 2 requires 100 XP (1*2*50)
    expect(levelFromXP(99)).toBe(1);
  });
  it("level 2 at 100 XP", () => {
    expect(levelFromXP(100)).toBe(2);
  });
  it("level 3 at 300 XP", () => {
    // Level 2→3 threshold: 2*3*50 = 300
    expect(levelFromXP(300)).toBe(3);
  });
});

describe("xpProgressInLevel", () => {
  it("returns correct current and required at level 1", () => {
    const { current, required } = xpProgressInLevel(50);
    expect(current).toBe(50);
    expect(required).toBe(100);
  });
  it("current does not exceed required", () => {
    const { current, required } = xpProgressInLevel(250);
    expect(current).toBeLessThanOrEqual(required);
  });
});

describe("masteryLevel", () => {
  it("90+ is mastered", () => {
    expect(masteryLevel(90)).toBe("mastered");
    expect(masteryLevel(100)).toBe("mastered");
  });
  it("80-89 is strong", () => {
    expect(masteryLevel(80)).toBe("strong");
    expect(masteryLevel(89)).toBe("strong");
  });
  it("60-79 is good", () => {
    expect(masteryLevel(60)).toBe("good");
    expect(masteryLevel(79)).toBe("good");
  });
  it("40-59 is developing", () => {
    expect(masteryLevel(40)).toBe("developing");
    expect(masteryLevel(59)).toBe("developing");
  });
  it("below 40 is needs_work", () => {
    expect(masteryLevel(0)).toBe("needs_work");
    expect(masteryLevel(39)).toBe("needs_work");
  });
});
