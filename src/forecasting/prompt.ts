import type { ForecastExample } from "./types.ts";

export interface ForecastMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const forecastSystemPrompt = [
  "You are a calibrated forecasting model.",
  "Use only the supplied context and general background knowledge available before the snapshot time.",
  "Return strict JSON only."
].join(" ");

export function buildForecastMessages(example: ForecastExample): ForecastMessage[] {
  return [
    { role: "system", content: forecastSystemPrompt },
    { role: "user", content: renderForecastUserPrompt(example) }
  ];
}

export function renderForecastUserPrompt(example: ForecastExample): string {
  return [
    `Question: ${example.question}`,
    `Category: ${example.category ?? "general"}`,
    `Snapshot time: ${example.snapshotTimestamp}`,
    `Resolution time: ${example.resolutionTimestamp}`,
    "",
    "Allowed outcomes:",
    ...example.outcomes.map((outcome) => `- ${outcome}`),
    "",
    "Context available at snapshot time:",
    example.context.trim(),
    "",
    "Return a JSON object with a single key `outcome_probs`.",
    "Each key must be one of the allowed outcomes. Probabilities must be non-negative and sum to 1.",
    "Do not include explanations, markdown fences, citations outside JSON, or extra keys.",
    `Example: ${JSON.stringify({ outcome_probs: Object.fromEntries(example.outcomes.map((outcome, index) => [outcome, index === 0 ? 0.5 : 0.5 / Math.max(1, example.outcomes.length - 1)])) })}`
  ].join("\n");
}

export function renderSftRow(example: ForecastExample): Record<string, unknown> {
  return {
    example_id: example.exampleId,
    messages: [
      ...buildForecastMessages(example),
      {
        role: "assistant",
        content: JSON.stringify({
          outcome_probs: Object.fromEntries(example.outcomes.map((outcome) => [
            outcome,
            outcome === example.targetOutcome ? 1 : 0
          ]))
        })
      }
    ]
  };
}
