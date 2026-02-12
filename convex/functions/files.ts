import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";

// ═══ MUTATIONS ═══

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getAuthenticatedUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProgressPhoto = mutation({
  args: {
    storageId: v.string(),
    type: v.union(v.literal("body"), v.literal("food")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("progressPhotos", {
      userId: user._id,
      type: args.type,
      storageId: args.storageId,
      timestamp: Date.now(),
    });
  },
});

// ═══ QUERIES ═══

export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getProgressPhotos = query({
  args: {
    type: v.optional(
      v.union(v.literal("body"), v.literal("food"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return [];

    const maxResults = args.limit ?? 50;

    if (args.type) {
      return await ctx.db
        .query("progressPhotos")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("type", args.type!)
        )
        .order("desc")
        .take(maxResults);
    }

    return await ctx.db
      .query("progressPhotos")
      .withIndex("by_user_time", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(maxResults);
  },
});
