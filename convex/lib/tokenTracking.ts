export function logTokenUsage(params: {
  task: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  durationMs?: number;
}) {
  console.log(
    `[AI-TOKENS] task=${params.task} model=${params.model} ` +
      `in=${params.inputTokens ?? "?"} out=${params.outputTokens ?? "?"} ` +
      `duration=${params.durationMs ?? "?"}ms`
  );
}
