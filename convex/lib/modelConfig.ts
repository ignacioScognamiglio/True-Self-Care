import { google } from "@ai-sdk/google";
import { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { analyzeComplexity } from "./complexityAnalyzer";

// ═══ MODEL INSTANCES ═══

export const MODELS = {
  /** Gemini 2.5 Flash Lite — for simple/fast tasks (logging, confirmations) */
  LITE: google("gemini-2.5-flash-lite"),
  /** Gemini 2.5 Flash — for complex reasoning (plans, insights, challenges) */
  FLASH: google("gemini-2.5-flash"),
} as const;

// ═══ TASK → MODEL ROUTING ═══

type TaskType =
  | "log_water" | "log_meal" | "log_exercise" | "log_mood" | "log_sleep"
  | "complete_habit" | "get_summary" | "simple_response"
  | "create_plan" | "create_challenge" | "cross_domain_insights"
  | "analyze_image" | "generate_daily_plan" | "generate_weekly_summary"
  | "coaching_response" | "crisis_response" | "generate_weekly_challenge"
  | "generate_insights";

const LITE_TASKS = new Set<TaskType>([
  "log_water", "log_meal", "log_exercise", "log_mood", "log_sleep",
  "complete_habit", "get_summary", "simple_response",
]);

export function getModelForTask(task: TaskType | string) {
  return LITE_TASKS.has(task as TaskType) ? MODELS.LITE : MODELS.FLASH;
}

/**
 * Smart routing: pick model based on query complexity.
 * Used for chat messages where task type is unknown upfront.
 */
export function getModelForQuery(query: string) {
  const complexity = analyzeComplexity(query);
  return complexity === "simple" ? MODELS.LITE : MODELS.FLASH;
}

// ═══ TOKEN USAGE LOGGING ═══

export function logTokenUsage(params: {
  task: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cachedTokens?: number;
  durationMs?: number;
}) {
  const cached = params.cachedTokens ? ` cached=${params.cachedTokens}` : "";
  console.log(
    `[AI-TOKENS] task=${params.task} model=${params.model} ` +
      `in=${params.inputTokens ?? "?"} out=${params.outputTokens ?? "?"}${cached} ` +
      `duration=${params.durationMs ?? "?"}ms`
  );
}

/**
 * Persist token usage to DB. Call from internalAction contexts.
 * Gemini implicit caching is automatic for consistent system prompts (>= 2048 tokens).
 * Pass providerMetadata.google.usageMetadata.cachedContentTokenCount as cachedTokens.
 */
export async function persistTokenUsage(
  ctx: ActionCtx,
  params: {
    userId?: Id<"users">;
    task: string;
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    cachedTokens?: number;
    durationMs?: number;
  }
) {
  logTokenUsage(params);
  try {
    await ctx.runMutation(internal.functions.aiUsage.logUsage, {
      userId: params.userId,
      task: params.task,
      model: params.model,
      inputTokens: params.inputTokens ?? 0,
      outputTokens: params.outputTokens ?? 0,
      cachedTokens: params.cachedTokens,
      durationMs: params.durationMs ?? 0,
    });
  } catch (e) {
    console.error("[AI-TOKENS] Failed to persist usage:", e);
  }
}
