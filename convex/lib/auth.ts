/**
 * Shared authentication helper for Convex functions.
 *
 * Used by public queries/mutations that need to verify the calling user
 * via Clerk and resolve them to a local `users` document.
 */

export async function getAuthenticatedUser(ctx: { auth: any; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Like getAuthenticatedUser but returns null instead of throwing
 * when the user is not found (e.g., Clerk webhook hasn't synced yet).
 * Use this for queries called on page load that shouldn't crash the UI.
 */
export async function getAuthenticatedUserOrNull(ctx: { auth: any; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
}
