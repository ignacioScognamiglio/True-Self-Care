import { google } from "@ai-sdk/google";

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

// ═══ TOKEN USAGE LOGGING ═══

export function logTokenUsage(params: {
  task: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs?: number;
}) {
  console.log(
    `[AI-TOKENS] task=${params.task} model=${params.model} ` +
      `in=${params.inputTokens ?? "?"} out=${params.outputTokens ?? "?"} ` +
      `duration=${params.durationMs ?? "?"}ms`
  );
}
