import {
  LEVEL_TABLE,
  STREAK_MULTIPLIERS,
  XP_PER_ACTION,
  type XPAction,
} from "./gamificationConstants";

export function getXPForAction(action: XPAction): number {
  return XP_PER_ACTION[action];
}

export function calculateStreakMultiplier(currentStreak: number): {
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

export function calculateLevel(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
} {
  let remainingXP = totalXP;

  for (let i = 0; i < LEVEL_TABLE.length; i++) {
    const { level, xpRequired } = LEVEL_TABLE[i];

    if (remainingXP < xpRequired) {
      return {
        level,
        currentLevelXP: remainingXP,
        xpToNextLevel: xpRequired,
      };
    }

    remainingXP -= xpRequired;
  }

  // Max level reached (50)
  const lastLevel = LEVEL_TABLE[LEVEL_TABLE.length - 1];
  return {
    level: lastLevel.level,
    currentLevelXP: remainingXP,
    xpToNextLevel: lastLevel.xpRequired,
  };
}

export function calculateXPAward(
  action: XPAction,
  bestStreak: number
): {
  baseXP: number;
  multiplier: number;
  totalXP: number;
} {
  const baseXP = getXPForAction(action);
  const { multiplier } = calculateStreakMultiplier(bestStreak);
  const totalXP = Math.round(baseXP * multiplier);

  return { baseXP, multiplier, totalXP };
}
