import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { startOfDay } from "date-fns";

// Budget limits (tokens)
const DAILY_TOKEN_LIMIT = 500_000;
const MONTHLY_TOKEN_LIMIT = 10_000_000;
const DEGRADATION_THRESHOLD = 0.9; // 90%

interface RateLimitResult {
  allowed: boolean;
  shouldDegrade: boolean;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  dailyPercent: number;
  monthlyPercent: number;
}

export async function checkRateLimit(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<RateLimitResult> {
  const now = Date.now();
  const todayStart = startOfDay(new Date(now)).getTime();
  const monthStart = new Date(
    new Date(now).getFullYear(),
    new Date(now).getMonth(),
    1
  ).getTime();

  // Daily usage
  const dailyEntries = await ctx.db
    .query("aiUsage")
    .withIndex("by_user_timestamp", (q) =>
      q.eq("userId", userId).gte("timestamp", todayStart)
    )
    .collect();

  const dailyUsed = dailyEntries.reduce(
    (sum, e) => sum + e.inputTokens + e.outputTokens,
    0
  );

  // Monthly usage
  const monthlyEntries = await ctx.db
    .query("aiUsage")
    .withIndex("by_user_timestamp", (q) =>
      q.eq("userId", userId).gte("timestamp", monthStart)
    )
    .collect();

  const monthlyUsed = monthlyEntries.reduce(
    (sum, e) => sum + e.inputTokens + e.outputTokens,
    0
  );

  const dailyPercent = dailyUsed / DAILY_TOKEN_LIMIT;
  const monthlyPercent = monthlyUsed / MONTHLY_TOKEN_LIMIT;

  const allowed =
    dailyUsed < DAILY_TOKEN_LIMIT && monthlyUsed < MONTHLY_TOKEN_LIMIT;
  const shouldDegrade =
    dailyPercent >= DEGRADATION_THRESHOLD ||
    monthlyPercent >= DEGRADATION_THRESHOLD;

  return {
    allowed,
    shouldDegrade,
    dailyUsed,
    dailyLimit: DAILY_TOKEN_LIMIT,
    monthlyUsed,
    monthlyLimit: MONTHLY_TOKEN_LIMIT,
    dailyPercent: Math.min(dailyPercent, 1),
    monthlyPercent: Math.min(monthlyPercent, 1),
  };
}
