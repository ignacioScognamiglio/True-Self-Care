import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatar: args.avatar,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      onboardingCompleted: false,
      createdAt: Date.now(),
      preferences: {
        activeModules: [],
        unitSystem: "metric",
        language: "es",
        notificationsEnabled: true,
      },
    });
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();
  },
});

export const updatePreferences = mutation({
  args: {
    notificationsEnabled: v.optional(v.boolean()),
    wakeUpTime: v.optional(v.string()),
    bedTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const updatedPreferences = { ...user.preferences };

    if (args.notificationsEnabled !== undefined) {
      updatedPreferences.notificationsEnabled = args.notificationsEnabled;
    }
    if (args.wakeUpTime !== undefined) {
      updatedPreferences.wakeUpTime = args.wakeUpTime;
    }
    if (args.bedTime !== undefined) {
      updatedPreferences.bedTime = args.bedTime;
    }

    await ctx.db.patch(user._id, { preferences: updatedPreferences });
  },
});
