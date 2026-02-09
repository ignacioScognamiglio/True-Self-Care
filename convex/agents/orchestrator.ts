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

export const orchestratorAgent = new Agent(components.agent, {
  name: "Orquestador",
  languageModel: google("gemini-2.5-flash"),
  instructions: ORCHESTRATOR_SYSTEM_PROMPT,
  tools: { logWater, trackHabit, getHabits, getWaterIntake, createHabit },
  maxSteps: 3,
});
