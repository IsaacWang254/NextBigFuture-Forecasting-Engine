import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import type { ForecastExample } from "./types.ts";
import { readJsonl, writeJson } from "./io.ts";
import { scoreForecast, uniformForecast } from "./scoring.ts";

if (isDirectRun()) {
  const { values } = parseArgs({
    options: {
      "examples": { type: "string", default: "data/forecasting/heldout.jsonl" },
      "output": { type: "string", default: "data/forecasting/uniform-baseline.metrics.json" }
    }
  });

  const metrics = await evalUniformBaseline({
    examplesPath: values.examples ?? "data/forecasting/heldout.jsonl",
    outputPath: values.output ?? "data/forecasting/uniform-baseline.metrics.json"
  });
  console.log(JSON.stringify(metrics, null, 2));
}

export interface EvalUniformBaselineOptions {
  examplesPath: string;
  outputPath: string;
}

export async function evalUniformBaseline(options: EvalUniformBaselineOptions): Promise<Record<string, number>> {
  const examples = await readJsonl<ForecastExample>(options.examplesPath);
  const rows = examples.map((example) => {
    const probs = uniformForecast(example.outcomes);
    return scoreForecast(probs, example.targetOutcome, example.outcomes);
  });

  const metrics = {
    exampleCount: examples.length,
    brier: mean(rows.map((row) => row.brier)),
    logLoss: mean(rows.map((row) => row.logLoss)),
    targetProb: mean(rows.map((row) => row.targetProb)),
    top1Accuracy: mean(rows.map((row) => row.top1Correct))
  };

  await writeJson(options.outputPath, metrics);
  return metrics;
}

function mean(valuesToAverage: number[]): number {
  if (valuesToAverage.length === 0) return 0;
  return valuesToAverage.reduce((sum, value) => sum + value, 0) / valuesToAverage.length;
}

function isDirectRun(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}
