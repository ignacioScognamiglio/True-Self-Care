import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";
import { SAFETY_SYSTEM_PROMPT } from "../prompts/safety";

export const safetyAgent = new Agent(components.agent, {
  name: "Agente de Seguridad",
  languageModel: google("gemini-2.5-flash-lite"),
  instructions: SAFETY_SYSTEM_PROMPT,
});
