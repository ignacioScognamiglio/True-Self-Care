import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { startOfDay, isToday, isYesterday } from "date-fns";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ SHARED VALIDATORS ═══

const frequencyValidator = v.union(
  v.literal("daily"),
  v.literal("weekly"),
  v.literal("custom")
);

// ═══ HELPERS ═══

function buildNewHabitData(userId: Id<"users">, args: {
  name: string;
  category: string;
  frequency: "daily" | "weekly" | "custom";
  targetPerPeriod: number;
}) {
  return {
    userId,
    name: args.name,
    category: args.category,
    frequency: args.frequency,
    targetPerPeriod: args.targetPerPeriod,
    currentStreak: 0,
    longestStreak: 0,
    isActive: true as const,
    createdAt: Date.now(),
  };
}

async function getOwnedHabit(ctx: any, habitId: Id<"habits">, userId: Id<"users">) {
  const habit = await ctx.db.get(habitId);
  if (!habit || habit.userId !== userId) {
    throw new Error("Habit not found");
  }
  return habit;
}

// ═══ MUTATIONS ═══

export const createHabit = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    frequency: frequencyValidator,
    targetPerPeriod: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db.insert("habits", buildNewHabitData(user._id, args));
  },
});

export const internalCreateHabit = internalMutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    category: v.string(),
    frequency: frequencyValidator,
    targetPerPeriod: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("habits", buildNewHabitData(args.userId, args));
  },
});

export const completeHabit = internalMutation({
  args: {
    userId: v.id("users"),
    habitName: v.string(),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), args.habitName),
          q.eq(q.field("isActive"), true)
        )
      )
      .unique();

    if (!habit) throw new Error(`Habit "${args.habitName}" not found`);

    const lastCompletion = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "habit")
      )
      .filter((q) => q.eq(q.field("data.habitId"), habit._id))
      .order("desc")
      .first();

    let newStreak = 1;
    if (lastCompletion) {
      const lastDate = new Date(lastCompletion.timestamp);
      if (isToday(lastDate)) {
        newStreak = habit.currentStreak;
      } else if (isYesterday(lastDate)) {
        newStreak = habit.currentStreak + 1;
      }
    }

    const newLongest = Math.max(newStreak, habit.longestStreak);

    await ctx.db.insert("wellnessEntries", {
      userId: args.userId,
      type: "habit",
      data: { habitId: habit._id, habitName: args.habitName },
      timestamp: Date.now(),
      source: "ai",
    });

    await ctx.db.patch(habit._id, {
      currentStreak: newStreak,
      longestStreak: newLongest,
    });

    return { habitId: habit._id, currentStreak: newStreak, longestStreak: newLongest };
  },
});

export const deleteHabit = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await getOwnedHabit(ctx, args.habitId, user._id);
    await ctx.db.patch(args.habitId, { isActive: false });
  },
});

export const updateHabit = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    frequency: v.optional(frequencyValidator),
    targetPerPeriod: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await getOwnedHabit(ctx, args.habitId, user._id);

    const { habitId: _, ...fields } = args;
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(args.habitId, updates);
  },
});

// ═══ QUERIES ═══

export const getUserHabits = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getUserHabitsPublic = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    return await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const completeHabitPublic = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const habit = await getOwnedHabit(ctx, args.habitId, user._id);

    const todayStart = startOfDay(new Date()).getTime();

    const alreadyDone = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "habit")
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("data.habitId"), args.habitId),
          q.gte(q.field("timestamp"), todayStart)
        )
      )
      .first();

    if (alreadyDone) {
      return { habitId: args.habitId, currentStreak: habit.currentStreak, longestStreak: habit.longestStreak, alreadyCompleted: true };
    }

    const lastCompletion = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "habit")
      )
      .filter((q) => q.eq(q.field("data.habitId"), args.habitId))
      .order("desc")
      .first();

    let newStreak = 1;
    if (lastCompletion) {
      const lastDate = new Date(lastCompletion.timestamp);
      if (isYesterday(lastDate)) {
        newStreak = habit.currentStreak + 1;
      }
    }

    const newLongest = Math.max(newStreak, habit.longestStreak);

    await ctx.db.insert("wellnessEntries", {
      userId: user._id,
      type: "habit",
      data: { habitId: args.habitId, habitName: habit.name },
      timestamp: Date.now(),
      source: "manual",
    });

    await ctx.db.patch(args.habitId, {
      currentStreak: newStreak,
      longestStreak: newLongest,
    });

    return { habitId: args.habitId, currentStreak: newStreak, longestStreak: newLongest, alreadyCompleted: false };
  },
});

export const getTodayCompletedHabitIds = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];
    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "habit")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    return entries.map((e: any) => e.data.habitId as string);
  },
});

export const getTodayCompletionsSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return { total: 0, completedToday: 0, bestCurrentStreak: 0 };

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const todayStart = startOfDay(new Date()).getTime();

    const todayEntries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "habit")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    const completedIds = new Set(todayEntries.map((e: any) => e.data.habitId as string));
    const completedToday = habits.filter((h) => completedIds.has(h._id)).length;
    const bestCurrentStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

    return {
      total: habits.length,
      completedToday,
      bestCurrentStreak,
    };
  },
});

export const getHabitCompletions = query({
  args: {
    habitId: v.id("habits"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "habit")
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("data.habitId"), args.habitId),
          q.gte(q.field("timestamp"), args.startDate),
          q.lte(q.field("timestamp"), args.endDate)
        )
      )
      .collect();
  },
});

export const getHabitStats = query({
  args: { habitId: v.id("habits") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const habit = await getOwnedHabit(ctx, args.habitId, user._id);

    const completions = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "habit")
      )
      .filter((q) => q.eq(q.field("data.habitId"), args.habitId))
      .collect();

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentCompletions = completions.filter(
      (c) => c.timestamp >= thirtyDaysAgo
    );

    const uniqueDays = new Set(
      recentCompletions.map((c) => startOfDay(new Date(c.timestamp)).getTime())
    );

    return {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: completions.length,
      completionRate30d: Math.round((uniqueDays.size / 30) * 100),
    };
  },
});
