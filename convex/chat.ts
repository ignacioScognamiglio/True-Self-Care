import { v } from "convex/values";
import { query, mutation, internalAction } from "./_generated/server";
import { internal, components } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { listMessages } from "@convex-dev/agent";
import { orchestratorAgent } from "./agents/orchestrator";
import { getAuthenticatedUser } from "./lib/auth";

// ═══ MUTATIONS ═══

export const createThread = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const { threadId } = await orchestratorAgent.createThread(ctx, {
      userId: user._id,
      title: "Conversacion",
    });

    return threadId;
  },
});

export const initiateStream = mutation({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const { messageId } = await orchestratorAgent.saveMessage(ctx, {
      threadId: args.threadId,
      prompt: args.prompt,
      skipEmbeddings: true,
    });

    await ctx.scheduler.runAfter(0, internal.chat.streamAsync, {
      threadId: args.threadId,
      promptMessageId: messageId,
    });
  },
});

// ═══ INTERNAL ACTIONS ═══

export const streamAsync = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await orchestratorAgent.streamText(
      ctx,
      { threadId: args.threadId },
      {
        promptMessageId: args.promptMessageId,
      } as any,
      {
        saveStreamDeltas: {
          chunking: "word",
          throttleMs: 100,
        },
      }
    );
    await result.consumeStream();
  },
});

// ═══ QUERIES ═══

export const getUserThreads = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);

    const result = await ctx.runQuery(
      components.agent.threads.listThreadsByUserId,
      {
        userId: user._id,
        paginationOpts: { cursor: null, numItems: 50 },
      }
    );

    return result.page;
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await listMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
  },
});
