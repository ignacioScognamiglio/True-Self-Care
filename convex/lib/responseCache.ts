import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// TTL config per task type (in milliseconds)
const CACHE_TTL: Record<string, number> = {
  chat: 0, // no cache
  meal_plan: 24 * 60 * 60 * 1000, // 24h
  daily_plan: 12 * 60 * 60 * 1000, // 12h
  weekly_summary: 24 * 60 * 60 * 1000, // 24h
  generate_insights: 60 * 60 * 1000, // 1h
  generate_weekly_challenge: 7 * 24 * 60 * 60 * 1000, // 7 days
  image: 0, // no cache
};

/**
 * Simple hash for prompt deduplication.
 * Uses a fast, non-cryptographic hash.
 */
function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}

/**
 * Check if a cached response exists for this user/task/prompt.
 */
export async function checkCache(
  ctx: QueryCtx,
  userId: Id<"users">,
  taskType: string,
  prompt: string
): Promise<string | null> {
  const ttl = CACHE_TTL[taskType];
  if (!ttl || ttl === 0) return null;

  const promptHash = hashPrompt(prompt);

  const cached = await ctx.db
    .query("responseCache")
    .withIndex("by_user_task_hash", (q) =>
      q
        .eq("userId", userId)
        .eq("taskType", taskType)
        .eq("promptHash", promptHash)
    )
    .first();

  if (!cached) return null;

  // Check expiry
  if (cached.expiresAt < Date.now()) {
    return null;
  }

  return cached.response;
}

/**
 * Save a response to the cache.
 */
export async function saveToCache(
  ctx: MutationCtx,
  userId: Id<"users">,
  taskType: string,
  prompt: string,
  response: string
): Promise<void> {
  const ttl = CACHE_TTL[taskType];
  if (!ttl || ttl === 0) return;

  const promptHash = hashPrompt(prompt);
  const now = Date.now();

  // Upsert: delete old entry if exists
  const existing = await ctx.db
    .query("responseCache")
    .withIndex("by_user_task_hash", (q) =>
      q
        .eq("userId", userId)
        .eq("taskType", taskType)
        .eq("promptHash", promptHash)
    )
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      response,
      expiresAt: now + ttl,
      createdAt: now,
    });
  } else {
    await ctx.db.insert("responseCache", {
      userId,
      taskType,
      promptHash,
      response,
      expiresAt: now + ttl,
      createdAt: now,
    });
  }
}

/**
 * Invalidate all cached responses for a user.
 * Call when user profile or health data changes significantly.
 */
export async function invalidateUserCache(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<void> {
  const entries = await ctx.db
    .query("responseCache")
    .withIndex("by_user_task_hash", (q) => q.eq("userId", userId))
    .collect();

  for (const entry of entries) {
    await ctx.db.delete(entry._id);
  }
}
