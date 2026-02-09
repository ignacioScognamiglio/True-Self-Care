import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";
import { FITNESS_SYSTEM_PROMPT } from "../prompts/fitness";
import {
  logExercise,
  createWorkoutPlan,
  adjustIntensity,
  getExerciseSummary,
  getWorkoutHistory,
} from "../tools/fitnessTools";

export const fitnessAgent = new Agent(components.agent, {
  name: "Especialista en Fitness",
  languageModel: google("gemini-2.5-flash-lite"),
  instructions: FITNESS_SYSTEM_PROMPT,
  tools: { logExercise, createWorkoutPlan, adjustIntensity, getExerciseSummary, getWorkoutHistory },
});
