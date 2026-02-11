/**
 * Analyzes query complexity to route to the appropriate model.
 * Returns: "simple" | "moderate" | "complex"
 *
 * - simple -> LITE model (fast, cheap)
 * - moderate/complex -> FLASH model (reasoning)
 */

const SIMPLE_PATTERNS = [
  /^(hola|buenas|hey|hi)\b/i,
  /^(registr|log|anot)/i,
  /^(cuant|how much|how many)/i,
  /^(tom[eé]|beb[ií]|com[ií])/i,
  /^(si|no|ok|dale|listo|gracias|thanks)\b/i,
  /\b(agua|water|vasos?)\b.*\b(ml|litros?|oz)\b/i,
];

const COMPLEX_PATTERNS = [
  /\b(plan|rutina|programa|schedule)\b/i,
  /\b(analiz|evalua|compar|correlacion)\b/i,
  /\b(por\s?qu[ée]|why|explain|explica)\b/i,
  /\b(recomienda|suggest|improve|mejorar)\b/i,
  /\b(dieta|meal\s?plan|workout)\b/i,
  /\b(semana|week|mes|month)\b/i,
];

export type ComplexityLevel = "simple" | "moderate" | "complex";

export function analyzeComplexity(query: string): ComplexityLevel {
  const trimmed = query.trim();

  // Very short messages are usually simple
  if (trimmed.length < 20) return "simple";

  // Check simple patterns
  if (SIMPLE_PATTERNS.some((p) => p.test(trimmed))) {
    return "simple";
  }

  // Check complex patterns
  const complexMatches = COMPLEX_PATTERNS.filter((p) => p.test(trimmed)).length;
  if (complexMatches >= 2) return "complex";
  if (complexMatches >= 1) return "moderate";

  // Long messages are likely moderate
  if (trimmed.length > 100) return "moderate";

  return "simple";
}
