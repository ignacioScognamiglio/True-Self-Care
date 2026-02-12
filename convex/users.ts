import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { invalidateUserCache } from "./lib/responseCache";

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

const VALID_MODULES = [
  "nutrition",
  "fitness",
  "mental",
  "sleep",
  "habits",
] as const;

export const updatePreferences = mutation({
  args: {
    notificationsEnabled: v.optional(v.boolean()),
    wakeUpTime: v.optional(v.string()),
    bedTime: v.optional(v.string()),
    activeModules: v.optional(v.array(v.string())),
    unitSystem: v.optional(
      v.union(v.literal("metric"), v.literal("imperial"))
    ),
    language: v.optional(v.string()),
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
    if (args.activeModules !== undefined) {
      updatedPreferences.activeModules = args.activeModules.filter((m) =>
        (VALID_MODULES as readonly string[]).includes(m)
      );
    }
    if (args.unitSystem !== undefined) {
      updatedPreferences.unitSystem = args.unitSystem;
    }
    if (args.language !== undefined) {
      updatedPreferences.language = args.language;
    }

    await ctx.db.patch(user._id, { preferences: updatedPreferences });

    // Invalidate response cache when preferences change
    await invalidateUserCache(ctx, user._id);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const patch: Record<string, string> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.avatar !== undefined) patch.avatar = args.avatar;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(user._id, patch);

      // Invalidate response cache when profile changes
      await invalidateUserCache(ctx, user._id);
    }
  },
});
