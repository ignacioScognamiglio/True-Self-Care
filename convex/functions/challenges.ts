import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import {
  query,
  mutation,
  internalMutation,
  internalQuery,
  internalAction,
} from "../_generated/server";
import { internal } from "../_generated/api";
import { generateText } from "ai";
import { getModelForTask, persistTokenUsage } from "../lib/modelConfig";
import { getAuthenticatedUser, getAuthenticatedUserOrNull } from "../lib/auth";
import { CHALLENGE_XP_REWARDS } from "../lib/gamificationConstants";
import { CHALLENGE_GENERATION_PROMPT } from "../prompts/challenges";

// ═══ INTERNAL ACTIONS ═══

export const generateWeeklyChallenge = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      // 1. Gather recent data (7 days)
      const recentData = await ctx.runQuery(
        internal.functions.insights.gatherCrossDomainData,
        { userId: args.userId, days: 7 }
      );

      // 2. Get gamification profile
      const gamProfile = await ctx.runQuery(
        internal.functions.challenges.getGamificationProfileInternal,
        { userId: args.userId }
      );

      // 3. Get previous challenge to avoid repeating type
      const prevChallenge = await ctx.runQuery(
        internal.functions.challenges.getLastChallengeInternal,
        { userId: args.userId }
      );

      // 4. Build prompt
      const userData = {
        recentData: (recentData as any).days,
        level: gamProfile?.level ?? 1,
        totalXP: gamProfile?.totalXP ?? 0,
        previousChallengeType: prevChallenge
          ? (prevChallenge.content as any)?.type
          : null,
      };

      const prompt = CHALLENGE_GENERATION_PROMPT.replace(
        "{userData}",
        JSON.stringify(userData, null, 2)
      );

      // 5. Call Gemini
      const startTime = Date.now();
      const { text, usage, providerMetadata } = await generateText({
        model: getModelForTask("generate_weekly_challenge"),
        prompt,
      });
      const googleMeta = (providerMetadata as any)?.google?.usageMetadata;
      await persistTokenUsage(ctx, {
        userId: args.userId,
        task: "generate_weekly_challenge",
        model: "gemini-2.5-flash",
        inputTokens: usage?.inputTokens,
        outputTokens: usage?.outputTokens,
        cachedTokens: googleMeta?.cachedContentTokenCount,
        durationMs: Date.now() - startTime,
      });

      // 6. Parse response
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const challengeContent = JSON.parse(cleaned);

      // Add currentValue tracking
      challengeContent.currentValue = 0;

      // 7. Save as challenge plan (archives previous active challenge automatically)
      await ctx.runMutation(internal.functions.plans.createPlan, {
        userId: args.userId,
        type: "challenge",
        content: challengeContent,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
    } catch (error) {
      console.error(
        `Error generating challenge for user ${args.userId}:`,
        error
      );
    }
  },
});

export const generateWeeklyChallengeAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.runQuery(
      internal.functions.challenges.getActiveGamificationProfiles,
      {}
    );

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const profile of profiles) {
      // Skip inactive users
      if (!profile.lastXPActionAt || profile.lastXPActionAt < sevenDaysAgo) {
        continue;
      }

      await ctx.scheduler.runAfter(
        0,
        internal.functions.challenges.generateWeeklyChallenge,
        { userId: profile.userId }
      );
    }
  },
});

// ═══ INTERNAL QUERIES ═══

export const getGamificationProfileInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gamification")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getLastChallengeInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "challenge")
      )
      .order("desc")
      .first();
  },
});

export const getActiveGamificationProfiles = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("gamification").collect();
  },
});

export const getChallengesInternal = internalQuery({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "challenge")
      )
      .order("desc")
      .take(limit);
  },
});

export const getActiveChallengeInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "challenge")
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

// ═══ INTERNAL MUTATIONS ═══

export const updateChallengeProgress = internalMutation({
  args: {
    userId: v.id("users"),
    metric: v.string(),
    incrementBy: v.number(),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", args.userId).eq("type", "challenge")
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!challenge) return { updated: false };

    const content = challenge.content as any;
    if (content.metric !== args.metric) return { updated: false };

    const newValue = (content.currentValue ?? 0) + args.incrementBy;
    content.currentValue = newValue;

    await ctx.db.patch(challenge._id, { content });

    // Check if completed
    if (newValue >= content.targetValue) {
      await ctx.scheduler.runAfter(
        0,
        internal.functions.challenges.completeChallenge,
        {
          userId: args.userId,
          challengeId: challenge._id,
        }
      );
      return { updated: true, newValue, completed: true };
    }

    return { updated: true, newValue, completed: false };
  },
});

export const completeChallenge = internalMutation({
  args: {
    userId: v.id("users"),
    challengeId: v.id("aiPlans"),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge || challenge.status !== "active") return { xpAwarded: 0 };

    // Mark as completed
    await ctx.db.patch(args.challengeId, { status: "completed" });

    // Determine XP reward based on difficulty
    const content = challenge.content as any;
    const difficulty = content.difficulty as keyof typeof CHALLENGE_XP_REWARDS;
    const xpReward =
      CHALLENGE_XP_REWARDS[difficulty] ?? CHALLENGE_XP_REWARDS.medio;

    // Award XP
    await ctx.scheduler.runAfter(
      0,
      internal.functions.gamification.awardXP,
      {
        userId: args.userId,
        action: "challenge",
        metadata: { difficulty, challengeId: args.challengeId },
      }
    );

    return { xpAwarded: xpReward };
  },
});

// ═══ PUBLIC QUERIES ═══

export const getActiveChallenge = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user) return null;

    const challenge = await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "challenge")
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!challenge) return null;

    const content = challenge.content as any;
    const progressPercent =
      content.targetValue > 0
        ? Math.min(
            100,
            Math.round(
              ((content.currentValue ?? 0) / content.targetValue) * 100
            )
          )
        : 0;

    return {
      _id: challenge._id,
      title: content.title,
      description: content.description,
      type: content.type,
      difficulty: content.difficulty,
      metric: content.metric,
      targetValue: content.targetValue,
      currentValue: content.currentValue ?? 0,
      durationDays: content.durationDays,
      xpReward: content.xpReward,
      tips: content.tips ?? [],
      generatedAt: challenge.generatedAt,
      expiresAt: challenge.expiresAt,
      progressPercent,
    };
  },
});

export const getChallenges = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUserOrNull(ctx);
    if (!user)
      return { page: [], isDone: true, continueCursor: "" };

    const result = await ctx.db
      .query("aiPlans")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", user._id).eq("type", "challenge")
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((c) => {
        const content = c.content as any;
        return {
          _id: c._id,
          title: content.title,
          type: content.type,
          difficulty: content.difficulty,
          status: c.status,
          targetValue: content.targetValue,
          currentValue: content.currentValue ?? 0,
          xpReward: content.xpReward,
          generatedAt: c.generatedAt,
          expiresAt: c.expiresAt,
        };
      }),
    };
  },
});

// ═══ PUBLIC MUTATIONS ═══

export const dismissChallenge = mutation({
  args: { challengeId: v.id("aiPlans") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const challenge = await ctx.db.get(args.challengeId);

    if (
      !challenge ||
      challenge.userId !== user._id ||
      challenge.type !== "challenge"
    ) {
      throw new Error("Challenge not found");
    }

    await ctx.db.patch(args.challengeId, { status: "archived" });
  },
});
