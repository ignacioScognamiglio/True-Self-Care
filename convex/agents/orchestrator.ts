import { Agent } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { components } from "../_generated/api";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "../prompts/orchestrator";

export const orchestratorAgent = new Agent(components.agent, {
  name: "Orquestador",
  languageModel: anthropic("claude-sonnet-4-5-20250929"),
  instructions: ORCHESTRATOR_SYSTEM_PROMPT,
});
