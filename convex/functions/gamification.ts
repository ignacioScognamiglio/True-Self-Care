import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";
import { calculateLevel, calculateXPAward } from "../lib/xpCalculation";
import { calculateStreakMultiplier } from "../lib/xpCalculation";
import {
  ACHIEVEMENTS,
  MAX_STREAK_FREEZES,
  STREAK_FREEZE_COOLDOWN_DAYS,
  LEVEL_TABLE,
} from "../lib/gamificationConstants";
import type { XPAction } from "../lib/gamificationConstants";
import { startOfDay } from "date-fns";

// ═══ INTERNAL MUTATIONS ═══

export const initializeGamification = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("gamification", {
      userId: args.userId,
      totalXP: 0,
      level: 1,
      currentLevelXP: 0,
      xpToNextLevel: LEVEL_TABLE[0].xpRequired,
      streakFreezes: 0,
      createdAt: Date.now(),
    });
  },
});

export const awardXP = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get or initialize gamification profile
    let profile = await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) {
      const id = await ctx.db.insert("gamification", {
        userId: args.userId,
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        xpToNextLevel: LEVEL_TABLE[0].xpRequired,
        streakFreezes: 0,
        createdAt: Date.now(),
      });
      profile = (await ctx.db.get(id))!;
    }

    // Get best current streak from habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const bestStreak = habits.reduce(
      (max, h) => Math.max(max, h.currentStreak),
      0
    );

    // Calculate XP award
    const action = args.action as XPAction;
    const { baseXP, multiplier, totalXP: xpAwarded } = calculateXPAward(
      action,
      bestStreak
    );

    // Update profile
    const newTotalXP = profile.totalXP + xpAwarded;
    const oldLevel = profile.level;
    const { level: newLevel, currentLevelXP, xpToNextLevel } =
      calculateLevel(newTotalXP);

    await ctx.db.patch(profile._id, {
      totalXP: newTotalXP,
      level: newLevel,
      currentLevelXP,
      xpToNextLevel,
      lastXPActionAt: Date.now(),
    });

    const leveledUp = newLevel > oldLevel;

    // Check achievements for this action
    await ctx.scheduler.runAfter(
      0,
      internal.functions.gamification.checkAndAwardAchievements,
      {
        userId: args.userId,
        action: args.action,
      }
    );

    return { xpAwarded, newTotalXP, newLevel, leveledUp, multiplier };
  },
});

export const checkAndAwardAchievements = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get already earned achievements
    const earned = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const earnedCodes = new Set(earned.map((a) => a.code));

    // Get gamification profile
    const profile = await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) return [];

    // Get habits for streak checks
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const bestStreak = habits.reduce(
      (max, h) => Math.max(max, h.currentStreak),
      0
    );

    // Get counts for different entry types
    const countByType = async (type: string) => {
      const entries = await ctx.db
        .query("wellnessEntries")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", args.userId).eq("type", type as any)
        )
        .collect();
      return entries.length;
    };

    // Get today's actions for daily achievements
    const todayStart = startOfDay(new Date()).getTime();
    const todayEntries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", args.userId).gte("timestamp", todayStart)
      )
      .collect();

    const todayModules = new Set(todayEntries.map((e) => e.type));

    // Get completed challenges count
    const completedChallenges = await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "challenge")
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const newlyEarned: Array<{ code: string; name: string; xpAwarded: number }> = [];

    for (const achievement of ACHIEVEMENTS) {
      if (earnedCodes.has(achievement.code)) continue;

      let met = false;
      const { condition } = achievement;

      switch (condition.type) {
        case "count": {
          // Map metric to wellnessEntries type
          const typeMap: Record<string, string> = {
            water: "water",
            meal: "nutrition",
            exercise: "exercise",
            mood: "mood",
            sleep: "sleep",
            challenge: "__challenge__",
          };
          const entryType = typeMap[condition.metric!];
          if (entryType === "__challenge__") {
            met = completedChallenges.length >= condition.target;
          } else if (entryType) {
            const count = await countByType(entryType);
            met = count >= condition.target;
          }
          break;
        }
        case "streak":
          met = bestStreak >= condition.target;
          break;
        case "level":
          met = profile.level >= condition.target;
          break;
        case "total_xp":
          met = profile.totalXP >= condition.target;
          break;
        case "special":
          if (condition.metric === "daily_actions") {
            met = todayEntries.length >= condition.target;
          } else if (condition.metric === "modules_used") {
            met = todayModules.size >= condition.target;
          } else if (condition.metric === "any_action") {
            // Check consecutive days with at least 1 action
            let consecutiveDays = 0;
            for (let i = 0; i < condition.target + 1; i++) {
              const dayStart = startOfDay(
                new Date(Date.now() - i * 24 * 60 * 60 * 1000)
              ).getTime();
              const dayEnd = dayStart + 24 * 60 * 60 * 1000;
              const dayEntries = await ctx.db
                .query("wellnessEntries")
                .withIndex("by_user_time", (q) =>
                  q
                    .eq("userId", args.userId)
                    .gte("timestamp", dayStart)
                )
                .filter((q) => q.lt(q.field("timestamp"), dayEnd))
                .first();
              if (dayEntries) {
                consecutiveDays++;
              } else {
                break;
              }
            }
            met = consecutiveDays >= condition.target;
          }
          break;
      }

      if (met) {
        await ctx.db.insert("achievements", {
          userId: args.userId,
          code: achievement.code,
          earnedAt: Date.now(),
          xpAwarded: achievement.xpReward,
        });

        // Award achievement XP (don't re-check achievements to avoid infinite loop)
        if (achievement.xpReward > 0) {
          const currentProfile = await ctx.db
            .query("gamification")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique();

          if (currentProfile) {
            const newTotalXP = currentProfile.totalXP + achievement.xpReward;
            const { level, currentLevelXP, xpToNextLevel } =
              calculateLevel(newTotalXP);

            await ctx.db.patch(currentProfile._id, {
              totalXP: newTotalXP,
              level,
              currentLevelXP,
              xpToNextLevel,
            });
          }
        }

        newlyEarned.push({
          code: achievement.code,
          name: achievement.name,
          xpAwarded: achievement.xpReward,
        });

        earnedCodes.add(achievement.code);
      }
    }

    return newlyEarned;
  },
});

export const useStreakFreeze = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile || profile.streakFreezes <= 0) {
      return { success: false, remainingFreezes: profile?.streakFreezes ?? 0 };
    }

    // Check cooldown
    if (profile.lastStreakFreezeUsedAt) {
      const daysSinceUse =
        (Date.now() - profile.lastStreakFreezeUsedAt) / (24 * 60 * 60 * 1000);
      if (daysSinceUse < STREAK_FREEZE_COOLDOWN_DAYS) {
        return { success: false, remainingFreezes: profile.streakFreezes };
      }
    }

    await ctx.db.patch(profile._id, {
      streakFreezes: profile.streakFreezes - 1,
      lastStreakFreezeUsedAt: Date.now(),
    });

    return { success: true, remainingFreezes: profile.streakFreezes - 1 };
  },
});

export const earnStreakFreezeAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const profiles = await ctx.db.query("gamification").collect();

    for (const profile of profiles) {
      if (profile.streakFreezes >= MAX_STREAK_FREEZES) continue;
      if (!profile.lastXPActionAt || profile.lastXPActionAt < sevenDaysAgo)
        continue;

      await ctx.db.patch(profile._id, {
        streakFreezes: MAX_STREAK_FREEZES,
        lastStreakFreezeEarnedAt: Date.now(),
      });
    }
  },
});

// ═══ INTERNAL QUERIES ═══

export const getUserAchievementsInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const earned = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return earned.map((a) => {
      const def = ACHIEVEMENTS.find((d) => d.code === a.code);
      return {
        code: a.code,
        name: def?.name ?? a.code,
        description: def?.description ?? "",
        category: def?.category ?? "principiante",
        icon: def?.icon ?? "Star",
        earnedAt: a.earnedAt,
        xpAwarded: a.xpAwarded,
      };
    });
  },
});

// ═══ PUBLIC QUERIES ═══

export const getGamificationProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const profile = await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      return {
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        xpToNextLevel: LEVEL_TABLE[0].xpRequired,
        progressPercent: 0,
        streakFreezes: 0,
        lastXPActionAt: null,
        bestStreak: 0,
        currentMultiplier: { multiplier: 1.0, label: "" },
      };
    }

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const bestStreak = habits.reduce(
      (max, h) => Math.max(max, h.currentStreak),
      0
    );

    const currentMultiplier = calculateStreakMultiplier(bestStreak);

    return {
      totalXP: profile.totalXP,
      level: profile.level,
      currentLevelXP: profile.currentLevelXP,
      xpToNextLevel: profile.xpToNextLevel,
      progressPercent:
        profile.xpToNextLevel > 0
          ? Math.round(
              (profile.currentLevelXP / profile.xpToNextLevel) * 100
            )
          : 100,
      streakFreezes: profile.streakFreezes,
      lastXPActionAt: profile.lastXPActionAt ?? null,
      bestStreak,
      currentMultiplier,
    };
  },
});

export const getUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const earned = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return earned.map((a) => {
      const def = ACHIEVEMENTS.find((d) => d.code === a.code);
      return {
        code: a.code,
        name: def?.name ?? a.code,
        description: def?.description ?? "",
        category: def?.category ?? "principiante",
        icon: def?.icon ?? "Star",
        earnedAt: a.earnedAt,
        xpAwarded: a.xpAwarded,
      };
    });
  },
});

// ═══ PUBLIC MUTATIONS ═══

export const useStreakFreezePublic = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const profile = await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile || profile.streakFreezes <= 0) {
      return { success: false, remainingFreezes: profile?.streakFreezes ?? 0 };
    }

    if (profile.lastStreakFreezeUsedAt) {
      const daysSinceUse =
        (Date.now() - profile.lastStreakFreezeUsedAt) / (24 * 60 * 60 * 1000);
      if (daysSinceUse < STREAK_FREEZE_COOLDOWN_DAYS) {
        return { success: false, remainingFreezes: profile.streakFreezes };
      }
    }

    await ctx.db.patch(profile._id, {
      streakFreezes: profile.streakFreezes - 1,
      lastStreakFreezeUsedAt: Date.now(),
    });

    return { success: true, remainingFreezes: profile.streakFreezes - 1 };
  },
});

export const getAvailableAchievements = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const earned = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const earnedMap = new Map(earned.map((a) => [a.code, a]));

    return ACHIEVEMENTS.map((def) => {
      const earnedAchievement = earnedMap.get(def.code);
      return {
        code: def.code,
        name: def.name,
        description: def.description,
        category: def.category,
        icon: def.icon,
        xpReward: def.xpReward,
        earned: !!earnedAchievement,
        earnedAt: earnedAchievement?.earnedAt,
        target: def.condition.target,
      };
    });
  },
});
