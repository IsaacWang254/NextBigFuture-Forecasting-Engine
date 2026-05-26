import type { ForecastResponse, ForecastScores } from "./types.ts";

export function parseForecastResponse(
  text: string,
  allowedOutcomes: string[]
): { probs: Record<string, number>; scores: Pick<ForecastScores, "formatValid" | "unknownProbabilityMass" | "rawTotalProbability"> } {
  const parsed = JSON.parse(extractJsonObject(text)) as ForecastResponse;
  if (!parsed.outcome_probs || typeof parsed.outcome_probs !== "object") {
    throw new Error("Response must contain outcome_probs object");
  }

  const allowedLookup = new Map(allowedOutcomes.map((outcome) => [normalizeLabel(outcome), outcome]));
  const probs = Object.fromEntries(allowedOutcomes.map((outcome) => [outcome, 0]));
  let unknownProbabilityMass = 0;
  let rawTotalProbability = 0;

  for (const [label, rawProb] of Object.entries(parsed.outcome_probs)) {
    const prob = Number(rawProb);
    if (!Number.isFinite(prob) || prob < 0) throw new Error(`Invalid probability for ${label}`);
    rawTotalProbability += prob;
    const canonical = allowedLookup.get(normalizeLabel(label));
    if (canonical) {
      probs[canonical] += prob;
    } else {
      unknownProbabilityMass += prob;
    }
  }

  const knownTotal = Object.values(probs).reduce((sum, prob) => sum + prob, 0);
  if (knownTotal <= 0) throw new Error("Known probability mass must be positive");
  for (const outcome of allowedOutcomes) {
    probs[outcome] = probs[outcome] / knownTotal;
  }

  return {
    probs,
    scores: {
      formatValid: 1,
      unknownProbabilityMass,
      rawTotalProbability
    }
  };
}

export function scoreForecast(
  probs: Record<string, number>,
  targetOutcome: string,
  outcomes: string[]
): ForecastScores {
  const targetProb = Math.max(probs[targetOutcome] ?? 0, 1e-6);
  const brier = outcomes.reduce((sum, outcome) => {
    const target = outcome === targetOutcome ? 1 : 0;
    return sum + ((probs[outcome] ?? 0) - target) ** 2;
  }, 0);
  const topOutcome = [...outcomes].sort((a, b) => (probs[b] ?? 0) - (probs[a] ?? 0))[0];

  return {
    brier,
    logLoss: -Math.log(targetProb),
    targetProb,
    top1Correct: topOutcome === targetOutcome ? 1 : 0,
    formatValid: 1,
    unknownProbabilityMass: 0,
    rawTotalProbability: Object.values(probs).reduce((sum, prob) => sum + prob, 0)
  };
}

export function uniformForecast(outcomes: string[]): Record<string, number> {
  const p = 1 / outcomes.length;
  return Object.fromEntries(outcomes.map((outcome) => [outcome, p]));
}

function extractJsonObject(text: string): string {
  const fence = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fence?.[1]) return fence[1];
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Could not find JSON object");
  return text.slice(start, end + 1);
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
