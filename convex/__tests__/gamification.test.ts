import { describe, test, expect } from "vitest";

/**
 * Gamification backend tests.
 * Tests XP calculations, level progression, streak multipliers,
 * achievement conditions, and streak freeze logic.
 * Uses pure function testing (mirrored from xpCalculation.ts + gamificationConstants.ts).
 */

// ═══ CONSTANTS (mirrored from gamificationConstants.ts) ═══

const XP_PER_ACTION = {
  water: 5,
  habit: 10,
  mood: 10,
  sleep: 15,
  journal: 15,
  meal: 15,
  exercise: 20,
  challenge: 50,
} as const;

type XPAction = keyof typeof XP_PER_ACTION;

const STREAK_MULTIPLIERS = [
  { minDays: 30, multiplier: 3.0, label: "Racha x3" },
  { minDays: 14, multiplier: 2.0, label: "Racha x2" },
  { minDays: 7, multiplier: 1.5, label: "Racha x1.5" },
  { minDays: 0, multiplier: 1.0, label: "" },
] as const;

function generateLevelTable(maxLevel: number) {
  const table: Array<{ level: number; xpRequired: number; totalXP: number }> = [];
  let totalXP = 0;
  for (let level = 1; level <= maxLevel; level++) {
    const xpRequired = Math.round(100 * level * Math.pow(1.1, level - 1));
    table.push({ level, xpRequired, totalXP });
    totalXP += xpRequired;
  }
  return table;
}

const LEVEL_TABLE = generateLevelTable(50);

const STREAK_FREEZE_COOLDOWN_DAYS = 7;

// ═══ PURE FUNCTIONS (mirrored from xpCalculation.ts) ═══

function getXPForAction(action: XPAction): number {
  return XP_PER_ACTION[action];
}

function calculateStreakMultiplier(currentStreak: number): {
  multiplier: number;
  label: string;
} {
  for (const tier of STREAK_MULTIPLIERS) {
    if (currentStreak >= tier.minDays) {
      return { multiplier: tier.multiplier, label: tier.label };
    }
  }
  return { multiplier: 1.0, label: "" };
}

function calculateLevel(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
} {
  let remainingXP = totalXP;

  for (let i = 0; i < LEVEL_TABLE.length; i++) {
    const { level, xpRequired } = LEVEL_TABLE[i];
    if (remainingXP < xpRequired) {
      return { level, currentLevelXP: remainingXP, xpToNextLevel: xpRequired };
    }
    remainingXP -= xpRequired;
  }

  const lastLevel = LEVEL_TABLE[LEVEL_TABLE.length - 1];
  return {
    level: lastLevel.level,
    currentLevelXP: remainingXP,
    xpToNextLevel: lastLevel.xpRequired,
  };
}

function calculateXPAward(
  action: XPAction,
  bestStreak: number
): { baseXP: number; multiplier: number; totalXP: number } {
  const baseXP = getXPForAction(action);
  const { multiplier } = calculateStreakMultiplier(bestStreak);
  const totalXP = Math.round(baseXP * multiplier);
  return { baseXP, multiplier, totalXP };
}

// ═══ ACHIEVEMENT CHECKING LOGIC ═══

interface AchievementCondition {
  type: "count" | "streak" | "level" | "total_xp" | "special";
  metric?: string;
  target: number;
}

function checkAchievementCondition(
  condition: AchievementCondition,
  context: {
    counts: Record<string, number>;
    bestStreak: number;
    level: number;
    totalXP: number;
    dailyActions: number;
    modulesUsed: number;
  }
): boolean {
  switch (condition.type) {
    case "count":
      return (context.counts[condition.metric ?? ""] ?? 0) >= condition.target;
    case "streak":
      return context.bestStreak >= condition.target;
    case "level":
      return context.level >= condition.target;
    case "total_xp":
      return context.totalXP >= condition.target;
    case "special":
      if (condition.metric === "daily_actions")
        return context.dailyActions >= condition.target;
      if (condition.metric === "modules_used")
        return context.modulesUsed >= condition.target;
      return false;
    default:
      return false;
  }
}

// ═══ STREAK FREEZE LOGIC ═══

function canUseStreakFreeze(
  freezesAvailable: number,
  lastFreezeUsedAt: number | null,
  now: number
): { canUse: boolean; reason?: string } {
  if (freezesAvailable <= 0) {
    return { canUse: false, reason: "No streak freezes available" };
  }
  if (lastFreezeUsedAt) {
    const daysSinceLast =
      (now - lastFreezeUsedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceLast < STREAK_FREEZE_COOLDOWN_DAYS) {
      return { canUse: false, reason: "Cooldown period active" };
    }
  }
  return { canUse: true };
}

// ═══ TESTS ═══

describe("gamification: XP per action", () => {
  test("each action has correct XP value", () => {
    expect(getXPForAction("water")).toBe(5);
    expect(getXPForAction("habit")).toBe(10);
    expect(getXPForAction("mood")).toBe(10);
    expect(getXPForAction("sleep")).toBe(15);
    expect(getXPForAction("journal")).toBe(15);
    expect(getXPForAction("meal")).toBe(15);
    expect(getXPForAction("exercise")).toBe(20);
    expect(getXPForAction("challenge")).toBe(50);
  });

  test("water is the lowest XP action", () => {
    const values = Object.values(XP_PER_ACTION);
    expect(Math.min(...values)).toBe(5);
  });

  test("challenge is the highest XP action", () => {
    const values = Object.values(XP_PER_ACTION);
    expect(Math.max(...values)).toBe(50);
  });
});

describe("gamification: streak multipliers", () => {
  test("no streak gives 1x multiplier", () => {
    const result = calculateStreakMultiplier(0);
    expect(result.multiplier).toBe(1.0);
    expect(result.label).toBe("");
  });

  test("1-6 day streak gives 1x multiplier", () => {
    for (let i = 1; i <= 6; i++) {
      expect(calculateStreakMultiplier(i).multiplier).toBe(1.0);
    }
  });

  test("7-13 day streak gives 1.5x multiplier", () => {
    expect(calculateStreakMultiplier(7).multiplier).toBe(1.5);
    expect(calculateStreakMultiplier(7).label).toBe("Racha x1.5");
    expect(calculateStreakMultiplier(13).multiplier).toBe(1.5);
  });

  test("14-29 day streak gives 2x multiplier", () => {
    expect(calculateStreakMultiplier(14).multiplier).toBe(2.0);
    expect(calculateStreakMultiplier(14).label).toBe("Racha x2");
    expect(calculateStreakMultiplier(29).multiplier).toBe(2.0);
  });

  test("30+ day streak gives 3x multiplier", () => {
    expect(calculateStreakMultiplier(30).multiplier).toBe(3.0);
    expect(calculateStreakMultiplier(30).label).toBe("Racha x3");
    expect(calculateStreakMultiplier(100).multiplier).toBe(3.0);
  });

  test("multiplier boundaries are correct", () => {
    // 6 → 1x, 7 → 1.5x (boundary)
    expect(calculateStreakMultiplier(6).multiplier).toBe(1.0);
    expect(calculateStreakMultiplier(7).multiplier).toBe(1.5);

    // 13 → 1.5x, 14 → 2x (boundary)
    expect(calculateStreakMultiplier(13).multiplier).toBe(1.5);
    expect(calculateStreakMultiplier(14).multiplier).toBe(2.0);

    // 29 → 2x, 30 → 3x (boundary)
    expect(calculateStreakMultiplier(29).multiplier).toBe(2.0);
    expect(calculateStreakMultiplier(30).multiplier).toBe(3.0);
  });
});

describe("gamification: level calculation", () => {
  test("0 XP is level 1", () => {
    const result = calculateLevel(0);
    expect(result.level).toBe(1);
    expect(result.currentLevelXP).toBe(0);
  });

  test("level 1 requires 100 XP", () => {
    const result = calculateLevel(0);
    expect(result.xpToNextLevel).toBe(100);
  });

  test("99 XP is still level 1", () => {
    const result = calculateLevel(99);
    expect(result.level).toBe(1);
    expect(result.currentLevelXP).toBe(99);
  });

  test("100 XP reaches level 2", () => {
    const result = calculateLevel(100);
    expect(result.level).toBe(2);
    expect(result.currentLevelXP).toBe(0);
  });

  test("level 2 requires 220 XP (100*2*1.1)", () => {
    const result = calculateLevel(100);
    expect(result.xpToNextLevel).toBe(220);
  });

  test("XP requirements grow exponentially", () => {
    const level1XP = LEVEL_TABLE[0].xpRequired; // 100
    const level10XP = LEVEL_TABLE[9].xpRequired;
    const level25XP = LEVEL_TABLE[24].xpRequired;

    expect(level10XP).toBeGreaterThan(level1XP * 2);
    expect(level25XP).toBeGreaterThan(level10XP * 2);
  });

  test("max level is 50", () => {
    // Huge XP value to ensure max level
    const result = calculateLevel(999999999);
    expect(result.level).toBe(50);
  });

  test("level table has 50 entries", () => {
    expect(LEVEL_TABLE.length).toBe(50);
  });

  test("each level has higher XP requirement than previous", () => {
    for (let i = 1; i < LEVEL_TABLE.length; i++) {
      expect(LEVEL_TABLE[i].xpRequired).toBeGreaterThan(
        LEVEL_TABLE[i - 1].xpRequired
      );
    }
  });
});

describe("gamification: XP award calculation", () => {
  test("base XP with no streak", () => {
    const result = calculateXPAward("habit", 0);
    expect(result.baseXP).toBe(10);
    expect(result.multiplier).toBe(1.0);
    expect(result.totalXP).toBe(10);
  });

  test("XP with 1.5x streak multiplier", () => {
    const result = calculateXPAward("habit", 7);
    expect(result.baseXP).toBe(10);
    expect(result.multiplier).toBe(1.5);
    expect(result.totalXP).toBe(15);
  });

  test("XP with 2x streak multiplier", () => {
    const result = calculateXPAward("exercise", 14);
    expect(result.baseXP).toBe(20);
    expect(result.multiplier).toBe(2.0);
    expect(result.totalXP).toBe(40);
  });

  test("XP with 3x streak multiplier", () => {
    const result = calculateXPAward("meal", 30);
    expect(result.baseXP).toBe(15);
    expect(result.multiplier).toBe(3.0);
    expect(result.totalXP).toBe(45);
  });

  test("water XP with max streak", () => {
    const result = calculateXPAward("water", 60);
    expect(result.totalXP).toBe(15); // 5 * 3.0
  });

  test("challenge XP with no streak", () => {
    const result = calculateXPAward("challenge", 0);
    expect(result.totalXP).toBe(50);
  });

  test("challenge XP with max streak", () => {
    const result = calculateXPAward("challenge", 30);
    expect(result.totalXP).toBe(150); // 50 * 3.0
  });
});

describe("gamification: achievement conditions", () => {
  const defaultContext = {
    counts: {},
    bestStreak: 0,
    level: 1,
    totalXP: 0,
    dailyActions: 0,
    modulesUsed: 0,
  };

  test("count-based achievement: first water", () => {
    const condition: AchievementCondition = {
      type: "count",
      metric: "water",
      target: 1,
    };

    expect(checkAchievementCondition(condition, defaultContext)).toBe(false);
    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        counts: { water: 1 },
      })
    ).toBe(true);
  });

  test("count-based achievement: 100 water entries", () => {
    const condition: AchievementCondition = {
      type: "count",
      metric: "water",
      target: 100,
    };

    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        counts: { water: 99 },
      })
    ).toBe(false);
    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        counts: { water: 100 },
      })
    ).toBe(true);
    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        counts: { water: 200 },
      })
    ).toBe(true);
  });

  test("streak-based achievement", () => {
    const condition: AchievementCondition = {
      type: "streak",
      metric: "habit",
      target: 7,
    };

    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        bestStreak: 6,
      })
    ).toBe(false);
    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        bestStreak: 7,
      })
    ).toBe(true);
  });

  test("level-based achievement", () => {
    const condition: AchievementCondition = {
      type: "level",
      target: 10,
    };

    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        level: 9,
      })
    ).toBe(false);
    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        level: 10,
      })
    ).toBe(true);
  });

  test("total_xp-based achievement", () => {
    const condition: AchievementCondition = {
      type: "total_xp",
      target: 10000,
    };

    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        totalXP: 9999,
      })
    ).toBe(false);
    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        totalXP: 10000,
      })
    ).toBe(true);
  });

  test("special: daily actions", () => {
    const condition: AchievementCondition = {
      type: "special",
      metric: "daily_actions",
      target: 5,
    };

    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        dailyActions: 4,
      })
    ).toBe(false);
    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        dailyActions: 5,
      })
    ).toBe(true);
  });

  test("special: modules used", () => {
    const condition: AchievementCondition = {
      type: "special",
      metric: "modules_used",
      target: 3,
    };

    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        modulesUsed: 2,
      })
    ).toBe(false);
    expect(
      checkAchievementCondition(condition, {
        ...defaultContext,
        modulesUsed: 3,
      })
    ).toBe(true);
  });
});

describe("gamification: streak freeze", () => {
  test("can use freeze when available and no cooldown", () => {
    const result = canUseStreakFreeze(1, null, Date.now());
    expect(result.canUse).toBe(true);
  });

  test("cannot use freeze when none available", () => {
    const result = canUseStreakFreeze(0, null, Date.now());
    expect(result.canUse).toBe(false);
    expect(result.reason).toContain("No streak freezes");
  });

  test("cannot use freeze during cooldown", () => {
    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    const result = canUseStreakFreeze(1, threeDaysAgo, now);
    expect(result.canUse).toBe(false);
    expect(result.reason).toContain("Cooldown");
  });

  test("can use freeze after cooldown expires", () => {
    const now = Date.now();
    const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
    const result = canUseStreakFreeze(1, eightDaysAgo, now);
    expect(result.canUse).toBe(true);
  });

  test("cooldown boundary: exactly 7 days", () => {
    const now = Date.now();
    const exactlySeven = now - 7 * 24 * 60 * 60 * 1000;
    const result = canUseStreakFreeze(1, exactlySeven, now);
    expect(result.canUse).toBe(true);
  });

  test("cooldown boundary: 6.9 days", () => {
    const now = Date.now();
    const almostSeven = now - 6.9 * 24 * 60 * 60 * 1000;
    const result = canUseStreakFreeze(1, almostSeven, now);
    expect(result.canUse).toBe(false);
  });
});
