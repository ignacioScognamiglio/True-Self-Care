import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";
import { MENTAL_HEALTH_SYSTEM_PROMPT } from "../prompts/mental";
import {
  logMood,
  getMoodHistory,
  createJournalEntry,
  getJournalEntries,
  suggestExercise,
  logCrisisIncident,
} from "../tools/mentalHealthTools";

export const mentalHealthAgent = new Agent(components.agent, {
  name: "Especialista en Salud Mental",
  languageModel: google("gemini-2.5-flash"),
  instructions: MENTAL_HEALTH_SYSTEM_PROMPT,
  tools: {
    logMood,
    getMoodHistory,
    createJournalEntry,
    getJournalEntries,
    suggestExercise,
    logCrisisIncident,
  },
});
