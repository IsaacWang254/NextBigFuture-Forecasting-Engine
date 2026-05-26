import type { IngestIssue, IngestItem, LlmContextItem, LlmContextPack } from "./types.ts";

const defaultInstruction = [
  "Use this ingest context as the current external-event memory for forecasting.",
  "Treat fetchedAt as observation time and publishedAt as event time when available.",
  "Do not assume missing sources had no news; check issues for skipped or failed sources.",
  "Cite URLs from the relevant items when making claims."
].join(" ");

export interface BuildLlmContextOptions {
  generatedAt: string;
  sourceCount: number;
  maxItems?: number;
  instruction?: string;
}

export function buildLlmContextPack(
  items: IngestItem[],
  issues: IngestIssue[],
  options: BuildLlmContextOptions
): LlmContextPack {
  const llmItems = sortItemsForContext(items)
    .slice(0, options.maxItems ?? 200)
    .map(toLlmContextItem);

  return {
    generatedAt: options.generatedAt,
    sourceCount: options.sourceCount,
    itemCount: llmItems.length,
    issueCount: issues.length,
    instruction: options.instruction ?? defaultInstruction,
    items: llmItems,
    issues
  };
}

export function renderLlmContext(pack: LlmContextPack): string {
  const lines: string[] = [
    "# NBF Forecasting Engine Context",
    "",
    "## How To Use",
    pack.instruction,
    "",
    "## Run Metadata",
    `- generatedAt: ${pack.generatedAt}`,
    `- sourcesConfigured: ${pack.sourceCount}`,
    `- usableItems: ${pack.itemCount}`,
    `- issues: ${pack.issueCount}`,
    "",
    "## Items"
  ];

  if (pack.items.length === 0) {
    lines.push("- No usable items were fetched in this run.");
  } else {
    for (const item of pack.items) {
      lines.push(renderItem(item));
    }
  }

  lines.push("", "## Issues");
  if (pack.issues.length === 0) {
    lines.push("- No ingest issues reported.");
  } else {
    for (const issue of pack.issues) {
      lines.push(`- [${issue.severity}] ${issue.sourceId}: ${oneLine(issue.message, 240)}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderItem(item: LlmContextItem): string {
  const bits = [
    `source=${item.sourceId}`,
    `kind=${item.sourceKind}`,
    item.author ? `author=${item.author}` : undefined,
    item.publishedAt ? `publishedAt=${item.publishedAt}` : undefined,
    `fetchedAt=${item.fetchedAt}`
  ].filter(Boolean);
  const summary = item.summary ? ` Summary: ${oneLine(item.summary, 600)}` : "";
  return `- ${item.title} (${item.url}) [${bits.join("; ")}]${summary}`;
}

function toLlmContextItem(item: IngestItem): LlmContextItem {
  return {
    title: oneLine(item.title, 180),
    url: item.url,
    sourceId: item.sourceId,
    sourceKind: item.sourceKind,
    publishedAt: item.publishedAt,
    fetchedAt: item.fetchedAt,
    author: item.author ? oneLine(item.author, 80) : undefined,
    summary: item.summary ? oneLine(item.summary, 900) : undefined
  };
}

function sortItemsForContext(items: IngestItem[]): IngestItem[] {
  return [...items].sort((a, b) => {
    const aTime = Date.parse(a.publishedAt ?? a.fetchedAt);
    const bTime = Date.parse(b.publishedAt ?? b.fetchedAt);
    return bTime - aTime;
  });
}

function oneLine(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}
