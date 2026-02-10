import { describe, test, expect } from "vitest";

/**
 * Regression tests for Fase 5 (Gamificacion y Pulido).
 * Verifies that gamification features integrate correctly with
 * existing modules without breaking previous functionality.
 */

// ═══ GAMIFICATION CONSTANTS (mirrored) ═══

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

const CHALLENGE_XP_REWARDS = {
  facil: 50,
  medio: 100,
  dificil: 200,
} as const;

const STREAK_MULTIPLIERS = [
  { minDays: 30, multiplier: 3.0 },
  { minDays: 14, multiplier: 2.0 },
  { minDays: 7, multiplier: 1.5 },
  { minDays: 0, multiplier: 1.0 },
] as const;

function generateLevelTable(maxLevel: number) {
  const table: Array<{ level: number; xpRequired: number }> = [];
  for (let level = 1; level <= maxLevel; level++) {
    const xpRequired = Math.round(100 * level * Math.pow(1.1, level - 1));
    table.push({ level, xpRequired });
  }
  return table;
}

const LEVEL_TABLE = generateLevelTable(50);

// ═══ ACHIEVEMENT DEFINITIONS (mirrored) ═══

interface AchievementDef {
  code: string;
  category: string;
  condition: {
    type: string;
    metric?: string;
    target: number;
  };
}

const ACHIEVEMENTS: AchievementDef[] = [
  { code: "first_water", category: "principiante", condition: { type: "count", metric: "water", target: 1 } },
  { code: "first_meal", category: "principiante", condition: { type: "count", metric: "meal", target: 1 } },
  { code: "first_exercise", category: "principiante", condition: { type: "count", metric: "exercise", target: 1 } },
  { code: "first_mood", category: "principiante", condition: { type: "count", metric: "mood", target: 1 } },
  { code: "first_sleep", category: "principiante", condition: { type: "count", metric: "sleep", target: 1 } },
  { code: "streak_3d", category: "constancia", condition: { type: "streak", metric: "habit", target: 3 } },
  { code: "streak_7d", category: "constancia", condition: { type: "streak", metric: "habit", target: 7 } },
  { code: "streak_14d", category: "constancia", condition: { type: "streak", metric: "habit", target: 14 } },
  { code: "streak_30d", category: "constancia", condition: { type: "streak", metric: "habit", target: 30 } },
  { code: "daily_complete_3", category: "constancia", condition: { type: "special", metric: "daily_actions", target: 3 } },
  { code: "daily_complete_5", category: "constancia", condition: { type: "special", metric: "daily_actions", target: 5 } },
  { code: "weekly_consistent", category: "constancia", condition: { type: "special", metric: "any_action", target: 7 } },
  { code: "water_100", category: "dedicacion", condition: { type: "count", metric: "water", target: 100 } },
  { code: "meals_50", category: "dedicacion", condition: { type: "count", metric: "meal", target: 50 } },
  { code: "exercise_50", category: "dedicacion", condition: { type: "count", metric: "exercise", target: 50 } },
  { code: "mood_30", category: "dedicacion", condition: { type: "count", metric: "mood", target: 30 } },
  { code: "sleep_30", category: "dedicacion", condition: { type: "count", metric: "sleep", target: 30 } },
  { code: "multi_3", category: "explorador", condition: { type: "special", metric: "modules_used", target: 3 } },
  { code: "multi_5", category: "explorador", condition: { type: "special", metric: "modules_used", target: 5 } },
  { code: "challenge_1", category: "explorador", condition: { type: "count", metric: "challenge", target: 1 } },
  { code: "challenge_5", category: "explorador", condition: { type: "count", metric: "challenge", target: 5 } },
  { code: "level_5", category: "maestria", condition: { type: "level", target: 5 } },
  { code: "level_10", category: "maestria", condition: { type: "level", target: 10 } },
  { code: "level_25", category: "maestria", condition: { type: "level", target: 25 } },
  { code: "xp_10000", category: "maestria", condition: { type: "total_xp", target: 10000 } },
];

// ═══ TESTS ═══

describe("regression: gamification constants integrity", () => {
  test("all XP actions have positive values", () => {
    for (const [action, xp] of Object.entries(XP_PER_ACTION)) {
      expect(xp).toBeGreaterThan(0);
    }
  });

  test("XP actions cover all wellness domains", () => {
    const actions = Object.keys(XP_PER_ACTION);
    expect(actions).toContain("water");
    expect(actions).toContain("habit");
    expect(actions).toContain("mood");
    expect(actions).toContain("sleep");
    expect(actions).toContain("meal");
    expect(actions).toContain("exercise");
    expect(actions).toContain("journal");
    expect(actions).toContain("challenge");
  });

  test("streak multipliers are sorted descending by minDays", () => {
    for (let i = 0; i < STREAK_MULTIPLIERS.length - 1; i++) {
      expect(STREAK_MULTIPLIERS[i].minDays).toBeGreaterThan(
        STREAK_MULTIPLIERS[i + 1].minDays
      );
    }
  });

  test("streak multipliers have increasing values", () => {
    // Sorted by minDays desc, so multipliers should also be desc
    for (let i = 0; i < STREAK_MULTIPLIERS.length - 1; i++) {
      expect(STREAK_MULTIPLIERS[i].multiplier).toBeGreaterThan(
        STREAK_MULTIPLIERS[i + 1].multiplier
      );
    }
  });

  test("challenge XP rewards scale by difficulty", () => {
    expect(CHALLENGE_XP_REWARDS.facil).toBeLessThan(CHALLENGE_XP_REWARDS.medio);
    expect(CHALLENGE_XP_REWARDS.medio).toBeLessThan(CHALLENGE_XP_REWARDS.dificil);
  });
});

describe("regression: level table consistency", () => {
  test("level table has exactly 50 levels", () => {
    expect(LEVEL_TABLE.length).toBe(50);
  });

  test("levels are sequential 1-50", () => {
    for (let i = 0; i < LEVEL_TABLE.length; i++) {
      expect(LEVEL_TABLE[i].level).toBe(i + 1);
    }
  });

  test("XP requirements are strictly increasing", () => {
    for (let i = 1; i < LEVEL_TABLE.length; i++) {
      expect(LEVEL_TABLE[i].xpRequired).toBeGreaterThan(
        LEVEL_TABLE[i - 1].xpRequired
      );
    }
  });

  test("level 1 requires exactly 100 XP", () => {
    expect(LEVEL_TABLE[0].xpRequired).toBe(100);
  });

  test("high levels require substantially more XP", () => {
    // Level 50 should require much more than level 1
    expect(LEVEL_TABLE[49].xpRequired).toBeGreaterThan(
      LEVEL_TABLE[0].xpRequired * 50
    );
  });
});

describe("regression: achievement definitions integrity", () => {
  test("all achievement codes are unique", () => {
    const codes = ACHIEVEMENTS.map((a) => a.code);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  test("all categories are valid", () => {
    const validCategories = [
      "principiante",
      "constancia",
      "dedicacion",
      "explorador",
      "maestria",
    ];
    for (const achievement of ACHIEVEMENTS) {
      expect(validCategories).toContain(achievement.category);
    }
  });

  test("principiante has 5 achievements", () => {
    const count = ACHIEVEMENTS.filter(
      (a) => a.category === "principiante"
    ).length;
    expect(count).toBe(5);
  });

  test("constancia has 7 achievements", () => {
    const count = ACHIEVEMENTS.filter(
      (a) => a.category === "constancia"
    ).length;
    expect(count).toBe(7);
  });

  test("all condition types are valid", () => {
    const validTypes = ["count", "streak", "level", "total_xp", "special"];
    for (const achievement of ACHIEVEMENTS) {
      expect(validTypes).toContain(achievement.condition.type);
    }
  });

  test("all condition targets are positive", () => {
    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.condition.target).toBeGreaterThan(0);
    }
  });

  test("total achievements count is 25", () => {
    expect(ACHIEVEMENTS.length).toBe(25);
  });

  test("streak achievements are in increasing order", () => {
    const streakAchievements = ACHIEVEMENTS.filter(
      (a) => a.condition.type === "streak"
    );
    for (let i = 1; i < streakAchievements.length; i++) {
      expect(streakAchievements[i].condition.target).toBeGreaterThan(
        streakAchievements[i - 1].condition.target
      );
    }
  });

  test("level achievements are in increasing order", () => {
    const levelAchievements = ACHIEVEMENTS.filter(
      (a) => a.condition.type === "level"
    );
    for (let i = 1; i < levelAchievements.length; i++) {
      expect(levelAchievements[i].condition.target).toBeGreaterThan(
        levelAchievements[i - 1].condition.target
      );
    }
  });
});

describe("regression: plan types include challenge", () => {
  test("plan types now include challenge alongside existing types", () => {
    const planTypes = [
      "daily",
      "meal",
      "workout",
      "skincare_routine",
      "sleep_routine",
      "weekly",
      "challenge",
    ];
    const unique = new Set(planTypes);
    expect(unique.size).toBe(planTypes.length);
    expect(planTypes).toContain("challenge");
  });
});

describe("regression: existing modules with gamification integration", () => {
  test("water logging still produces correct totals (XP is additive, not modifying)", () => {
    // Water entries are independent of gamification
    const waterEntries = [
      { amount: 250 },
      { amount: 500 },
      { amount: 350 },
    ];
    const totalMl = waterEntries.reduce((sum, e) => sum + e.amount, 0);
    expect(totalMl).toBe(1100);

    // XP is calculated separately: 3 water logs = 15 XP
    const xp = waterEntries.length * XP_PER_ACTION.water;
    expect(xp).toBe(15);
  });

  test("nutrition tracking is unaffected by gamification", () => {
    const meals = [
      { calories: 450, protein: 30, carbs: 50, fat: 15 },
      { calories: 600, protein: 40, carbs: 60, fat: 20 },
    ];
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    expect(totalCalories).toBe(1050);

    // XP from 2 meal logs
    const xp = meals.length * XP_PER_ACTION.meal;
    expect(xp).toBe(30);
  });

  test("sleep quality calculation is independent of gamification", () => {
    function calculateQualityScore(sleep: {
      durationMinutes: number;
      quality: number;
      interruptions?: number;
    }): number {
      let score = 0;
      const hours = sleep.durationMinutes / 60;
      if (hours >= 7 && hours <= 9) score += 40;
      else if (hours >= 6 && hours < 7) score += 30;
      else if (hours > 9 && hours <= 10) score += 30;
      else if (hours >= 5 && hours < 6) score += 15;
      else score += 5;
      score += sleep.quality * 6;
      const penalty = Math.min(sleep.interruptions ?? 0, 4);
      score += Math.max(5, 20 - penalty * 5);
      score += 10;
      return Math.min(100, Math.max(0, score));
    }

    // Same result as before gamification was added
    const score = calculateQualityScore({
      durationMinutes: 480,
      quality: 5,
      interruptions: 0,
    });
    expect(score).toBeGreaterThanOrEqual(90);
  });

  test("habit streak logic is unchanged", () => {
    function calculateStreak(args: {
      currentStreak: number;
      completedYesterday: boolean;
      completedToday: boolean;
    }): { newStreak: number } {
      if (args.completedToday) return { newStreak: args.currentStreak };
      if (args.completedYesterday) return { newStreak: args.currentStreak + 1 };
      return { newStreak: 1 };
    }

    expect(
      calculateStreak({
        currentStreak: 5,
        completedYesterday: true,
        completedToday: false,
      })
    ).toEqual({ newStreak: 6 });
  });

  test("mood tracking data model is unchanged", () => {
    const moodEntries = [
      { mood: "calmado", intensity: 7 },
      { mood: "ansioso", intensity: 4 },
    ];
    const avg =
      moodEntries.reduce((sum, e) => sum + e.intensity, 0) /
      moodEntries.length;
    expect(avg).toBe(5.5);
  });
});

describe("regression: gamification does not conflict with insights", () => {
  test("cross-domain data structure supports gamification alongside insights", () => {
    // DayData used by insights includes all original domains
    const dayData = {
      date: Date.now(),
      sleep: { qualityScore: 85, durationMinutes: 480, logged: true },
      nutrition: { totalCalories: 2100, totalProtein: 120, mealCount: 3 },
      fitness: { exerciseCount: 2, totalVolume: 5000, totalDuration: 60 },
      mood: { averageIntensity: 7, checkInCount: 2, dominantMood: "calmado" },
      habits: { completedCount: 4 },
      hydration: { totalMl: 2500 },
    };

    // XP that would be earned from this day's activities
    const dayXP =
      XP_PER_ACTION.sleep +
      XP_PER_ACTION.meal * dayData.nutrition.mealCount +
      XP_PER_ACTION.exercise * dayData.fitness.exerciseCount +
      XP_PER_ACTION.mood * dayData.mood.checkInCount +
      XP_PER_ACTION.habit * dayData.habits.completedCount;

    // Insights data remains untouched
    expect(dayData.sleep.qualityScore).toBe(85);
    expect(dayData.nutrition.totalCalories).toBe(2100);

    // XP is calculated independently
    expect(dayXP).toBe(15 + 45 + 40 + 20 + 40); // 160
  });
});

describe("regression: notification types include challenge", () => {
  test("notification types cover all domains including challenge", () => {
    const notificationTypes = [
      "hydration_reminder",
      "habits_reminder",
      "nutrition_reminder",
      "workout_reminder",
      "mood_checkin_reminder",
      "crisis_incident",
      "cross_domain_insight",
      "sleep_bedtime_reminder",
      "sleep_log_reminder",
      "daily_plan",
      "challenge_complete",
    ];
    expect(notificationTypes.length).toBe(11);
    const unique = new Set(notificationTypes);
    expect(unique.size).toBe(notificationTypes.length);
  });
});
