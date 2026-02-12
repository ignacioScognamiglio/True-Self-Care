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

export const logWaterEntry = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const entryId = await ctx.db.insert("wellnessEntries", {
      userId: args.userId,
      type: "water",
      data: { amount: args.amount },
      timestamp: Date.now(),
      source: "ai",
    });

    await ctx.scheduler.runAfter(0, internal.functions.gamification.awardXP, {
      userId: args.userId,
      action: "water",
    });

    await ctx.scheduler.runAfter(0, internal.functions.challenges.updateChallengeProgress, {
      userId: args.userId,
      metric: "water_count",
      incrementBy: 1,
    });

    return entryId;
  },
});

export const logWaterEntryPublic = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("wellnessEntries", {
      userId: user._id,
      type: "water",
      data: { amount: args.amount },
      timestamp: Date.now(),
      source: "manual",
    });
  },
});

export const deleteWaterEntry = mutation({
  args: { entryId: v.id("wellnessEntries") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id || entry.type !== "water") {
      throw new Error("Entry not found");
    }

    await ctx.db.delete(args.entryId);
  },
});

// ═══ QUERIES ═══

export const getTodayWaterIntake = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "water")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    const totalMl = entries.reduce(
      (sum, entry) => sum + (entry.data?.amount ?? 0),
      0
    );

    return { totalMl, entries: entries.length };
  },
});

export const getTodayWaterIntakePublic = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "water")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    const totalMl = entries.reduce(
      (sum, entry) => sum + (entry.data?.amount ?? 0),
      0
    );

    return { totalMl, entries: entries.length };
  },
});

export const getWaterHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "water")
      )
      .filter((q) => q.gte(q.field("timestamp"), sevenDaysAgo))
      .collect();

    // Group by day
    const dailyMap = new Map<number, number>();
    for (const entry of entries) {
      const dayKey = startOfDay(new Date(entry.timestamp)).getTime();
      dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + (entry.data?.amount ?? 0));
    }

    // Build array for last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(
        new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      ).getTime();
      result.push({ date: day, totalMl: dailyMap.get(day) ?? 0 });
    }

    return result;
  },
});

export const getTodayWaterEntries = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];
    const todayStart = startOfDay(new Date()).getTime();

    return await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "water")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .order("desc")
      .collect();
  },
});

export const getWellnessEntriesByType = query({
  args: {
    type: v.union(
      v.literal("mood"),
      v.literal("exercise"),
      v.literal("nutrition"),
      v.literal("sleep"),
      v.literal("water"),
      v.literal("weight"),
      v.literal("habit")
    ),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    return await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", args.type)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startDate),
          q.lte(q.field("timestamp"), args.endDate)
        )
      )
      .collect();
  },
});
