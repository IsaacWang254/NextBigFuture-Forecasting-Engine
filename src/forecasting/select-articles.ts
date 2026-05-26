import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { dirname } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { readJsonl, writeJsonl } from "./io.ts";
import type { ArticleArtifact } from "./types.ts";

export interface SelectArticlesOptions {
  articlesPath: string;
  outputPath: string;
  reportPath: string;
  limit: number;
}

export interface ArticleSelectionScore {
  id: string;
  url: string;
  title: string;
  score: number;
  reasons: string[];
}

if (isDirectRun()) {
  const { values } = parseArgs({
    options: {
      "articles": { type: "string", default: "data/articles/articles.jsonl" },
      "output": { type: "string", default: "data/articles/selected-articles.jsonl" },
      "report": { type: "string", default: "data/articles/article-selection-report.json" },
      "limit": { type: "string", default: "20" }
    }
  });
  const report = await selectArticles({
    articlesPath: values.articles ?? "data/articles/articles.jsonl",
    outputPath: values.output ?? "data/articles/selected-articles.jsonl",
    reportPath: values.report ?? "data/articles/article-selection-report.json",
    limit: Number(values.limit ?? 20)
  });
  console.log(JSON.stringify({ selectedCount: report.selected.length, reportPath: values.report }, null, 2));
}

export async function selectArticles(options: SelectArticlesOptions): Promise<{
  selected: ArticleSelectionScore[];
  rejected: ArticleSelectionScore[];
}> {
  const articles = await readJsonl<ArticleArtifact>(options.articlesPath);
  const scored = articles
    .map((article) => ({ article, score: scoreArticle(article) }))
    .sort((a, b) => b.score.score - a.score.score);

  const selectedRows = scored.slice(0, options.limit);
  await writeJsonl(options.outputPath, selectedRows.map((row) => row.article));

  const report = {
    selected: selectedRows.map((row) => row.score),
    rejected: scored.slice(options.limit).map((row) => row.score)
  };
  await mkdir(dirname(options.reportPath), { recursive: true });
  await writeFile(options.reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}

function scoreArticle(article: ArticleArtifact): ArticleSelectionScore {
  const text = `${article.title}\n${article.text}`.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  score += addScore(countMatches(text, /\b(will|could|likely|unlikely|forecast|predict|estimate|by 20\d\d|this year|next year)\b/g), 3, "forecast language", reasons);
  score += addScore(countMatches(text, /\b(if|then|because|therefore|depends|requires|unless|constraint|bottleneck)\b/g), 2, "causal reasoning", reasons);
  score += addScore(countMatches(text, /\b(test|approval|launch|deploy|scale|revenue|cost|margin|safety|production|capacity)\b/g), 2, "observable milestones", reasons);
  score += addScore(countMatches(text, /\b\d+(?:\.\d+)?\s?(?:%|x|billion|million|mw|kw|tons|vehicles|engines|years?)\b/g), 4, "quantitative claims", reasons);
  score += Math.min(article.text.length / 2000, 5);
  if (article.publishedAt) {
    score += 1;
    reasons.push("has publication timestamp");
  }

  return {
    id: article.id,
    url: article.url,
    title: article.title,
    score: Number(score.toFixed(2)),
    reasons
  };
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function addScore(count: number, weight: number, reason: string, reasons: string[]): number {
  if (count === 0) return 0;
  reasons.push(`${reason}: ${count}`);
  return Math.min(count, 10) * weight;
}

function isDirectRun(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}
