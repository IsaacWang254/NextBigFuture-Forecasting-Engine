import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { renderTrainingMessages } from "./article-prompts.ts";
import { readJsonl, writeJsonl } from "./io.ts";
import type { FermiTrainingExample } from "./types.ts";

export interface FinalizeFermiTrainingOptions {
  examplesPath: string;
  outputPath: string;
}

if (isDirectRun()) {
  const { values } = parseArgs({
    options: {
      "examples": { type: "string", default: "data/articles/fermi-examples.jsonl" },
      "output": { type: "string", default: "data/articles/fermi-sft.jsonl" }
    }
  });
  const count = await finalizeFermiTraining({
    examplesPath: values.examples ?? "data/articles/fermi-examples.jsonl",
    outputPath: values.output ?? "data/articles/fermi-sft.jsonl"
  });
  console.log(JSON.stringify({ exampleCount: count, outputPath: values.output }, null, 2));
}

export async function finalizeFermiTraining(options: FinalizeFermiTrainingOptions): Promise<number> {
  const examples = await readJsonl<FermiTrainingExample>(options.examplesPath);
  for (const example of examples) validateFermiExample(example);
  await writeJsonl(options.outputPath, examples.map(renderTrainingMessages));
  return examples.length;
}

function validateFermiExample(example: FermiTrainingExample): void {
  if (!example.exampleId) throw new Error("Missing exampleId");
  if (!example.userQuestion) throw new Error(`${example.exampleId} missing userQuestion`);
  if (!example.assistantReasoning?.fermiDecomposition?.length) {
    throw new Error(`${example.exampleId} missing fermiDecomposition`);
  }
  if (!example.assistantReasoning.prediction) throw new Error(`${example.exampleId} missing prediction`);
}

function isDirectRun(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}
