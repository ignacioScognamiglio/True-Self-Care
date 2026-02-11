import { mutation } from "../_generated/server";
import { getAuthenticatedUser } from "../lib/auth";

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const userId = user._id;

    // 1. Progress photos — delete storage files first
    const photos = await ctx.db
      .query("progressPhotos")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .collect();
    for (const photo of photos) {
      try {
        await ctx.storage.delete(photo.storageId);
      } catch {
        // Storage file may already be deleted
      }
      await ctx.db.delete(photo._id);
    }

    // 2. Wellness entries
    const entries = await ctx.db
      .query("wellnessEntries")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .collect();
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    // 3. Habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const habit of habits) {
      await ctx.db.delete(habit._id);
    }

    // 4. Goals
    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user_category", (q) => q.eq("userId", userId))
      .collect();
    for (const goal of goals) {
      await ctx.db.delete(goal._id);
    }

    // 5. AI Plans
    const plans = await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) => q.eq("userId", userId))
      .collect();
    for (const plan of plans) {
      await ctx.db.delete(plan._id);
    }

    // 6. Notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .collect();
    for (const notif of notifications) {
      await ctx.db.delete(notif._id);
    }

    // 7. Gamification
    const gamification = await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const g of gamification) {
      await ctx.db.delete(g._id);
    }

    // 8. Achievements
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const a of achievements) {
      await ctx.db.delete(a._id);
    }

    // 9. Push subscriptions
    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const sub of subscriptions) {
      await ctx.db.delete(sub._id);
    }

    // 10. AI Usage
    const aiUsage = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .collect();
    for (const usage of aiUsage) {
      await ctx.db.delete(usage._id);
    }

    // 11. Health profiles
    const profiles = await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const profile of profiles) {
      await ctx.db.delete(profile._id);
    }

    // 11b. Response cache
    const cacheEntries = await ctx.db
      .query("responseCache")
      .withIndex("by_user_task_hash", (q) => q.eq("userId", userId))
      .collect();
    for (const entry of cacheEntries) {
      await ctx.db.delete(entry._id);
    }

    // 12. User record — last
    await ctx.db.delete(userId);
  },
});
