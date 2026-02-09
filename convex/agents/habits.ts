import { Agent } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
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
  languageModel: anthropic("claude-haiku-4-5-20251001"),
  instructions: HABITS_SYSTEM_PROMPT,
  tools: { logWater, trackHabit, getHabits, getWaterIntake, createHabit },
});
