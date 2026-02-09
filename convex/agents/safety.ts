import { Agent } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { components } from "../_generated/api";
import { SAFETY_SYSTEM_PROMPT } from "../prompts/safety";

export const safetyAgent = new Agent(components.agent, {
  name: "Agente de Seguridad",
  languageModel: anthropic("claude-haiku-4-5-20251001"),
  instructions: SAFETY_SYSTEM_PROMPT,
});
