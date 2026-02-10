import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  internalQuery,
  internalAction,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ CONSTANTS ═══

const GOOGLE_FIT_SCOPES = [
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.heart_rate.read",
  "https://www.googleapis.com/auth/fitness.body.read",
];

// ═══ MUTATIONS ═══

export const saveGoogleFitTokens = mutation({
  args: {
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    scopes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const profile = await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const tokens = {
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      expiresAt: args.expiresAt,
      scopes: args.scopes,
      connectedAt: Date.now(),
    };

    if (profile) {
      await ctx.db.patch(profile._id, {
        googleFitTokens: tokens,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("healthProfiles", {
        userId: user._id,
        googleFitTokens: tokens,
        updatedAt: Date.now(),
      });
    }
  },
});

export const disconnectGoogleFit = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const profile = await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        googleFitTokens: undefined,
        updatedAt: Date.now(),
      });
    }
  },
});

// ═══ QUERIES ═══

export const getGoogleFitConnection = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const profile = await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile?.googleFitTokens) {
      return { connected: false, connectedAt: null, scopes: [] };
    }

    return {
      connected: true,
      connectedAt: profile.googleFitTokens.connectedAt,
      scopes: profile.googleFitTokens.scopes,
    };
  },
});

// ═══ INTERNAL QUERIES ═══

export const getTokensForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile?.googleFitTokens) return null;

    return {
      profileId: profile._id,
      tokens: profile.googleFitTokens,
    };
  },
});

export const getConnectedUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("healthProfiles").collect();

    return profiles
      .filter((p) => p.googleFitTokens != null)
      .map((p) => ({
        userId: p.userId,
        profileId: p._id,
      }));
  },
});

export const checkDuplicateEntry = internalQuery({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("sleep"), v.literal("exercise")),
    timestamp: v.number(),
    windowMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const windowMs = args.windowMinutes * 60 * 1000;
    const startTime = args.timestamp - windowMs;
    const endTime = args.timestamp + windowMs;

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), startTime),
          q.lte(q.field("timestamp"), endTime),
          q.eq(q.field("source"), "wearable")
        )
      )
      .first();

    return entries !== null;
  },
});

// ═══ INTERNAL MUTATIONS ═══

export const updateTokens = internalMutation({
  args: {
    profileId: v.id("healthProfiles"),
    accessToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile?.googleFitTokens) return;

    await ctx.db.patch(args.profileId, {
      googleFitTokens: {
        ...profile.googleFitTokens,
        accessToken: args.accessToken,
        expiresAt: args.expiresAt,
      },
      updatedAt: Date.now(),
    });
  },
});

export const insertWearableEntry = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("sleep"), v.literal("exercise")),
    data: v.any(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wellnessEntries", {
      userId: args.userId,
      type: args.type,
      data: args.data,
      timestamp: args.timestamp,
      source: "wearable",
    });
  },
});

// ═══ INTERNAL ACTIONS ═══

export const refreshGoogleFitToken = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<string> => {
    const tokenData = await ctx.runQuery(
      internal.functions.googleFit.getTokensForUser,
      { userId: args.userId }
    );

    if (!tokenData) {
      throw new Error("No Google Fit tokens found for user");
    }

    const { tokens, profileId } = tokenData;

    // Check if token is still valid (5 minute buffer)
    if (tokens.expiresAt > Date.now() + 5 * 60 * 1000) {
      return tokens.accessToken;
    }

    // Refresh the token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_FIT_CLIENT_ID!,
        client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET!,
        refresh_token: tokens.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to refresh Google Fit token:", error);
      throw new Error("Failed to refresh Google Fit token");
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const newExpiresAt = Date.now() + data.expires_in * 1000;

    await ctx.runMutation(internal.functions.googleFit.updateTokens, {
      profileId,
      accessToken: newAccessToken,
      expiresAt: newExpiresAt,
    });

    return newAccessToken;
  },
});

export const importSleepData = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get a valid access token (refreshing if needed)
    const accessToken = await ctx.runAction(
      internal.functions.googleFit.refreshGoogleFitToken,
      { userId: args.userId }
    );

    // Fetch sleep sessions from the last 24 hours
    const endTime = new Date();
    const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const url = new URL(
      "https://www.googleapis.com/fitness/v1/users/me/sessions"
    );
    url.searchParams.set("startTime", startTime.toISOString());
    url.searchParams.set("endTime", endTime.toISOString());
    url.searchParams.set("activityType", "72"); // Sleep activity type

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to fetch Google Fit sleep data:", error);
      return { imported: 0, skipped: 0, errors: 1 };
    }

    const data = await response.json();
    const sessions = data.session ?? [];

    let imported = 0;
    let skipped = 0;

    for (const session of sessions) {
      const sessionStartMs = parseInt(session.startTimeMillis);
      const sessionEndMs = parseInt(session.endTimeMillis);
      const durationMinutes = Math.round(
        (sessionEndMs - sessionStartMs) / (60 * 1000)
      );

      // Skip sessions shorter than 30 minutes
      if (durationMinutes < 30) {
        skipped++;
        continue;
      }

      // Check for duplicates
      const isDuplicate = await ctx.runQuery(
        internal.functions.googleFit.checkDuplicateEntry,
        {
          userId: args.userId,
          type: "sleep",
          timestamp: sessionStartMs,
          windowMinutes: 30,
        }
      );

      if (isDuplicate) {
        skipped++;
        continue;
      }

      // Parse bed time and wake time
      const bedDate = new Date(sessionStartMs);
      const wakeDate = new Date(sessionEndMs);
      const bedTime = `${String(bedDate.getHours()).padStart(2, "0")}:${String(bedDate.getMinutes()).padStart(2, "0")}`;
      const wakeTime = `${String(wakeDate.getHours()).padStart(2, "0")}:${String(wakeDate.getMinutes()).padStart(2, "0")}`;

      // Estimate quality based on duration (7-9h is optimal)
      const hours = durationMinutes / 60;
      let quality = 3; // default
      if (hours >= 7 && hours <= 9) quality = 4;
      else if (hours >= 6 && hours < 7) quality = 3;
      else if (hours > 9 && hours <= 10) quality = 3;
      else quality = 2;

      // Calculate quality score using the same formula as sleep module
      let qualityScore = 0;
      if (hours >= 7 && hours <= 9) qualityScore += 40;
      else if (hours >= 6 && hours < 7) qualityScore += 30;
      else if (hours > 9 && hours <= 10) qualityScore += 30;
      else if (hours >= 5 && hours < 6) qualityScore += 15;
      else qualityScore += 5;
      qualityScore += quality * 6;
      qualityScore += 20; // assume no interruptions from wearable basic data
      qualityScore += 10; // consistency default
      qualityScore = Math.min(100, Math.max(0, qualityScore));

      const sleepData = {
        bedTime,
        wakeTime,
        durationMinutes,
        quality,
        qualityScore,
        interruptions: 0,
        factors: [],
        notes: "",
        provider: "google_fit" as const,
      };

      await ctx.runMutation(internal.functions.googleFit.insertWearableEntry, {
        userId: args.userId,
        type: "sleep",
        data: sleepData,
        timestamp: sessionStartMs,
      });

      imported++;
    }

    return { imported, skipped, errors: 0 };
  },
});

export const importActivityData = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get a valid access token (refreshing if needed)
    const accessToken = await ctx.runAction(
      internal.functions.googleFit.refreshGoogleFitToken,
      { userId: args.userId }
    );

    // Fetch activity data from the last 24 hours
    const endTimeMs = Date.now();
    const startTimeMs = endTimeMs - 24 * 60 * 60 * 1000;

    const aggregateBody = {
      aggregateBy: [
        { dataTypeName: "com.google.step_count.delta" },
        { dataTypeName: "com.google.heart_rate.bpm" },
        { dataTypeName: "com.google.calories.expended" },
        { dataTypeName: "com.google.active_minutes" },
      ],
      bucketByTime: { durationMillis: 86400000 }, // 1 day bucket
      startTimeMillis: startTimeMs,
      endTimeMillis: endTimeMs,
    };

    const response = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aggregateBody),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to fetch Google Fit activity data:", error);
      return { imported: 0, skipped: 0, errors: 1 };
    }

    const data = await response.json();
    const buckets = data.bucket ?? [];

    let imported = 0;
    let skipped = 0;

    for (const bucket of buckets) {
      let steps = 0;
      let avgHeartRate = 0;
      let maxHeartRate = 0;
      let caloriesBurned = 0;
      let activeMinutes = 0;
      let heartRateCount = 0;
      let heartRateSum = 0;

      for (const dataset of bucket.dataset ?? []) {
        for (const point of dataset.point ?? []) {
          const dataType = dataset.dataSourceId ?? "";

          if (dataType.includes("step_count")) {
            for (const val of point.value ?? []) {
              steps += val.intVal ?? 0;
            }
          } else if (dataType.includes("heart_rate")) {
            for (const val of point.value ?? []) {
              const bpm = val.fpVal ?? 0;
              if (bpm > 0) {
                heartRateSum += bpm;
                heartRateCount++;
                if (bpm > maxHeartRate) maxHeartRate = Math.round(bpm);
              }
            }
          } else if (dataType.includes("calories")) {
            for (const val of point.value ?? []) {
              caloriesBurned += val.fpVal ?? 0;
            }
          } else if (dataType.includes("active_minutes")) {
            for (const val of point.value ?? []) {
              activeMinutes += val.intVal ?? 0;
            }
          }
        }
      }

      if (heartRateCount > 0) {
        avgHeartRate = Math.round(heartRateSum / heartRateCount);
      }

      // Skip if no meaningful data
      if (steps === 0 && caloriesBurned === 0 && activeMinutes === 0) {
        skipped++;
        continue;
      }

      const bucketStart = parseInt(bucket.startTimeMillis);

      // Check for duplicates
      const isDuplicate = await ctx.runQuery(
        internal.functions.googleFit.checkDuplicateEntry,
        {
          userId: args.userId,
          type: "exercise",
          timestamp: bucketStart,
          windowMinutes: 60,
        }
      );

      if (isDuplicate) {
        skipped++;
        continue;
      }

      const activityData = {
        name: "Actividad diaria (Google Fit)",
        type: "cardio",
        steps,
        averageHeartRate: avgHeartRate,
        maxHeartRate,
        caloriesBurned: Math.round(caloriesBurned),
        duration: activeMinutes,
        provider: "google_fit" as const,
      };

      await ctx.runMutation(internal.functions.googleFit.insertWearableEntry, {
        userId: args.userId,
        type: "exercise",
        data: activityData,
        timestamp: bucketStart,
      });

      imported++;
    }

    return { imported, skipped, errors: 0 };
  },
});

export const syncAllUsers = internalAction({
  args: {},
  handler: async (ctx) => {
    const connectedUsers = await ctx.runQuery(
      internal.functions.googleFit.getConnectedUsers,
      {}
    );

    let totalSleep = 0;
    let totalActivity = 0;
    let errors = 0;

    for (const { userId } of connectedUsers) {
      try {
        const sleepResult = await ctx.runAction(
          internal.functions.googleFit.importSleepData,
          { userId }
        );
        totalSleep += (sleepResult as any).imported ?? 0;
      } catch (error) {
        console.error(`Error syncing sleep for user ${userId}:`, error);
        errors++;
      }

      try {
        const activityResult = await ctx.runAction(
          internal.functions.googleFit.importActivityData,
          { userId }
        );
        totalActivity += (activityResult as any).imported ?? 0;
      } catch (error) {
        console.error(`Error syncing activity for user ${userId}:`, error);
        errors++;
      }
    }

    console.log(
      `Google Fit sync complete: ${connectedUsers.length} users, ${totalSleep} sleep entries, ${totalActivity} activity entries, ${errors} errors`
    );
  },
});

// ═══ PUBLIC ACTIONS ═══

export const syncGoogleFit = action({
  args: {},
  handler: async (ctx): Promise<{ sleep: { imported: number; skipped: number; errors: number }; activity: { imported: number; skipped: number; errors: number } }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Look up user by Clerk ID
    const user = await ctx.runQuery(internal.functions.googleFit.getUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user) throw new Error("User not found");

    const sleepResult = await ctx.runAction(
      internal.functions.googleFit.importSleepData,
      { userId: user._id }
    );

    const activityResult = await ctx.runAction(
      internal.functions.googleFit.importActivityData,
      { userId: user._id }
    );

    return {
      sleep: sleepResult,
      activity: activityResult,
    };
  },
});

// Helper internal query to look up user from action context
export const getUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// ═══ PUBLIC QUERIES ═══

export const getGoogleFitSteps = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartMs = todayStart.getTime();

    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "exercise")
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), todayStartMs),
          q.eq(q.field("source"), "wearable")
        )
      )
      .collect();

    let totalSteps = 0;
    let avgHeartRate = 0;
    let maxHeartRate = 0;
    let heartRateEntries = 0;

    for (const entry of entries) {
      const data = entry.data as any;
      if (data.provider === "google_fit") {
        totalSteps += data.steps ?? 0;
        if (data.averageHeartRate > 0) {
          avgHeartRate += data.averageHeartRate;
          heartRateEntries++;
        }
        if ((data.maxHeartRate ?? 0) > maxHeartRate) {
          maxHeartRate = data.maxHeartRate;
        }
      }
    }

    if (heartRateEntries > 0) {
      avgHeartRate = Math.round(avgHeartRate / heartRateEntries);
    }

    return {
      steps: totalSteps,
      averageHeartRate: avgHeartRate,
      maxHeartRate,
      hasData: entries.length > 0,
    };
  },
});
