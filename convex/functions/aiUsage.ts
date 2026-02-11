import { v } from "convex/values";
import { query, internalMutation } from "../_generated/server";
import { startOfDay } from "date-fns";
import { getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ INTERNAL ═══

export const logUsage = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    task: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cachedTokens: v.optional(v.number()),
    durationMs: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("aiUsage", {
      userId: args.userId,
      task: args.task,
      model: args.model,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      cachedTokens: args.cachedTokens,
      durationMs: args.durationMs,
      timestamp: Date.now(),
    });
  },
});

// ═══ QUERIES ═══

export const getUserUsage = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const numDays = args.days ?? 30;
    const since = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("aiUsage")
      .withIndex("by_user_timestamp", (q) =>
        q.eq("userId", user._id).gte("timestamp", since)
      )
      .collect();

    let totalInput = 0;
    let totalOutput = 0;
    let totalRequests = 0;
    const byTask: Record<string, { input: number; output: number; count: number }> = {};
    const byDay: Record<number, { input: number; output: number; count: number }> = {};

    for (const entry of entries) {
      totalInput += entry.inputTokens;
      totalOutput += entry.outputTokens;
      totalRequests++;

      // By task
      if (!byTask[entry.task]) {
        byTask[entry.task] = { input: 0, output: 0, count: 0 };
      }
      byTask[entry.task].input += entry.inputTokens;
      byTask[entry.task].output += entry.outputTokens;
      byTask[entry.task].count++;

      // By day
      const dayKey = startOfDay(new Date(entry.timestamp)).getTime();
      if (!byDay[dayKey]) {
        byDay[dayKey] = { input: 0, output: 0, count: 0 };
      }
      byDay[dayKey].input += entry.inputTokens;
      byDay[dayKey].output += entry.outputTokens;
      byDay[dayKey].count++;
    }

    return {
      totalInput,
      totalOutput,
      totalTokens: totalInput + totalOutput,
      totalRequests,
      byTask,
      byDay,
    };
  },
});

export const getSystemUsage = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const numDays = args.days ?? 7;
    const since = Date.now() - numDays * 24 * 60 * 60 * 1000;

    const entries = await ctx.db
      .query("aiUsage")
      .withIndex("by_task_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    let totalInput = 0;
    let totalOutput = 0;
    const byModel: Record<string, { input: number; output: number; count: number }> = {};
    const byTask: Record<string, { input: number; output: number; count: number }> = {};

    for (const entry of entries) {
      totalInput += entry.inputTokens;
      totalOutput += entry.outputTokens;

      if (!byModel[entry.model]) {
        byModel[entry.model] = { input: 0, output: 0, count: 0 };
      }
      byModel[entry.model].input += entry.inputTokens;
      byModel[entry.model].output += entry.outputTokens;
      byModel[entry.model].count++;

      if (!byTask[entry.task]) {
        byTask[entry.task] = { input: 0, output: 0, count: 0 };
      }
      byTask[entry.task].input += entry.inputTokens;
      byTask[entry.task].output += entry.outputTokens;
      byTask[entry.task].count++;
    }

    return {
      totalInput,
      totalOutput,
      totalTokens: totalInput + totalOutput,
      totalRequests: entries.length,
      byModel,
      byTask,
    };
  },
});
