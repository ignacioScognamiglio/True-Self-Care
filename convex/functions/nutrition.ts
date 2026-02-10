import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { startOfDay } from "date-fns";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ MUTATIONS ═══

export const logMealEntry = internalMutation({
  args: {
    userId: v.id("users"),
    meal: v.object({
      name: v.string(),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      mealType: v.string(),
      description: v.optional(v.string()),
      items: v.optional(v.array(v.string())),
      photoId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const entryId = await ctx.db.insert("wellnessEntries", {
      userId: args.userId,
      type: "nutrition",
      data: args.meal,
      timestamp: Date.now(),
      source: "ai",
    });

    await ctx.scheduler.runAfter(0, internal.functions.gamification.awardXP, {
      userId: args.userId,
      action: "meal",
    });

    return entryId;
  },
});

export const logMealEntryPublic = mutation({
  args: {
    meal: v.object({
      name: v.string(),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      mealType: v.string(),
      description: v.optional(v.string()),
      items: v.optional(v.array(v.string())),
      photoId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("wellnessEntries", {
      userId: user._id,
      type: "nutrition",
      data: args.meal,
      timestamp: Date.now(),
      source: "manual",
    });
  },
});

export const deleteMealEntry = mutation({
  args: { entryId: v.id("wellnessEntries") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id || entry.type !== "nutrition") {
      throw new Error("Entry not found");
    }

    await ctx.db.delete(args.entryId);
  },
});

// ═══ QUERIES ═══

export const getTodayNutritionSummary = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "nutrition")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const meals: Array<{
      name: string;
      calories: number;
      mealType: string;
      timestamp: number;
    }> = [];

    for (const entry of entries) {
      const data = entry.data as any;
      totalCalories += data.calories ?? 0;
      totalProtein += data.protein ?? 0;
      totalCarbs += data.carbs ?? 0;
      totalFat += data.fat ?? 0;
      meals.push({
        name: data.name,
        calories: data.calories,
        mealType: data.mealType,
        timestamp: entry.timestamp,
      });
    }

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      mealCount: entries.length,
      meals,
    };
  },
});

export const getTodayNutritionSummaryPublic = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "nutrition")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const meals: Array<{
      name: string;
      calories: number;
      mealType: string;
      timestamp: number;
    }> = [];

    for (const entry of entries) {
      const data = entry.data as any;
      totalCalories += data.calories ?? 0;
      totalProtein += data.protein ?? 0;
      totalCarbs += data.carbs ?? 0;
      totalFat += data.fat ?? 0;
      meals.push({
        name: data.name,
        calories: data.calories,
        mealType: data.mealType,
        timestamp: entry.timestamp,
      });
    }

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      mealCount: entries.length,
      meals,
    };
  },
});

export const getNutritionHistory = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const numDays = args.days ?? 7;
    const startTime = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "nutrition")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    const dailyMap = new Map<
      number,
      { calories: number; protein: number; carbs: number; fat: number; mealCount: number }
    >();

    for (const entry of entries) {
      const dayKey = startOfDay(new Date(entry.timestamp)).getTime();
      const existing = dailyMap.get(dayKey) ?? {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        mealCount: 0,
      };
      const data = entry.data as any;
      existing.calories += data.calories ?? 0;
      existing.protein += data.protein ?? 0;
      existing.carbs += data.carbs ?? 0;
      existing.fat += data.fat ?? 0;
      existing.mealCount += 1;
      dailyMap.set(dayKey, existing);
    }

    const result = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const day = startOfDay(
        new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      ).getTime();
      const data = dailyMap.get(day);
      result.push({
        date: day,
        totalCalories: data?.calories ?? 0,
        totalProtein: data?.protein ?? 0,
        totalCarbs: data?.carbs ?? 0,
        totalFat: data?.fat ?? 0,
        mealCount: data?.mealCount ?? 0,
      });
    }

    return result;
  },
});

export const getMealsByDate = query({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const dayStart = startOfDay(new Date(args.date)).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "nutrition")
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), dayStart),
          q.lt(q.field("timestamp"), dayEnd)
        )
      )
      .order("desc")
      .collect();
  },
});
