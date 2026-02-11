import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ QUERIES ═══

export const getUserGoals = query({
  args: {
    status: v.optional(
      v.union(v.literal("active"), v.literal("completed"), v.literal("paused"))
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user_category", (q) => q.eq("userId", user._id))
      .collect();

    if (args.status) {
      return goals.filter((g) => g.status === args.status);
    }
    return goals;
  },
});

export const getGoalsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    return await ctx.db
      .query("goals")
      .withIndex("by_user_category", (q) =>
        q.eq("userId", user._id).eq("category", args.category)
      )
      .collect();
  },
});

// ═══ MUTATIONS ═══

export const createGoal = mutation({
  args: {
    category: v.string(),
    title: v.string(),
    targetValue: v.optional(v.number()),
    unit: v.optional(v.string()),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("goals", {
      userId: user._id,
      category: args.category,
      title: args.title,
      targetValue: args.targetValue,
      currentValue: 0,
      unit: args.unit,
      deadline: args.deadline,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const updateGoalProgress = mutation({
  args: {
    goalId: v.id("goals"),
    currentValue: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const goal = await ctx.db.get(args.goalId);

    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found");
    }

    const patch: Record<string, any> = { currentValue: args.currentValue };

    // Auto-complete if target reached
    if (goal.targetValue && args.currentValue >= goal.targetValue && goal.status === "active") {
      patch.status = "completed";
      // Award XP
      await ctx.scheduler.runAfter(0, internal.functions.gamification.awardXP, {
        userId: user._id,
        action: "challenge",
      });
    }

    await ctx.db.patch(args.goalId, patch);
  },
});

export const pauseGoal = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const goal = await ctx.db.get(args.goalId);

    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found");
    }

    await ctx.db.patch(args.goalId, { status: "paused" });
  },
});

export const resumeGoal = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const goal = await ctx.db.get(args.goalId);

    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found");
    }

    await ctx.db.patch(args.goalId, { status: "active" });
  },
});

export const completeGoal = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const goal = await ctx.db.get(args.goalId);

    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found");
    }

    await ctx.db.patch(args.goalId, { status: "completed" });

    // Award XP
    await ctx.scheduler.runAfter(0, internal.functions.gamification.awardXP, {
      userId: user._id,
      action: "challenge",
    });
  },
});

export const deleteGoal = mutation({
  args: { goalId: v.id("goals") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const goal = await ctx.db.get(args.goalId);

    if (!goal || goal.userId !== user._id) {
      throw new Error("Goal not found");
    }

    await ctx.db.delete(args.goalId);
  },
});
