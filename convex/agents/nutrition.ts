import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";
import { NUTRITION_SYSTEM_PROMPT } from "../prompts/nutrition";
import {
  logMeal,
  analyzeFoodImage,
  createMealPlan,
  getNutritionSummary,
} from "../tools/nutritionTools";

export const nutritionAgent = new Agent(components.agent, {
  name: "Especialista en Nutricion",
  languageModel: google("gemini-2.5-flash"),
  instructions: NUTRITION_SYSTEM_PROMPT,
  tools: { logMeal, analyzeFoodImage, createMealPlan, getNutritionSummary },
});
