import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";
import { SLEEP_SYSTEM_PROMPT } from "../prompts/sleep";
import {
  logSleep,
  getSleepSummary,
  getSleepHistory,
  getSleepStats,
  createSleepRoutine,
  analyzeSleepFactors,
} from "../tools/sleepTools";

export const sleepAgent = new Agent(components.agent, {
  name: "Especialista en Sueno",
  languageModel: google("gemini-2.5-flash-lite"),
  instructions: SLEEP_SYSTEM_PROMPT,
  tools: {
    logSleep,
    getSleepSummary,
    getSleepHistory,
    getSleepStats,
    createSleepRoutine,
    analyzeSleepFactors,
  },
});
