import { describe, it, expect } from "vitest";
import { nextReviewInterval } from "../lib/utils";

describe("nextReviewInterval (SM-2 simplified)", () => {
  it("first review with quality 5 returns interval 1", () => {
    const { interval } = nextReviewInterval(0, 2.5, 5);
    expect(interval).toBe(1);
  });

  it("second review (interval=1) with quality 5 returns interval 4", () => {
    const { interval } = nextReviewInterval(1, 2.5, 5);
    expect(interval).toBe(4);
  });

  it("subsequent reviews multiply by ease factor (rounded)", () => {
    const { interval } = nextReviewInterval(6, 2.5, 5);
    // 6 * ef where ef = 2.5 + 0.1 - 0 * (0.08+0) = 2.6 → 6*2.6=15.6 → rounds to 16
    expect(interval).toBe(16);
  });

  it("poor quality (1) resets interval to 1", () => {
    const { interval } = nextReviewInterval(10, 2.5, 1);
    expect(interval).toBe(1);
  });

  it("ease factor increases with quality 5", () => {
    const { easeFactor } = nextReviewInterval(0, 2.5, 5);
    expect(easeFactor).toBeGreaterThan(2.5);
  });

  it("ease factor decreases with quality 1", () => {
    const { easeFactor } = nextReviewInterval(0, 2.5, 1);
    expect(easeFactor).toBeLessThan(2.5);
  });

  it("ease factor never falls below 1.3", () => {
    const { easeFactor } = nextReviewInterval(0, 1.3, 0);
    expect(easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
