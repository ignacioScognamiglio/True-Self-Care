import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { startOfDay } from "date-fns";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ MUTATIONS ═══

export const logExerciseEntry = internalMutation({
  args: {
    userId: v.id("users"),
    exercise: v.object({
      name: v.string(),
      type: v.string(),
      sets: v.optional(v.number()),
      reps: v.optional(v.number()),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()),
      distance: v.optional(v.number()),
      caloriesBurned: v.optional(v.number()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wellnessEntries", {
      userId: args.userId,
      type: "exercise",
      data: args.exercise,
      timestamp: Date.now(),
      source: "ai",
    });
  },
});

export const logExerciseEntryPublic = mutation({
  args: {
    exercise: v.object({
      name: v.string(),
      type: v.string(),
      sets: v.optional(v.number()),
      reps: v.optional(v.number()),
      weight: v.optional(v.number()),
      duration: v.optional(v.number()),
      distance: v.optional(v.number()),
      caloriesBurned: v.optional(v.number()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("wellnessEntries", {
      userId: user._id,
      type: "exercise",
      data: args.exercise,
      timestamp: Date.now(),
      source: "manual",
    });
  },
});

export const deleteExerciseEntry = mutation({
  args: { entryId: v.id("wellnessEntries") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id || entry.type !== "exercise") {
      throw new Error("Entry not found");
    }

    await ctx.db.delete(args.entryId);
  },
});

// ═══ QUERIES ═══

export const getTodayExerciseSummary = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "exercise")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    let totalCaloriesBurned = 0;
    let totalDuration = 0;
    let totalVolume = 0;
    const exercises: Array<{
      name: string;
      type: string;
      sets?: number;
      reps?: number;
      weight?: number;
      timestamp: number;
    }> = [];

    for (const entry of entries) {
      const data = entry.data as any;
      totalCaloriesBurned += data.caloriesBurned ?? 0;
      totalDuration += data.duration ?? 0;
      if (data.sets && data.reps && data.weight) {
        totalVolume += data.sets * data.reps * data.weight;
      }
      exercises.push({
        name: data.name,
        type: data.type,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        timestamp: entry.timestamp,
      });
    }

    return {
      totalCaloriesBurned,
      exerciseCount: entries.length,
      totalDuration,
      totalVolume,
      exercises,
    };
  },
});

export const getTodayExerciseSummaryPublic = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "exercise")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    let totalCaloriesBurned = 0;
    let totalDuration = 0;
    let totalVolume = 0;
    const exercises: Array<{
      name: string;
      type: string;
      sets?: number;
      reps?: number;
      weight?: number;
      timestamp: number;
    }> = [];

    for (const entry of entries) {
      const data = entry.data as any;
      totalCaloriesBurned += data.caloriesBurned ?? 0;
      totalDuration += data.duration ?? 0;
      if (data.sets && data.reps && data.weight) {
        totalVolume += data.sets * data.reps * data.weight;
      }
      exercises.push({
        name: data.name,
        type: data.type,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        timestamp: entry.timestamp,
      });
    }

    return {
      totalCaloriesBurned,
      exerciseCount: entries.length,
      totalDuration,
      totalVolume,
      exercises,
    };
  },
});

export const getExerciseHistoryInternal = internalQuery({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const numDays = args.days ?? 7;
    const startTime = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "exercise")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    const dailyMap = new Map<
      number,
      { caloriesBurned: number; exerciseCount: number; volume: number; duration: number }
    >();

    for (const entry of entries) {
      const dayKey = startOfDay(new Date(entry.timestamp)).getTime();
      const existing = dailyMap.get(dayKey) ?? {
        caloriesBurned: 0,
        exerciseCount: 0,
        volume: 0,
        duration: 0,
      };
      const data = entry.data as any;
      existing.caloriesBurned += data.caloriesBurned ?? 0;
      existing.duration += data.duration ?? 0;
      if (data.sets && data.reps && data.weight) {
        existing.volume += data.sets * data.reps * data.weight;
      }
      existing.exerciseCount += 1;
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
        totalCaloriesBurned: data?.caloriesBurned ?? 0,
        exerciseCount: data?.exerciseCount ?? 0,
        totalVolume: data?.volume ?? 0,
        totalDuration: data?.duration ?? 0,
      });
    }

    return result;
  },
});

export const getExerciseHistory = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const numDays = args.days ?? 7;
    const startTime = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "exercise")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    const dailyMap = new Map<
      number,
      { caloriesBurned: number; exerciseCount: number; volume: number; duration: number }
    >();

    for (const entry of entries) {
      const dayKey = startOfDay(new Date(entry.timestamp)).getTime();
      const existing = dailyMap.get(dayKey) ?? {
        caloriesBurned: 0,
        exerciseCount: 0,
        volume: 0,
        duration: 0,
      };
      const data = entry.data as any;
      existing.caloriesBurned += data.caloriesBurned ?? 0;
      existing.duration += data.duration ?? 0;
      if (data.sets && data.reps && data.weight) {
        existing.volume += data.sets * data.reps * data.weight;
      }
      existing.exerciseCount += 1;
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
        totalCaloriesBurned: data?.caloriesBurned ?? 0,
        exerciseCount: data?.exerciseCount ?? 0,
        totalVolume: data?.volume ?? 0,
        totalDuration: data?.duration ?? 0,
      });
    }

    return result;
  },
});

export const getPersonalRecords = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "exercise")
      )
      .collect();

    const prMap = new Map<
      string,
      { bestWeight: number; bestReps: number; bestVolume: number; date: number }
    >();

    for (const entry of entries) {
      const data = entry.data as any;
      if (data.type !== "strength" || !data.weight) continue;

      const name = data.name as string;
      const existing = prMap.get(name);
      const volume = (data.sets ?? 1) * (data.reps ?? 1) * data.weight;

      if (!existing) {
        prMap.set(name, {
          bestWeight: data.weight,
          bestReps: data.reps ?? 0,
          bestVolume: volume,
          date: entry.timestamp,
        });
      } else {
        if (data.weight > existing.bestWeight) {
          existing.bestWeight = data.weight;
          existing.date = entry.timestamp;
        }
        if ((data.reps ?? 0) > existing.bestReps) {
          existing.bestReps = data.reps;
        }
        if (volume > existing.bestVolume) {
          existing.bestVolume = volume;
        }
      }
    }

    return Array.from(prMap.entries()).map(([exerciseName, pr]) => ({
      exerciseName,
      ...pr,
    }));
  },
});
