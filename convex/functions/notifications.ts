import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ QUERIES ═══

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    return unread.length;
  },
});

export const getRecentNotifications = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("notifications")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", user._id).gte("createdAt", thirtyDaysAgo)
      )
      .order("desc")
      .collect();
  },
});

// ═══ MUTATIONS ═══

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { read: true }))
    );
  },
});
