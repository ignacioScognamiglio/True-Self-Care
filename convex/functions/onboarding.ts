import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedUser } from "../lib/auth";

export const updateActiveModules = mutation({
  args: {
    activeModules: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    await ctx.db.patch(user._id, {
      preferences: {
        ...user.preferences,
        activeModules: args.activeModules,
      },
    });
  },
});

export const saveHealthProfile = mutation({
  args: {
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    height: v.optional(v.number()),
    weight: v.optional(v.number()),
    skinType: v.optional(v.string()),
    skinConcerns: v.optional(v.array(v.string())),
    dietaryRestrictions: v.optional(v.array(v.string())),
    allergies: v.optional(v.array(v.string())),
    fitnessLevel: v.optional(v.string()),
    healthGoals: v.optional(v.array(v.string())),
    sleepBedTime: v.optional(v.string()),
    sleepWakeTime: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const { sleepBedTime, sleepWakeTime, ...profileData } = args;

    // Update health profile
    const existing = await ctx.db
      .query("healthProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...profileData,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("healthProfiles", {
        userId: user._id,
        ...profileData,
        updatedAt: Date.now(),
      });
    }

    // Update sleep preferences if provided
    if (sleepBedTime || sleepWakeTime) {
      const updatedPrefs = { ...user.preferences };
      if (sleepBedTime) updatedPrefs.bedTime = sleepBedTime;
      if (sleepWakeTime) updatedPrefs.wakeUpTime = sleepWakeTime;
      await ctx.db.patch(user._id, { preferences: updatedPrefs });
    }
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    await ctx.db.patch(user._id, { onboardingCompleted: true });
  },
});
