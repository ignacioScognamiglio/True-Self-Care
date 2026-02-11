/**
 * Manages conversation context to prevent token bloat.
 * Truncates history to last N messages + summary of older messages.
 */

interface Message {
  role: string;
  content: string;
  [key: string]: any;
}

const MAX_RECENT_MESSAGES = 5;

/**
 * Truncate conversation history to stay within token budgets.
 * Keeps the last `maxRecent` messages and creates a brief summary of older ones.
 */
export function truncateHistory(
  messages: Message[],
  maxRecent: number = MAX_RECENT_MESSAGES
): Message[] {
  if (messages.length <= maxRecent) {
    return messages;
  }

  const older = messages.slice(0, -maxRecent);
  const recent = messages.slice(-maxRecent);

  // Create a summary of older messages
  const topicCount = older.filter((m) => m.role === "user").length;
  const summary: Message = {
    role: "system",
    content: `[Contexto previo: ${topicCount} mensajes del usuario anteriores en esta conversacion. El usuario ha estado interactuando con el asistente de bienestar.]`,
  };

  return [summary, ...recent];
}

/**
 * Estimate token count for a string (rough approximation).
 * ~4 chars per token for Spanish text.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if a message array exceeds a token budget.
 */
export function exceedsTokenBudget(
  messages: Message[],
  budget: number = 8000
): boolean {
  const totalChars = messages.reduce(
    (sum, m) => sum + (typeof m.content === "string" ? m.content.length : 0),
    0
  );
  return estimateTokens(totalChars.toString()) > budget;
}
