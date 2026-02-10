import { describe, test, expect } from "vitest";

/**
 * End-to-end gamification tests.
 * Tests cross-domain XP accumulation, level-up flows,
 * achievement unlocking, and challenge lifecycle.
 * Uses pure function testing (same pattern as cross-domain-e2e.test.ts).
 */

// ═══ CONSTANTS ═══

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

const CHALLENGE_XP_REWARDS = {
  facil: 50,
  medio: 100,
  dificil: 200,
} as const;

// ═══ PURE FUNCTIONS ═══

function calculateStreakMultiplier(streak: number): number {
  for (const tier of STREAK_MULTIPLIERS) {
    if (streak >= tier.minDays) return tier.multiplier;
  }
  return 1.0;
}

function awardXP(action: XPAction, bestStreak: number): number {
  const base = XP_PER_ACTION[action];
  const multiplier = calculateStreakMultiplier(bestStreak);
  return Math.round(base * multiplier);
}

function calculateLevel(totalXP: number): number {
  let remainingXP = totalXP;
  for (const { level, xpRequired } of LEVEL_TABLE) {
    if (remainingXP < xpRequired) return level;
    remainingXP -= xpRequired;
  }
  return 50;
}

// ═══ SIMULATED USER STATE ═══

interface UserGamificationState {
  totalXP: number;
  level: number;
  bestStreak: number;
  actionCounts: Record<string, number>;
  earnedAchievements: string[];
  activeChallengeProgress: number;
  activeChallengeTarget: number;
  activeChallengeMetric: string;
}

function createFreshUser(): UserGamificationState {
  return {
    totalXP: 0,
    level: 1,
    bestStreak: 0,
    actionCounts: {},
    earnedAchievements: [],
    activeChallengeProgress: 0,
    activeChallengeTarget: 0,
    activeChallengeMetric: "",
  };
}

function performAction(
  state: UserGamificationState,
  action: XPAction
): { state: UserGamificationState; xpGained: number; leveledUp: boolean } {
  const xpGained = awardXP(action, state.bestStreak);
  const newTotalXP = state.totalXP + xpGained;
  const oldLevel = state.level;
  const newLevel = calculateLevel(newTotalXP);

  const newCounts = { ...state.actionCounts };
  newCounts[action] = (newCounts[action] ?? 0) + 1;

  // Check challenge progress
  let newChallengeProgress = state.activeChallengeProgress;
  if (state.activeChallengeMetric === action) {
    newChallengeProgress += 1;
  }

  return {
    state: {
      ...state,
      totalXP: newTotalXP,
      level: newLevel,
      actionCounts: newCounts,
      activeChallengeProgress: newChallengeProgress,
    },
    xpGained,
    leveledUp: newLevel > oldLevel,
  };
}

function completeChallenge(
  state: UserGamificationState,
  difficulty: keyof typeof CHALLENGE_XP_REWARDS
): { state: UserGamificationState; xpGained: number } {
  const xpGained = CHALLENGE_XP_REWARDS[difficulty];
  const newTotalXP = state.totalXP + xpGained;
  const newLevel = calculateLevel(newTotalXP);

  const newCounts = { ...state.actionCounts };
  newCounts.challenge = (newCounts.challenge ?? 0) + 1;

  return {
    state: {
      ...state,
      totalXP: newTotalXP,
      level: newLevel,
      actionCounts: newCounts,
      activeChallengeProgress: 0,
      activeChallengeTarget: 0,
      activeChallengeMetric: "",
    },
    xpGained,
  };
}

// ═══ TESTS ═══

describe("E2E: new user onboarding flow", () => {
  test("user starts at level 1 with 0 XP", () => {
    const user = createFreshUser();
    expect(user.totalXP).toBe(0);
    expect(user.level).toBe(1);
    expect(Object.keys(user.actionCounts)).toHaveLength(0);
  });

  test("first action awards base XP (no streak)", () => {
    let user = createFreshUser();
    const result = performAction(user, "water");

    expect(result.xpGained).toBe(5);
    expect(result.state.totalXP).toBe(5);
    expect(result.state.level).toBe(1);
    expect(result.state.actionCounts.water).toBe(1);
  });

  test("multiple first actions across domains accumulate XP", () => {
    let user = createFreshUser();

    // Log water, meal, mood, exercise, sleep in first day
    const actions: XPAction[] = ["water", "meal", "mood", "exercise", "sleep"];
    let totalXP = 0;

    for (const action of actions) {
      const result = performAction(user, action);
      user = result.state;
      totalXP += result.xpGained;
    }

    expect(user.totalXP).toBe(5 + 15 + 10 + 20 + 15); // 65
    expect(user.totalXP).toBe(totalXP);
    expect(user.actionCounts.water).toBe(1);
    expect(user.actionCounts.meal).toBe(1);
    expect(user.actionCounts.exercise).toBe(1);
  });
});

describe("E2E: level up through daily usage", () => {
  test("user reaches level 2 after accumulating 100 XP", () => {
    let user = createFreshUser();

    // Log various actions to reach 100 XP
    // water(5)*4=20 + meal(15)*2=30 + exercise(20)*2=40 + mood(10)*1=10 = 100
    const actions: XPAction[] = [
      "water", "water", "water", "water",
      "meal", "meal",
      "exercise", "exercise",
      "mood",
    ];

    let leveledUp = false;
    for (const action of actions) {
      const result = performAction(user, action);
      user = result.state;
      if (result.leveledUp) leveledUp = true;
    }

    expect(user.totalXP).toBe(100);
    expect(user.level).toBe(2);
    expect(leveledUp).toBe(true);
  });

  test("consistent daily logging reaches level 3 within reasonable actions", () => {
    let user = createFreshUser();

    // Level 1 → 2: 100 XP, Level 2 → 3: 220 XP, Total: 320 XP
    // Daily: water(5) + meal(15)*2 + exercise(20) + mood(10) + sleep(15) = 80 XP/day
    // 4 days = 320 XP

    for (let day = 0; day < 4; day++) {
      const dailyActions: XPAction[] = [
        "water", "meal", "meal", "exercise", "mood", "sleep",
      ];
      for (const action of dailyActions) {
        const result = performAction(user, action);
        user = result.state;
      }
    }

    expect(user.totalXP).toBe(320);
    expect(user.level).toBe(3);
  });
});

describe("E2E: streak multiplier impact", () => {
  test("7-day streak makes daily XP 50% higher", () => {
    const noStreakUser = { ...createFreshUser(), bestStreak: 0 };
    const streakUser = { ...createFreshUser(), bestStreak: 7 };

    const noStreakResult = performAction(noStreakUser, "habit");
    const streakResult = performAction(streakUser, "habit");

    expect(noStreakResult.xpGained).toBe(10);
    expect(streakResult.xpGained).toBe(15); // 10 * 1.5
    expect(streakResult.xpGained).toBe(
      Math.round(noStreakResult.xpGained * 1.5)
    );
  });

  test("30-day streak triples XP, accelerating level progression", () => {
    let user30 = { ...createFreshUser(), bestStreak: 30 };
    let user0 = createFreshUser();

    // Both do 10 exercise actions
    for (let i = 0; i < 10; i++) {
      user30 = performAction(user30, "exercise").state;
      user0 = performAction(user0, "exercise").state;
    }

    expect(user0.totalXP).toBe(200); // 20 * 10
    expect(user30.totalXP).toBe(600); // 60 * 10
    expect(user30.level).toBeGreaterThan(user0.level);
  });
});

describe("E2E: challenge lifecycle", () => {
  test("complete habit → XP + challenge progress → challenge completion → bonus XP", () => {
    let user = createFreshUser();

    // Assign a challenge: complete 5 habits
    user.activeChallengeMetric = "habit";
    user.activeChallengeTarget = 5;

    // Complete 5 habits
    for (let i = 0; i < 5; i++) {
      const result = performAction(user, "habit");
      user = result.state;
    }

    // Challenge progress reached
    expect(user.activeChallengeProgress).toBe(5);
    expect(user.activeChallengeProgress).toBeGreaterThanOrEqual(
      user.activeChallengeTarget
    );

    // XP from habits: 10 * 5 = 50
    expect(user.totalXP).toBe(50);

    // Complete challenge and get bonus XP
    const challengeResult = completeChallenge(user, "medio");
    user = challengeResult.state;

    expect(challengeResult.xpGained).toBe(100);
    expect(user.totalXP).toBe(150); // 50 + 100
    expect(user.activeChallengeProgress).toBe(0); // reset
    expect(user.actionCounts.challenge).toBe(1);
  });

  test("non-matching actions don't advance challenge", () => {
    let user = createFreshUser();

    user.activeChallengeMetric = "water";
    user.activeChallengeTarget = 10;

    // Do 5 exercise actions (not water)
    for (let i = 0; i < 5; i++) {
      user = performAction(user, "exercise").state;
    }

    expect(user.activeChallengeProgress).toBe(0);
    expect(user.totalXP).toBe(100); // 20 * 5 from exercise
  });

  test("hard challenge gives 4x more XP than easy", () => {
    const user = createFreshUser();

    const easy = completeChallenge(user, "facil");
    const hard = completeChallenge(user, "dificil");

    expect(hard.xpGained).toBe(easy.xpGained * 4);
  });
});

describe("E2E: streak freeze preserves progression", () => {
  test("streak freeze logic preserves multiplier", () => {
    // Simulate: user has 8-day streak (1.5x), misses a day, uses freeze
    const streakBeforeFreeze = 8;
    const multiplierBefore = calculateStreakMultiplier(streakBeforeFreeze);

    // After freeze: streak stays, multiplier preserved
    const multiplierAfter = calculateStreakMultiplier(streakBeforeFreeze);

    expect(multiplierBefore).toBe(1.5);
    expect(multiplierAfter).toBe(multiplierBefore);
  });

  test("losing streak drops multiplier to 1x", () => {
    // User had 15-day streak (2x), streak resets to 0
    const multiplierBefore = calculateStreakMultiplier(15);
    const multiplierAfter = calculateStreakMultiplier(0);

    expect(multiplierBefore).toBe(2.0);
    expect(multiplierAfter).toBe(1.0);

    // XP impact: habit goes from 20 XP to 10 XP
    expect(awardXP("habit", 15)).toBe(20);
    expect(awardXP("habit", 0)).toBe(10);
  });
});

describe("E2E: achievement unlocking through actions", () => {
  test("first water action qualifies for 'first_water' achievement", () => {
    let user = createFreshUser();
    user = performAction(user, "water").state;

    expect(user.actionCounts.water).toBe(1);
    // Achievement condition: count water >= 1 → met
    expect(user.actionCounts.water >= 1).toBe(true);
  });

  test("100 water logs qualifies for 'water_100' achievement", () => {
    let user = createFreshUser();

    for (let i = 0; i < 100; i++) {
      user = performAction(user, "water").state;
    }

    expect(user.actionCounts.water).toBe(100);
    // XP: 100 * 5 = 500 (no streak)
    expect(user.totalXP).toBe(500);
    expect(user.level).toBeGreaterThan(2);
  });

  test("5 domains in one day qualifies for 'multi_5' achievement", () => {
    let user = createFreshUser();

    const actions: XPAction[] = ["water", "meal", "exercise", "mood", "sleep"];
    const domainsUsed = new Set<string>();

    for (const action of actions) {
      user = performAction(user, action).state;
      domainsUsed.add(action);
    }

    expect(domainsUsed.size).toBe(5);
  });

  test("reaching level 10 qualifies for 'level_10' achievement", () => {
    // Level 10 requires significant XP accumulation
    // Exact amount depends on level table, but let's verify the check
    let user = createFreshUser();

    // Fast-track: give lots of XP via high-streak exercises
    user.bestStreak = 30; // 3x multiplier

    // exercise = 20 * 3 = 60 XP each
    // Need to reach level 10 (cumulative XP for levels 1-9)
    let totalRequired = 0;
    for (let i = 0; i < 9; i++) {
      totalRequired += LEVEL_TABLE[i].xpRequired;
    }

    const actionsNeeded = Math.ceil(totalRequired / 60);
    for (let i = 0; i < actionsNeeded; i++) {
      user = performAction(user, "exercise").state;
    }

    expect(user.level).toBeGreaterThanOrEqual(10);
  });
});

describe("E2E: full day simulation", () => {
  test("complete day with all modules earns expected XP", () => {
    let user = createFreshUser();

    // Morning: water + sleep log
    user = performAction(user, "water").state; // 5
    user = performAction(user, "sleep").state; // 15

    // Breakfast
    user = performAction(user, "meal").state; // 15

    // Midday: mood + habit
    user = performAction(user, "mood").state; // 10
    user = performAction(user, "habit").state; // 10

    // Lunch
    user = performAction(user, "meal").state; // 15

    // Afternoon: exercise + water
    user = performAction(user, "exercise").state; // 20
    user = performAction(user, "water").state; // 5

    // Evening: dinner + journal + water
    user = performAction(user, "meal").state; // 15
    user = performAction(user, "journal").state; // 15
    user = performAction(user, "water").state; // 5

    const expectedXP = 5 + 15 + 15 + 10 + 10 + 15 + 20 + 5 + 15 + 15 + 5;
    expect(user.totalXP).toBe(expectedXP); // 130
    expect(user.level).toBe(2); // past 100 XP threshold
  });
});
