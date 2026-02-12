import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { startOfDay } from "date-fns";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ QUERIES ═══

export const getProgressPhotos = query({
  args: {
    type: v.optional(
      v.union(v.literal("body"), v.literal("food"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const maxResults = args.limit ?? 50;
    let photos;

    if (args.type) {
      photos = await ctx.db
        .query("progressPhotos")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", args.type!)
        )
        .order("desc")
        .take(maxResults);
    } else {
      photos = await ctx.db
        .query("progressPhotos")
        .withIndex("by_user_time", (q) => q.eq("userId", user._id))
        .order("desc")
        .take(maxResults);
    }

    return Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        url: await ctx.storage.getUrl(photo.storageId),
      }))
    );
  },
});

export const getPhotoComparison = query({
  args: {
    type: v.union(v.literal("body"), v.literal("food")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const photos = await ctx.db
      .query("progressPhotos")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", args.type)
      )
      .order("asc")
      .collect();

    if (photos.length < 2) return null;

    const oldest = photos[0];
    const newest = photos[photos.length - 1];

    const [oldUrl, newUrl] = await Promise.all([
      ctx.storage.getUrl(oldest.storageId),
      ctx.storage.getUrl(newest.storageId),
    ]);

    return {
      before: { ...oldest, url: oldUrl },
      after: { ...newest, url: newUrl },
      daysDiff: Math.round(
        (newest.timestamp - oldest.timestamp) / (1000 * 60 * 60 * 24)
      ),
    };
  },
});

// ═══ ANALYTICS QUERIES ═══

export const getWeightHistory = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const since = Date.now() - (args.days ?? 90) * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "weight")
      )
      .filter((q) => q.gte(q.field("timestamp"), since))
      .order("asc")
      .collect();

    return entries.map((e) => ({
      date: e.timestamp,
      weight: (e.data as any)?.weight ?? (e.data as any)?.value ?? 0,
    }));
  },
});

export const getStreakHistory = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return habits.map((h) => ({
      name: h.name,
      category: h.category,
      currentStreak: h.currentStreak,
      longestStreak: h.longestStreak,
    }));
  },
});

export const getWellnessScore = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const numDays = args.days ?? 7;
    const since = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", user._id).gte("timestamp", since)
      )
      .collect();

    if (entries.length === 0) return null;

    // Habit completion rate
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const habitEntries = entries.filter((e) => e.type === "habit");
    const habitRate =
      habits.length > 0
        ? Math.min(habitEntries.length / (habits.length * numDays), 1)
        : 0;

    // Sleep quality avg (0-100)
    const sleepEntries = entries.filter((e) => e.type === "sleep");
    const sleepAvg =
      sleepEntries.length > 0
        ? sleepEntries.reduce(
            (sum, e) => sum + ((e.data as any)?.qualityScore ?? 50),
            0
          ) / sleepEntries.length / 100
        : 0;

    // Nutrition adherence (did they log meals?)
    const nutritionDays = new Set(
      entries
        .filter((e) => e.type === "nutrition")
        .map((e) => startOfDay(new Date(e.timestamp)).getTime())
    ).size;
    const nutritionRate = Math.min(nutritionDays / numDays, 1);

    // Fitness consistency
    const fitnessDays = new Set(
      entries
        .filter((e) => e.type === "exercise")
        .map((e) => startOfDay(new Date(e.timestamp)).getTime())
    ).size;
    const fitnessRate = Math.min(fitnessDays / numDays, 1);

    // Mood average (1-5 -> 0-1)
    const moodEntries = entries.filter((e) => e.type === "mood");
    const moodAvg =
      moodEntries.length > 0
        ? moodEntries.reduce(
            (sum, e) => sum + ((e.data as any)?.intensity ?? 3),
            0
          ) /
          moodEntries.length /
          5
        : 0;

    const score = Math.round(
      (habitRate * 0.25 +
        sleepAvg * 0.2 +
        nutritionRate * 0.2 +
        fitnessRate * 0.2 +
        moodAvg * 0.15) *
        100
    );

    return {
      score,
      breakdown: {
        habits: Math.round(habitRate * 100),
        sleep: Math.round(sleepAvg * 100),
        nutrition: Math.round(nutritionRate * 100),
        fitness: Math.round(fitnessRate * 100),
        mood: Math.round(moodAvg * 100),
      },
    };
  },
});

export const getModuleTrends = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const numDays = args.days ?? 30;
    const since = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", user._id).gte("timestamp", since)
      )
      .collect();

    const modules = ["sleep", "nutrition", "exercise", "mood", "water", "habit"] as const;

    return modules.map((mod) => {
      const modEntries = entries.filter((e) => e.type === mod);
      const byDay = new Map<number, number>();
      for (const e of modEntries) {
        const dayKey = startOfDay(new Date(e.timestamp)).getTime();
        byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + 1);
      }

      const days = Array.from(byDay.entries())
        .sort(([a], [b]) => a - b)
        .map(([date, count]) => ({ date, count }));

      return {
        module: mod,
        totalEntries: modEntries.length,
        activeDays: byDay.size,
        days,
      };
    });
  },
});

// ═══ MUTATIONS ═══

export const uploadProgressPhoto = mutation({
  args: {
    storageId: v.string(),
    type: v.literal("body"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("progressPhotos", {
      userId: user._id,
      type: args.type,
      storageId: args.storageId,
      timestamp: Date.now(),
    });
  },
});

export const deleteProgressPhoto = mutation({
  args: { photoId: v.id("progressPhotos") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const photo = await ctx.db.get(args.photoId);

    if (!photo || photo.userId !== user._id) {
      throw new Error("Photo not found");
    }

    try {
      await ctx.storage.delete(photo.storageId);
    } catch {
      // Storage file may already be deleted
    }

    await ctx.db.delete(args.photoId);
  },
});
