import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../lib/auth";

export const exportUserData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const userId = user._id;

    const healthProfiles = await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const wellnessEntries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .collect();

    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user_category", (q) => q.eq("userId", userId))
      .collect();

    const progressPhotos = await ctx.db
      .query("progressPhotos")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .collect();

    const aiPlans = await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) => q.eq("userId", userId))
      .collect();

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .collect();

    const gamification = await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const pushSubscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const aiUsage = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .collect();

    return {
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        preferences: user.preferences,
        onboardingCompleted: user.onboardingCompleted,
      },
      healthProfiles,
      wellnessEntries,
      habits,
      goals,
      progressPhotos,
      aiPlans,
      notifications,
      gamification,
      achievements,
      pushSubscriptions,
      aiUsage,
    };
  },
});
