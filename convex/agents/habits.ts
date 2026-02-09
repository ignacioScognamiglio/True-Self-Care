import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";
import { HABITS_SYSTEM_PROMPT } from "../prompts/habits";
import {
  logWater,
  trackHabit,
  getHabits,
  getWaterIntake,
  createHabit,
} from "../tools/habitTools";

export const habitsAgent = new Agent(components.agent, {
  name: "Especialista en Habitos",
  languageModel: google("gemini-2.5-flash-lite"),
  instructions: HABITS_SYSTEM_PROMPT,
  tools: { logWater, trackHabit, getHabits, getWaterIntake, createHabit },
});
