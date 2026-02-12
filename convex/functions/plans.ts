import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ SHARED VALIDATORS ═══

const planTypeValidator = v.union(
  v.literal("daily"),
  v.literal("meal"),
  v.literal("workout"),
  v.literal("sleep_routine"),
  v.literal("weekly"),
  v.literal("challenge")
);

const planStatusValidator = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived")
);

// ═══ MUTATIONS ═══

export const createPlan = internalMutation({
  args: {
    userId: v.id("users"),
    type: planTypeValidator,
    content: v.any(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Archive existing active plan of the same type
    const existingActive = await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    for (const plan of existingActive) {
      await ctx.db.patch(plan._id, { status: "archived" });
    }

    return await ctx.db.insert("aiPlans", {
      userId: args.userId,
      type: args.type,
      content: args.content,
      status: "active",
      generatedAt: Date.now(),
      expiresAt: args.expiresAt,
    });
  },
});

export const updatePlanStatus = mutation({
  args: {
    planId: v.id("aiPlans"),
    status: planStatusValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan || plan.userId !== user._id) {
      throw new Error("Plan not found");
    }

    await ctx.db.patch(args.planId, { status: args.status });
  },
});

export const updatePlanContent = mutation({
  args: {
    planId: v.id("aiPlans"),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const plan = await ctx.db.get(args.planId);

    if (!plan || plan.userId !== user._id) {
      throw new Error("Plan not found");
    }

    await ctx.db.patch(args.planId, { content: args.content });
  },
});

// ═══ QUERIES ═══

export const getActivePlan = internalQuery({
  args: {
    userId: v.id("users"),
    type: planTypeValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const getActivePlanPublic = query({
  args: { type: planTypeValidator },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", args.type)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const getUserPlans = query({
  args: { type: v.optional(planTypeValidator) },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    if (args.type) {
      return await ctx.db
        .query("aiPlans")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", args.type!)
        )
        .filter((q) =>
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("status"), "completed")
          )
        )
        .order("desc")
        .collect();
    }

    // All plans (active + completed), most recent first
    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user_status", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "completed")
        )
      )
      .order("desc")
      .collect();
  },
});

export const getActiveSleepRoutine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "sleep_routine")
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});
