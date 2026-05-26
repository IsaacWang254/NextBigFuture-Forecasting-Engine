export type SourceKind = "website" | "rss" | "x" | "youtube";

export interface Source {
  id: string;
  kind: SourceKind;
  url: string;
  title?: string;
  tags: string[];
  handle?: string;
}

export interface IngestItem {
  id: string;
  sourceId: string;
  sourceKind: SourceKind;
  url: string;
  title: string;
  summary?: string;
  author?: string;
  publishedAt?: string;
  fetchedAt: string;
  raw?: Record<string, unknown>;
}

export interface IngestIssue {
  sourceId: string;
  severity: "info" | "warning" | "error";
  message: string;
}

export interface FetchResult {
  source: Source;
  items: IngestItem[];
  issues: IngestIssue[];
}

export interface Fetcher {
  supports(source: Source): boolean;
  fetch(source: Source, context: IngestContext): Promise<FetchResult>;
}

export interface IngestContext {
  now: Date;
  userAgent: string;
  maxItemsPerSource: number;
  timeoutMs: number;
}

export interface IngestSummary {
  startedAt: string;
  finishedAt: string;
  sourceCount: number;
  itemCount: number;
  issueCount: number;
  outputFile: string;
  issueFile: string;
  contextFile: string;
  contextJsonFile: string;
}

export interface LlmContextPack {
  generatedAt: string;
  sourceCount: number;
  itemCount: number;
  issueCount: number;
  instruction: string;
  items: LlmContextItem[];
  issues: IngestIssue[];
}

export interface LlmContextItem {
  title: string;
  url: string;
  sourceId: string;
  sourceKind: SourceKind;
  publishedAt?: string;
  fetchedAt: string;
  author?: string;
  summary?: string;
}

export interface IngestRun {
  summary: IngestSummary;
  items: IngestItem[];
  issues: IngestIssue[];
  llmContext: LlmContextPack;
  llmContextText: string;
}
