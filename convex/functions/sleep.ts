import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { startOfDay } from "date-fns";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ CONSTANTS ═══

export const SLEEP_FACTORS = [
  "estres", "cafeina", "alcohol", "pantallas", "ejercicio_tarde",
  "comida_pesada", "ruido", "temperatura", "dolor", "medicacion",
  "meditacion", "lectura", "musica_relajante",
] as const;

// ═══ HELPERS ═══

export function calculateDurationMinutes(bedTime: string, wakeTime: string): number {
  const [bedH, bedM] = bedTime.split(":").map(Number);
  const [wakeH, wakeM] = wakeTime.split(":").map(Number);

  let bedMinutes = bedH * 60 + bedM;
  let wakeMinutes = wakeH * 60 + wakeM;

  // If wake time is earlier than bed time, sleep crossed midnight
  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  return wakeMinutes - bedMinutes;
}

export function calculateQualityScore(sleep: {
  durationMinutes: number;
  quality: number;
  interruptions?: number;
}): number {
  let score = 0;
  const hours = sleep.durationMinutes / 60;

  // Duration (40 points): 7-9h = max
  if (hours >= 7 && hours <= 9) score += 40;
  else if (hours >= 6 && hours < 7) score += 30;
  else if (hours > 9 && hours <= 10) score += 30;
  else if (hours >= 5 && hours < 6) score += 15;
  else score += 5;

  // Subjective quality (30 points): quality * 6
  score += sleep.quality * 6;

  // Interruptions (20 points): 0=20, 1=15, 2=10, 3=5, 4+=5
  const interruptionPenalty = Math.min(sleep.interruptions ?? 0, 4);
  score += Math.max(5, 20 - interruptionPenalty * 5);

  // Consistency (10 points): default 10, adjusted when user preferences available
  score += 10;

  return Math.min(100, Math.max(0, score));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function calculateAverageTime(times: string[]): string {
  if (times.length === 0) return "00:00";
  let totalMinutes = 0;
  for (const time of times) {
    const [h, m] = time.split(":").map(Number);
    let mins = h * 60 + m;
    if (h < 6) mins += 24 * 60;
    totalMinutes += mins;
  }
  let avgMinutes = Math.round(totalMinutes / times.length);
  avgMinutes = avgMinutes % (24 * 60);
  const avgH = Math.floor(avgMinutes / 60);
  const avgM = avgMinutes % 60;
  return `${String(avgH).padStart(2, "0")}:${String(avgM).padStart(2, "0")}`;
}

// ═══ MUTATIONS ═══

export const logSleepEntry = internalMutation({
  args: {
    userId: v.id("users"),
    sleep: v.object({
      bedTime: v.string(),
      wakeTime: v.string(),
      quality: v.number(),
      interruptions: v.optional(v.number()),
      factors: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      dreamNotes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const durationMinutes = calculateDurationMinutes(
      args.sleep.bedTime,
      args.sleep.wakeTime
    );
    const qualityScore = calculateQualityScore({
      durationMinutes,
      quality: args.sleep.quality,
      interruptions: args.sleep.interruptions,
    });

    const entryId = await ctx.db.insert("wellnessEntries", {
      userId: args.userId,
      type: "sleep",
      data: {
        ...args.sleep,
        durationMinutes,
        qualityScore,
      },
      timestamp: Date.now(),
      source: "ai",
    });

    await ctx.scheduler.runAfter(0, internal.functions.gamification.awardXP, {
      userId: args.userId,
      action: "sleep",
    });

    await ctx.scheduler.runAfter(0, internal.functions.challenges.updateChallengeProgress, {
      userId: args.userId,
      metric: "sleep_logs",
      incrementBy: 1,
    });

    return entryId;
  },
});

export const logSleepEntryPublic = mutation({
  args: {
    sleep: v.object({
      bedTime: v.string(),
      wakeTime: v.string(),
      quality: v.number(),
      interruptions: v.optional(v.number()),
      factors: v.optional(v.array(v.string())),
      notes: v.optional(v.string()),
      dreamNotes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const durationMinutes = calculateDurationMinutes(
      args.sleep.bedTime,
      args.sleep.wakeTime
    );
    const qualityScore = calculateQualityScore({
      durationMinutes,
      quality: args.sleep.quality,
      interruptions: args.sleep.interruptions,
    });

    return await ctx.db.insert("wellnessEntries", {
      userId: user._id,
      type: "sleep",
      data: {
        ...args.sleep,
        durationMinutes,
        qualityScore,
      },
      timestamp: Date.now(),
      source: "manual",
    });
  },
});

export const deleteSleepEntry = mutation({
  args: { entryId: v.id("wellnessEntries") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const entry = await ctx.db.get(args.entryId);

    if (!entry || entry.userId !== user._id || entry.type !== "sleep") {
      throw new Error("Entry not found");
    }

    await ctx.db.delete(args.entryId);
  },
});

// ═══ QUERIES ═══

export const getTodaySleepSummary = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Sleep logged "today" = the most recent night (yesterday evening -> this morning)
    const todayStart = startOfDay(new Date()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "sleep")
      )
      .filter((q) => q.gte(q.field("timestamp"), yesterdayStart))
      .collect();

    // Get the most recent entry (last night's sleep)
    const latest = entries.length > 0 ? entries[entries.length - 1] : null;

    if (!latest) {
      return {
        hasLoggedSleep: false,
        bedTime: null,
        wakeTime: null,
        durationMinutes: null,
        durationFormatted: null,
        quality: null,
        qualityScore: null,
        interruptions: null,
      };
    }

    const data = latest.data as any;
    return {
      hasLoggedSleep: true,
      bedTime: data.bedTime,
      wakeTime: data.wakeTime,
      durationMinutes: data.durationMinutes,
      durationFormatted: formatDuration(data.durationMinutes),
      quality: data.quality,
      qualityScore: data.qualityScore,
      interruptions: data.interruptions ?? 0,
    };
  },
});

export const getTodaySleepSummaryPublic = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const todayStart = startOfDay(new Date()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "sleep")
      )
      .filter((q) => q.gte(q.field("timestamp"), yesterdayStart))
      .collect();

    const latest = entries.length > 0 ? entries[entries.length - 1] : null;

    if (!latest) {
      return {
        hasLoggedSleep: false,
        bedTime: null,
        wakeTime: null,
        durationMinutes: null,
        durationFormatted: null,
        quality: null,
        qualityScore: null,
        interruptions: null,
      };
    }

    const data = latest.data as any;
    return {
      hasLoggedSleep: true,
      bedTime: data.bedTime,
      wakeTime: data.wakeTime,
      durationMinutes: data.durationMinutes,
      durationFormatted: formatDuration(data.durationMinutes),
      quality: data.quality,
      qualityScore: data.qualityScore,
      interruptions: data.interruptions ?? 0,
    };
  },
});

export const getSleepHistoryInternal = internalQuery({
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
        q.eq("userId", args.userId).eq("type", "sleep")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    return entries.map((e) => {
      const data = e.data as any;
      return {
        date: e.timestamp,
        bedTime: data.bedTime,
        wakeTime: data.wakeTime,
        durationMinutes: data.durationMinutes,
        quality: data.quality,
        qualityScore: data.qualityScore,
        interruptions: data.interruptions ?? 0,
      };
    });
  },
});

export const getSleepHistory = query({
  args: {
    days: v.optional(v.number()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user)
      return { page: [], isDone: true, continueCursor: "" };

    const numDays = args.days ?? 7;
    const startTime = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const result = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "sleep")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((e) => {
        const data = e.data as any;
        return {
          _id: e._id,
          date: e.timestamp,
          bedTime: data.bedTime,
          wakeTime: data.wakeTime,
          durationMinutes: data.durationMinutes,
          quality: data.quality,
          qualityScore: data.qualityScore,
          interruptions: data.interruptions ?? 0,
          factors: data.factors ?? [],
          source: e.source,
        };
      }),
    };
  },
});

export const getSleepStatsInternal = internalQuery({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const numDays = args.days ?? 30;
    const startTime = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "sleep")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    if (entries.length === 0) {
      return {
        averageDuration: 0,
        averageQualityScore: 0,
        averageBedTime: "00:00",
        averageWakeTime: "00:00",
        bestNight: null,
        worstNight: null,
        totalNightsLogged: 0,
        consistencyScore: 0,
        commonFactors: [],
      };
    }

    let totalDuration = 0;
    let totalScore = 0;
    const bedTimes: string[] = [];
    const wakeTimes: string[] = [];
    let best: { date: number; qualityScore: number } | null = null;
    let worst: { date: number; qualityScore: number } | null = null;
    const factorCounts = new Map<string, number>();

    for (const entry of entries) {
      const data = entry.data as any;
      totalDuration += data.durationMinutes ?? 0;
      const qs = data.qualityScore ?? 0;
      totalScore += qs;
      bedTimes.push(data.bedTime);
      wakeTimes.push(data.wakeTime);

      if (!best || qs > best.qualityScore) {
        best = { date: entry.timestamp, qualityScore: qs };
      }
      if (!worst || qs < worst.qualityScore) {
        worst = { date: entry.timestamp, qualityScore: qs };
      }

      for (const factor of data.factors ?? []) {
        factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1);
      }
    }

    const avgBedTime = calculateAverageTime(bedTimes);
    const [avgH, avgM] = avgBedTime.split(":").map(Number);
    const avgBedMinutes = avgH * 60 + avgM;
    let consistentNights = 0;
    for (const bt of bedTimes) {
      const [h, m] = bt.split(":").map(Number);
      let btMinutes = h * 60 + m;
      if (h < 6) btMinutes += 24 * 60;
      let adjustedAvg = avgBedMinutes;
      if (avgH < 6) adjustedAvg += 24 * 60;
      const diff = Math.abs(btMinutes - adjustedAvg);
      if (diff <= 30) consistentNights++;
    }

    const commonFactors = Array.from(factorCounts.entries())
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count);

    return {
      averageDuration: Math.round(totalDuration / entries.length),
      averageQualityScore: Math.round(totalScore / entries.length),
      averageBedTime: avgBedTime,
      averageWakeTime: calculateAverageTime(wakeTimes),
      bestNight: best,
      worstNight: worst,
      totalNightsLogged: entries.length,
      consistencyScore: Math.round((consistentNights / entries.length) * 100),
      commonFactors,
    };
  },
});

export const getSleepStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const numDays = args.days ?? 30;
    const startTime = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "sleep")
      )
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    if (entries.length === 0) {
      return {
        averageDuration: 0,
        averageQualityScore: 0,
        averageBedTime: "00:00",
        averageWakeTime: "00:00",
        bestNight: null,
        worstNight: null,
        totalNightsLogged: 0,
        consistencyScore: 0,
        commonFactors: [],
      };
    }

    let totalDuration = 0;
    let totalScore = 0;
    const bedTimes: string[] = [];
    const wakeTimes: string[] = [];
    let best: { date: number; qualityScore: number } | null = null;
    let worst: { date: number; qualityScore: number } | null = null;
    const factorCounts = new Map<string, number>();

    for (const entry of entries) {
      const data = entry.data as any;
      totalDuration += data.durationMinutes ?? 0;
      const qs = data.qualityScore ?? 0;
      totalScore += qs;
      bedTimes.push(data.bedTime);
      wakeTimes.push(data.wakeTime);

      if (!best || qs > best.qualityScore) {
        best = { date: entry.timestamp, qualityScore: qs };
      }
      if (!worst || qs < worst.qualityScore) {
        worst = { date: entry.timestamp, qualityScore: qs };
      }

      for (const factor of data.factors ?? []) {
        factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1);
      }
    }

    // Consistency: % of nights with bedTime within +-30min of average
    const avgBedTime = calculateAverageTime(bedTimes);
    const [avgH, avgM] = avgBedTime.split(":").map(Number);
    const avgBedMinutes = avgH * 60 + avgM;
    let consistentNights = 0;
    for (const bt of bedTimes) {
      const [h, m] = bt.split(":").map(Number);
      let btMinutes = h * 60 + m;
      if (h < 6) btMinutes += 24 * 60;
      let adjustedAvg = avgBedMinutes;
      if (avgH < 6) adjustedAvg += 24 * 60;
      const diff = Math.abs(btMinutes - adjustedAvg);
      if (diff <= 30) consistentNights++;
    }

    const commonFactors = Array.from(factorCounts.entries())
      .map(([factor, count]) => ({ factor, count }))
      .sort((a, b) => b.count - a.count);

    return {
      averageDuration: Math.round(totalDuration / entries.length),
      averageQualityScore: Math.round(totalScore / entries.length),
      averageBedTime: avgBedTime,
      averageWakeTime: calculateAverageTime(wakeTimes),
      bestNight: best,
      worstNight: worst,
      totalNightsLogged: entries.length,
      consistencyScore: Math.round((consistentNights / entries.length) * 100),
      commonFactors,
    };
  },
});

export const getSleepByDate = query({
  args: { date: v.number() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const dayStart = startOfDay(new Date(args.date)).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "sleep")
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), dayStart),
          q.lt(q.field("timestamp"), dayEnd)
        )
      )
      .collect();

    if (entries.length === 0) return null;

    const entry = entries[entries.length - 1];
    return {
      _id: entry._id,
      data: entry.data,
      timestamp: entry.timestamp,
      source: entry.source,
    };
  },
});
