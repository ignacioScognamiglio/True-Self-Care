export type ModelTier = "lite" | "standard";

export interface ModelConfig {
  model: string;
  maxTokens: number;
  tier: ModelTier;
}

const MODELS: Record<ModelTier, ModelConfig> = {
  lite: {
    model: "gemini-2.5-flash-lite",
    maxTokens: 1024,
    tier: "lite",
  },
  standard: {
    model: "gemini-2.5-flash",
    maxTokens: 4096,
    tier: "standard",
  },
};

const TASK_MODEL_MAP: Record<string, ModelTier> = {
  // Lite — simple responses, confirmations, logging
  log_water: "lite",
  log_meal: "lite",
  log_exercise: "lite",
  log_mood: "lite",
  log_sleep: "lite",
  complete_habit: "lite",
  get_summary: "lite",
  simple_response: "lite",

  // Standard — reasoning, analysis, generation
  create_plan: "standard",
  create_challenge: "standard",
  cross_domain_insights: "standard",
  analyze_image: "standard",
  generate_daily_plan: "standard",
  generate_weekly_summary: "standard",
  coaching_response: "standard",
  crisis_response: "standard",
};

export function getModelForTask(taskType: string): ModelConfig {
  const tier = TASK_MODEL_MAP[taskType] ?? "standard";
  return MODELS[tier];
}
