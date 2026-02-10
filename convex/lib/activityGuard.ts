import type { GenericQueryCtx } from "convex/server";
import type { Id } from "../_generated/dataModel";

export async function isUserActive(
  ctx: GenericQueryCtx<any>,
  userId: Id<"users">,
  inactiveDays: number = 7
): Promise<boolean> {
  const cutoff = Date.now() - inactiveDays * 24 * 60 * 60 * 1000;

  // Check last wellness entry
  const lastEntry = await ctx.db
    .query("wellnessEntries")
    .withIndex("by_user_time", (q: any) =>
      q.eq("userId", userId).gte("timestamp", cutoff)
    )
    .first();

  if (lastEntry) return true;

  // Check gamification lastXPActionAt
  const gamification = await ctx.db
    .query("gamification")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();

  if (gamification?.lastXPActionAt && gamification.lastXPActionAt >= cutoff) {
    return true;
  }

  return false;
}
