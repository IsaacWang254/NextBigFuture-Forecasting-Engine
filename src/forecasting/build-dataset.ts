import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import type {
  ForecastDatasetManifest,
  ForecastExample,
  ForecastQuestion,
  ForecastQuestionManifest
} from "./types.ts";
import { loadContextSnapshot } from "./context-store.ts";
import { readJson, writeJson, writeJsonl } from "./io.ts";
import { renderSftRow } from "./prompt.ts";

if (isDirectRun()) {
  const { values } = parseArgs({
    options: {
      "questions": { type: "string", default: "config/forecast-questions.example.json" },
      "ingest-dir": { type: "string", default: "data/raw" },
      "output-dir": { type: "string", default: "data/forecasting" },
      "val-ratio": { type: "string", default: "0.15" },
      "heldout-ratio": { type: "string", default: "0.15" }
    }
  });

  await buildForecastDataset({
    questionsPath: values.questions ?? "config/forecast-questions.example.json",
    ingestDir: values["ingest-dir"] ?? "data/raw",
    outputDir: values["output-dir"] ?? "data/forecasting",
    valRatio: Number(values["val-ratio"] ?? 0.15),
    heldoutRatio: Number(values["heldout-ratio"] ?? 0.15)
  });
}

export interface BuildForecastDatasetOptions {
  questionsPath: string;
  ingestDir: string;
  outputDir: string;
  valRatio: number;
  heldoutRatio: number;
}

export async function buildForecastDataset(options: BuildForecastDatasetOptions): Promise<ForecastDatasetManifest> {
  const manifest = await readJson<ForecastQuestionManifest>(options.questionsPath);
  const examples = await Promise.all(
    manifest.questions.map((question) => questionToExample(question, manifest.datasetVersion, options.ingestDir))
  );
  const splits = splitExamples(examples, options.valRatio, options.heldoutRatio);

  const trainPath = join(options.outputDir, "train.jsonl");
  const valPath = join(options.outputDir, "val.jsonl");
  const heldoutPath = join(options.outputDir, "heldout.jsonl");
  await writeJsonl(trainPath, splits.train);
  await writeJsonl(valPath, splits.val);
  await writeJsonl(heldoutPath, splits.heldout);
  await writeJsonl(join(options.outputDir, "sft.train.jsonl"), splits.train.map(renderSftRow));
  await writeJsonl(join(options.outputDir, "sft.val.jsonl"), splits.val.map(renderSftRow));

  const datasetManifest: ForecastDatasetManifest = {
    datasetVersion: manifest.datasetVersion,
    createdAt: new Date().toISOString(),
    outputDir: options.outputDir,
    trainPath,
    valPath,
    heldoutPath,
    heldoutLocked: true,
    splitExampleIds: {
      train: splits.train.map((example) => example.exampleId),
      val: splits.val.map((example) => example.exampleId),
      heldout: splits.heldout.map((example) => example.exampleId)
    }
  };
  await writeJson(join(options.outputDir, "dataset_manifest.json"), datasetManifest);
  console.log(JSON.stringify(datasetManifest, null, 2));
  return datasetManifest;
}

async function questionToExample(
  question: ForecastQuestion,
  datasetVersion: string,
  ingestDir: string
): Promise<ForecastExample> {
  validateQuestion(question);
  const snapshot = await loadContextSnapshot(ingestDir, question.snapshotDate);
  return {
    exampleId: question.id,
    datasetVersion,
    question: question.question,
    category: question.category,
    snapshotTimestamp: snapshot.summary?.startedAt ?? `${question.snapshotDate}T00:00:00.000Z`,
    resolutionTimestamp: new Date(question.resolutionDate).toISOString(),
    outcomes: question.outcomes,
    targetOutcome: question.targetOutcome,
    context: snapshot.contextText,
    contextJsonPath: snapshot.contextJsonPath,
    sourceUrls: question.sourceUrls,
    notes: question.notes
  };
}

function validateQuestion(question: ForecastQuestion): void {
  if (!question.id) throw new Error("Question is missing id");
  if (!question.outcomes.includes(question.targetOutcome)) {
    throw new Error(`Question ${question.id} targetOutcome is not in outcomes`);
  }
  if (question.outcomes.length < 2) {
    throw new Error(`Question ${question.id} needs at least two outcomes`);
  }
}

function splitExamples(
  examples: ForecastExample[],
  valRatio: number,
  heldoutRatio: number
): { train: ForecastExample[]; val: ForecastExample[]; heldout: ForecastExample[] } {
  const sorted = [...examples].sort((a, b) => stableHash(a.exampleId) - stableHash(b.exampleId));
  const heldoutCount = Math.max(1, Math.floor(sorted.length * heldoutRatio));
  const valCount = Math.max(1, Math.floor(sorted.length * valRatio));
  return {
    heldout: sorted.slice(0, heldoutCount),
    val: sorted.slice(heldoutCount, heldoutCount + valCount),
    train: sorted.slice(heldoutCount + valCount)
  };
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function isDirectRun(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}
