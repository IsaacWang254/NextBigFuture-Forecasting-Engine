import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { IngestSummary } from "../types.ts";
import { readJson, readText } from "./io.ts";

export interface LoadedContextSnapshot {
  snapshotDate: string;
  contextText: string;
  contextJsonPath?: string;
  summary?: IngestSummary;
}

export async function loadContextSnapshot(
  ingestDir: string,
  snapshotDate: string
): Promise<LoadedContextSnapshot> {
  const runDir = join(ingestDir, snapshotDate);
  const contextFile = join(runDir, "llm-context.md");
  const contextJsonPath = join(runDir, "llm-context.json");
  const summaryPath = join(runDir, "summary.json");

  await assertExists(contextFile);
  const summary = await readOptionalJson<IngestSummary>(summaryPath);

  return {
    snapshotDate,
    contextText: await readText(contextFile),
    contextJsonPath: await exists(contextJsonPath) ? contextJsonPath : undefined,
    summary
  };
}

async function readOptionalJson<T>(path: string): Promise<T | undefined> {
  if (!(await exists(path))) return undefined;
  return readJson<T>(path);
}

async function assertExists(path: string): Promise<void> {
  if (!(await exists(path))) {
    throw new Error(`Missing context snapshot: ${path}`);
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
