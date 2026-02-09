import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "../prompts/orchestrator";
import {
  logWater,
  trackHabit,
  getHabits,
  getWaterIntake,
  createHabit,
} from "../tools/habitTools";
import {
  logMeal,
  analyzeFoodImage,
  createMealPlan,
  getNutritionSummary,
  searchNutritionDB,
} from "../tools/nutritionTools";
import {
  logExercise,
  createWorkoutPlan,
  adjustIntensity,
  getExerciseSummary,
  getWorkoutHistory,
} from "../tools/fitnessTools";

export const orchestratorAgent = new Agent(components.agent, {
  name: "Orquestador",
  languageModel: google("gemini-2.5-flash"),
  instructions: ORCHESTRATOR_SYSTEM_PROMPT,
  tools: {
    logWater, trackHabit, getHabits, getWaterIntake, createHabit,
    logMeal, analyzeFoodImage, createMealPlan, getNutritionSummary, searchNutritionDB,
    logExercise, createWorkoutPlan, adjustIntensity, getExerciseSummary, getWorkoutHistory,
  },
  maxSteps: 3,
});
