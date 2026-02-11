import { v } from "convex/values";
import { internalQuery, internalMutation } from "../_generated/server";
import { checkCache, saveToCache } from "../lib/responseCache";

export const check = internalQuery({
  args: {
    userId: v.id("users"),
    taskType: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    return await checkCache(ctx, args.userId, args.taskType, args.prompt);
  },
});

export const save = internalMutation({
  args: {
    userId: v.id("users"),
    taskType: v.string(),
    prompt: v.string(),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    await saveToCache(ctx, args.userId, args.taskType, args.prompt, args.response);
  },
});
