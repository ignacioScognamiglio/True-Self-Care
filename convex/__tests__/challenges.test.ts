import { describe, test, expect } from "vitest";

/**
 * Challenges tests.
 * Tests challenge progress tracking, completion detection, XP rewards,
 * and challenge content validation.
 * Uses pure function testing (same pattern as other test files).
 */

// ═══ CONSTANTS (mirrored from gamificationConstants.ts) ═══

const CHALLENGE_XP_REWARDS = {
  facil: 50,
  medio: 100,
  dificil: 200,
} as const;

type ChallengeDifficulty = keyof typeof CHALLENGE_XP_REWARDS;

// ═══ TYPES ═══

interface ChallengeContent {
  title: string;
  description: string;
  type: string;
  difficulty: ChallengeDifficulty;
  metric: string;
  targetValue: number;
  currentValue: number;
  durationDays: number;
  xpReward: number;
  tips: string[];
}

// ═══ PURE FUNCTIONS (mirrored from challenges.ts logic) ═══

function updateChallengeProgress(
  challenge: ChallengeContent,
  metric: string,
  incrementBy: number
): { updated: boolean; newValue: number; completed: boolean } {
  if (challenge.metric !== metric) {
    return { updated: false, newValue: challenge.currentValue, completed: false };
  }

  const newValue = challenge.currentValue + incrementBy;
  const completed = newValue >= challenge.targetValue;

  return { updated: true, newValue, completed };
}

function calculateProgressPercent(
  currentValue: number,
  targetValue: number
): number {
  if (targetValue <= 0) return 0;
  return Math.min(100, Math.round((currentValue / targetValue) * 100));
}

function getXPRewardForDifficulty(difficulty: ChallengeDifficulty): number {
  return CHALLENGE_XP_REWARDS[difficulty];
}

function isChallengeExpired(expiresAt: number, now: number): boolean {
  return now >= expiresAt;
}

function validateChallengeContent(content: Partial<ChallengeContent>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content.title || content.title.trim().length === 0) {
    errors.push("Title is required");
  }
  if (!content.type) errors.push("Type is required");
  if (!content.difficulty || !(content.difficulty in CHALLENGE_XP_REWARDS)) {
    errors.push("Valid difficulty is required");
  }
  if (!content.metric) errors.push("Metric is required");
  if (!content.targetValue || content.targetValue <= 0) {
    errors.push("Target value must be positive");
  }
  if (!content.durationDays || content.durationDays <= 0) {
    errors.push("Duration must be positive");
  }

  return { valid: errors.length === 0, errors };
}

// ═══ TESTS ═══

describe("challenges: progress tracking", () => {
  const baseChallenge: ChallengeContent = {
    title: "Hidratacion semanal",
    description: "Registra agua 20 veces esta semana",
    type: "hydration",
    difficulty: "medio",
    metric: "water_logs",
    targetValue: 20,
    currentValue: 0,
    durationDays: 7,
    xpReward: 100,
    tips: ["Lleva una botella contigo"],
  };

  test("updates progress when metric matches", () => {
    const result = updateChallengeProgress(baseChallenge, "water_logs", 1);
    expect(result.updated).toBe(true);
    expect(result.newValue).toBe(1);
    expect(result.completed).toBe(false);
  });

  test("does not update when metric doesn't match", () => {
    const result = updateChallengeProgress(baseChallenge, "meals", 1);
    expect(result.updated).toBe(false);
    expect(result.newValue).toBe(0);
  });

  test("increments from existing value", () => {
    const challenge = { ...baseChallenge, currentValue: 15 };
    const result = updateChallengeProgress(challenge, "water_logs", 3);
    expect(result.updated).toBe(true);
    expect(result.newValue).toBe(18);
    expect(result.completed).toBe(false);
  });

  test("detects completion when target reached", () => {
    const challenge = { ...baseChallenge, currentValue: 19 };
    const result = updateChallengeProgress(challenge, "water_logs", 1);
    expect(result.completed).toBe(true);
    expect(result.newValue).toBe(20);
  });

  test("detects completion when target exceeded", () => {
    const challenge = { ...baseChallenge, currentValue: 18 };
    const result = updateChallengeProgress(challenge, "water_logs", 5);
    expect(result.completed).toBe(true);
    expect(result.newValue).toBe(23);
  });

  test("handles zero increment", () => {
    const challenge = { ...baseChallenge, currentValue: 10 };
    const result = updateChallengeProgress(challenge, "water_logs", 0);
    expect(result.updated).toBe(true);
    expect(result.newValue).toBe(10);
    expect(result.completed).toBe(false);
  });
});

describe("challenges: progress percentage", () => {
  test("0% when no progress", () => {
    expect(calculateProgressPercent(0, 20)).toBe(0);
  });

  test("50% at halfway", () => {
    expect(calculateProgressPercent(10, 20)).toBe(50);
  });

  test("100% at target", () => {
    expect(calculateProgressPercent(20, 20)).toBe(100);
  });

  test("caps at 100% when exceeded", () => {
    expect(calculateProgressPercent(25, 20)).toBe(100);
  });

  test("rounds to nearest integer", () => {
    expect(calculateProgressPercent(1, 3)).toBe(33);
    expect(calculateProgressPercent(2, 3)).toBe(67);
  });

  test("0% when target is 0", () => {
    expect(calculateProgressPercent(5, 0)).toBe(0);
  });

  test("0% when target is negative", () => {
    expect(calculateProgressPercent(5, -1)).toBe(0);
  });
});

describe("challenges: XP rewards", () => {
  test("easy challenge gives 50 XP", () => {
    expect(getXPRewardForDifficulty("facil")).toBe(50);
  });

  test("medium challenge gives 100 XP", () => {
    expect(getXPRewardForDifficulty("medio")).toBe(100);
  });

  test("hard challenge gives 200 XP", () => {
    expect(getXPRewardForDifficulty("dificil")).toBe(200);
  });

  test("difficulty reward scales progressively", () => {
    const facil = CHALLENGE_XP_REWARDS.facil;
    const medio = CHALLENGE_XP_REWARDS.medio;
    const dificil = CHALLENGE_XP_REWARDS.dificil;

    expect(medio).toBeGreaterThan(facil);
    expect(dificil).toBeGreaterThan(medio);
    expect(dificil).toBe(facil * 4); // 200 = 50 * 4
  });
});

describe("challenges: expiration", () => {
  test("challenge is not expired before deadline", () => {
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
    expect(isChallengeExpired(expiresAt, now)).toBe(false);
  });

  test("challenge is expired after deadline", () => {
    const now = Date.now();
    const expiresAt = now - 1000; // 1 second ago
    expect(isChallengeExpired(expiresAt, now)).toBe(true);
  });

  test("challenge is expired at exact deadline", () => {
    const now = Date.now();
    expect(isChallengeExpired(now, now)).toBe(true);
  });
});

describe("challenges: content validation", () => {
  test("valid challenge content passes", () => {
    const result = validateChallengeContent({
      title: "Hidratacion semanal",
      type: "hydration",
      difficulty: "medio",
      metric: "water_logs",
      targetValue: 20,
      durationDays: 7,
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("missing title fails", () => {
    const result = validateChallengeContent({
      type: "hydration",
      difficulty: "medio",
      metric: "water_logs",
      targetValue: 20,
      durationDays: 7,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Title is required");
  });

  test("empty title fails", () => {
    const result = validateChallengeContent({
      title: "   ",
      type: "hydration",
      difficulty: "medio",
      metric: "water_logs",
      targetValue: 20,
      durationDays: 7,
    });
    expect(result.valid).toBe(false);
  });

  test("invalid difficulty fails", () => {
    const result = validateChallengeContent({
      title: "Test",
      type: "hydration",
      difficulty: "imposible" as ChallengeDifficulty,
      metric: "water_logs",
      targetValue: 20,
      durationDays: 7,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Valid difficulty is required");
  });

  test("zero target value fails", () => {
    const result = validateChallengeContent({
      title: "Test",
      type: "hydration",
      difficulty: "facil",
      metric: "water_logs",
      targetValue: 0,
      durationDays: 7,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Target value must be positive");
  });

  test("negative duration fails", () => {
    const result = validateChallengeContent({
      title: "Test",
      type: "hydration",
      difficulty: "facil",
      metric: "water_logs",
      targetValue: 10,
      durationDays: -1,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Duration must be positive");
  });

  test("multiple missing fields reports all errors", () => {
    const result = validateChallengeContent({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(5);
  });
});
