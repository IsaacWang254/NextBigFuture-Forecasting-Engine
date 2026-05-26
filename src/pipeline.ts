import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Fetcher, IngestContext, IngestIssue, IngestItem, IngestRun, IngestSummary, Source } from "./types.ts";
import { RssFetcher } from "./fetchers/rss.ts";
import { WebsiteFetcher } from "./fetchers/website.ts";
import { XFetcher } from "./fetchers/x.ts";
import { YouTubeFetcher } from "./fetchers/youtube.ts";
import { buildLlmContextPack, renderLlmContext } from "./llm-context.ts";

export interface RunIngestOptions {
  sources: Source[];
  outputDir: string;
  maxItemsPerSource: number;
  timeoutMs: number;
  concurrency: number;
  userAgent?: string;
  maxContextItems?: number;
  contextInstruction?: string;
}

const defaultFetchers: Fetcher[] = [
  new RssFetcher(),
  new WebsiteFetcher(),
  new YouTubeFetcher(),
  new XFetcher()
];

export async function runIngest(options: RunIngestOptions): Promise<IngestSummary> {
  const run = await runIngestDetailed(options);
  return run.summary;
}

export async function runIngestDetailed(options: RunIngestOptions): Promise<IngestRun> {
  const startedAt = new Date();
  const context: IngestContext = {
    now: startedAt,
    userAgent: options.userAgent ?? "NBF-Forecasting-Engine/0.1 (+https://github.com/local/nbf-forecasting-engine)",
    maxItemsPerSource: options.maxItemsPerSource,
    timeoutMs: options.timeoutMs
  };

  const results = await mapConcurrent(options.sources, options.concurrency, async (source) => {
    const fetcher = defaultFetchers.find((candidate) => candidate.supports(source));
    if (!fetcher) {
      return {
        source,
        items: [],
        issues: [{ sourceId: source.id, severity: "error" as const, message: `No fetcher for ${source.kind}` }]
      };
    }
    return fetcher.fetch(source, context);
  });

  const items = dedupeItems(results.flatMap((result) => result.items));
  const issues = results.flatMap((result) => result.issues);
  const datePart = startedAt.toISOString().slice(0, 10);
  const runDir = join(options.outputDir, datePart);
  await mkdir(runDir, { recursive: true });

  const outputFile = join(runDir, "items.jsonl");
  const issueFile = join(runDir, "issues.jsonl");
  const contextFile = join(runDir, "llm-context.md");
  const contextJsonFile = join(runDir, "llm-context.json");
  await writeJsonl(outputFile, items);
  await writeJsonl(issueFile, issues);

  const llmContext = buildLlmContextPack(items, issues, {
    generatedAt: startedAt.toISOString(),
    sourceCount: options.sources.length,
    maxItems: options.maxContextItems,
    instruction: options.contextInstruction
  });
  const llmContextText = renderLlmContext(llmContext);
  await writeFile(contextFile, llmContextText, "utf8");
  await writeFile(contextJsonFile, `${JSON.stringify(llmContext, null, 2)}\n`, "utf8");

  const summary: IngestSummary = {
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    sourceCount: options.sources.length,
    itemCount: items.length,
    issueCount: issues.length,
    outputFile,
    issueFile,
    contextFile,
    contextJsonFile
  };
  await writeFile(join(runDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  return {
    summary,
    items,
    issues,
    llmContext,
    llmContextText
  };
}

export async function ingestForLlmContext(options: RunIngestOptions): Promise<string> {
  const run = await runIngestDetailed(options);
  return run.llmContextText;
}

async function writeJsonl(file: string, rows: Array<IngestItem | IngestIssue>): Promise<void> {
  await writeFile(file, rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : ""), "utf8");
}

function dedupeItems(items: IngestItem[]): IngestItem[] {
  const seen = new Set<string>();
  const unique: IngestItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique;
}

async function mapConcurrent<T, U>(
  values: T[],
  concurrency: number,
  worker: (value: T) => Promise<U>
): Promise<U[]> {
  const results: U[] = [];
  let index = 0;

  async function runWorker(): Promise<void> {
    while (index < values.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await worker(values[currentIndex]);
    }
  }

  const workerCount = Math.min(Math.max(concurrency, 1), values.length);
  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
  return results;
}
