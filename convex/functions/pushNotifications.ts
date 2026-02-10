"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import webpush from "web-push";

// Configure VAPID details
const vapidConfigured =
  process.env.VAPID_SUBJECT &&
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY;

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export const sendPushNotification = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    tag: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!vapidConfigured) {
      console.warn("VAPID keys not configured, skipping push notification");
      return;
    }

    // Get user's push subscriptions
    const subscriptions = await ctx.runQuery(
      internal.functions.notifications.getUserPushSubscriptions,
      { userId: args.userId }
    );

    if (subscriptions.length === 0) return;

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      tag: args.tag ?? "default",
      actionUrl: args.actionUrl ?? "/dashboard",
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payload
        );
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription expired or invalid — clean up
          await ctx.runMutation(
            internal.functions.notifications.deleteExpiredSubscription,
            { subscriptionId: sub._id }
          );
          console.log(`Removed expired push subscription: ${sub.endpoint}`);
        } else {
          console.error(
            `Failed to send push to ${sub.endpoint}:`,
            error.message
          );
        }
      }
    }
  },
});
