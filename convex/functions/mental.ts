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

export const logMoodEntry = internalMutation({
  args: {
    userId: v.id("users"),
    mood: v.object({
      mood: v.string(),
      intensity: v.number(),
      notes: v.optional(v.string()),
      triggers: v.optional(v.array(v.string())),
      emotions: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wellnessEntries", {
      userId: args.userId,
      type: "mood",
      data: args.mood,
      timestamp: Date.now(),
      source: "ai",
    });
  },
});

export const logMoodEntryPublic = mutation({
  args: {
    mood: v.object({
      mood: v.string(),
      intensity: v.number(),
      notes: v.optional(v.string()),
      triggers: v.optional(v.array(v.string())),
      emotions: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("wellnessEntries", {
      userId: user._id,
      type: "mood",
      data: args.mood,
      timestamp: Date.now(),
      source: "manual",
    });
  },
});

export const deleteMoodEntry = mutation({
  args: { entryId: v.id("wellnessEntries") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id || entry.type !== "mood") {
      throw new Error("Entry not found");
    }

    await ctx.db.delete(args.entryId);
  },
});

export const createJournalEntry = internalMutation({
  args: {
    userId: v.id("users"),
    journal: v.object({
      title: v.string(),
      content: v.string(),
      prompt: v.optional(v.string()),
      mood: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wellnessEntries", {
      userId: args.userId,
      type: "journal",
      data: args.journal,
      timestamp: Date.now(),
      source: "ai",
    });
  },
});

export const createJournalEntryPublic = mutation({
  args: {
    journal: v.object({
      title: v.string(),
      content: v.string(),
      prompt: v.optional(v.string()),
      mood: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("wellnessEntries", {
      userId: user._id,
      type: "journal",
      data: args.journal,
      timestamp: Date.now(),
      source: "manual",
    });
  },
});

export const deleteJournalEntry = mutation({
  args: { entryId: v.id("wellnessEntries") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id || entry.type !== "journal") {
      throw new Error("Entry not found");
    }

    await ctx.db.delete(args.entryId);
  },
});

export const logCrisisIncident = internalMutation({
  args: {
    userId: v.id("users"),
    triggerMessage: v.string(),
    detectedKeywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "crisis_incident",
      title: "Incidente de crisis detectado",
      body: `Keywords detectados: ${args.detectedKeywords.join(", ")}. Mensaje: ${args.triggerMessage.substring(0, 200)}`,
      read: false,
      createdAt: Date.now(),
    });
  },
});

// ═══ QUERIES ═══

export const getTodayMoodSummary = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "mood")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    if (entries.length === 0) {
      return {
        hasCheckedIn: false,
        latestMood: null,
        latestIntensity: null,
        averageIntensity: null,
        checkInCount: 0,
      };
    }

    const latest = entries[entries.length - 1];
    const latestData = latest.data as any;
    const totalIntensity = entries.reduce(
      (sum, e) => sum + ((e.data as any).intensity ?? 0),
      0
    );

    return {
      hasCheckedIn: true,
      latestMood: latestData.mood,
      latestIntensity: latestData.intensity,
      averageIntensity: Math.round((totalIntensity / entries.length) * 10) / 10,
      checkInCount: entries.length,
    };
  },
});

export const getTodayMoodSummaryPublic = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "mood")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .collect();

    if (entries.length === 0) {
      return {
        hasCheckedIn: false,
        latestMood: null,
        latestIntensity: null,
        averageIntensity: null,
        checkInCount: 0,
      };
    }

    const latest = entries[entries.length - 1];
    const latestData = latest.data as any;
    const totalIntensity = entries.reduce(
      (sum, e) => sum + ((e.data as any).intensity ?? 0),
      0
    );

    return {
      hasCheckedIn: true,
      latestMood: latestData.mood,
      latestIntensity: latestData.intensity,
      averageIntensity: Math.round((totalIntensity / entries.length) * 10) / 10,
      checkInCount: entries.length,
    };
  },
});

export const getMoodHistoryInternal = internalQuery({
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
        q.eq("userId", args.userId).eq("type", "mood")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    const dailyMap = new Map<
      number,
      { totalIntensity: number; count: number; moods: string[] }
    >();

    for (const entry of entries) {
      const dayKey = startOfDay(new Date(entry.timestamp)).getTime();
      const data = entry.data as any;
      const existing = dailyMap.get(dayKey) ?? {
        totalIntensity: 0,
        count: 0,
        moods: [],
      };
      existing.totalIntensity += data.intensity ?? 0;
      existing.count += 1;
      if (data.mood) existing.moods.push(data.mood);
      dailyMap.set(dayKey, existing);
    }

    const result = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const day = startOfDay(
        new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      ).getTime();
      const data = dailyMap.get(day);
      const dominantMood = data
        ? getMostFrequent(data.moods)
        : null;
      result.push({
        date: day,
        averageIntensity: data
          ? Math.round((data.totalIntensity / data.count) * 10) / 10
          : 0,
        checkInCount: data?.count ?? 0,
        dominantMood,
      });
    }

    return result;
  },
});

export const getMoodHistory = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const numDays = args.days ?? 7;
    const startTime = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "mood")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    const dailyMap = new Map<
      number,
      { totalIntensity: number; count: number; moods: string[] }
    >();

    for (const entry of entries) {
      const dayKey = startOfDay(new Date(entry.timestamp)).getTime();
      const data = entry.data as any;
      const existing = dailyMap.get(dayKey) ?? {
        totalIntensity: 0,
        count: 0,
        moods: [],
      };
      existing.totalIntensity += data.intensity ?? 0;
      existing.count += 1;
      if (data.mood) existing.moods.push(data.mood);
      dailyMap.set(dayKey, existing);
    }

    const result = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const day = startOfDay(
        new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      ).getTime();
      const data = dailyMap.get(day);
      const dominantMood = data
        ? getMostFrequent(data.moods)
        : null;
      result.push({
        date: day,
        averageIntensity: data
          ? Math.round((data.totalIntensity / data.count) * 10) / 10
          : 0,
        checkInCount: data?.count ?? 0,
        dominantMood,
      });
    }

    return result;
  },
});

export const getJournalEntries = query({
  args: {
    limit: v.optional(v.number()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "journal")
      )
      .order("desc")
      .collect();

    let filtered = entries;

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      filtered = entries.filter((e) => {
        const data = e.data as any;
        return (
          data.title?.toLowerCase().includes(term) ||
          data.content?.toLowerCase().includes(term) ||
          data.tags?.some((t: string) => t.toLowerCase().includes(term))
        );
      });
    }

    const limit = args.limit ?? 50;
    return filtered.slice(0, limit).map((e) => ({
      _id: e._id,
      data: e.data,
      timestamp: e.timestamp,
      source: e.source,
    }));
  },
});

export const getJournalEntriesInternal = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "journal")
      )
      .order("desc")
      .take(args.limit ?? 10);

    return entries.map((e) => ({
      _id: e._id,
      data: e.data,
      timestamp: e.timestamp,
    }));
  },
});

export const getJournalEntry = query({
  args: { entryId: v.id("wellnessEntries") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id || entry.type !== "journal") {
      return null;
    }

    return {
      _id: entry._id,
      data: entry.data,
      timestamp: entry.timestamp,
      source: entry.source,
    };
  },
});

export const getRecentMoodCheckins = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const todayStart = startOfDay(new Date()).getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "mood")
      )
      .filter((q) => q.gte(q.field("timestamp"), todayStart))
      .order("desc")
      .collect();

    return entries.map((e) => ({
      _id: e._id,
      data: e.data,
      timestamp: e.timestamp,
    }));
  },
});

// ═══ HELPERS ═══

function getMostFrequent(arr: string[]): string | null {
  if (arr.length === 0) return null;
  const freq = new Map<string, number>();
  for (const item of arr) {
    freq.set(item, (freq.get(item) ?? 0) + 1);
  }
  let maxCount = 0;
  let maxItem = arr[0];
  for (const [item, count] of freq) {
    if (count > maxCount) {
      maxCount = count;
      maxItem = item;
    }
  }
  return maxItem;
}
