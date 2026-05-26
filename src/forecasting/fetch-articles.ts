import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { fetchText } from "../utils.ts";
import { htmlToArticleArtifact } from "./article-extract.ts";
import { readJson, writeJsonl } from "./io.ts";
import type { ArticleArtifact, ArticleSourceManifest } from "./types.ts";

export interface FetchArticlesOptions {
  manifestPath: string;
  outputDir: string;
  timeoutMs: number;
  userAgent?: string;
}

if (isDirectRun()) {
  const { parseArgs } = await import("node:util");
  const { values } = parseArgs({
    options: {
      "manifest": { type: "string", default: "config/article-sources.nextbigfuture.json" },
      "output-dir": { type: "string", default: "data/articles" },
      "timeout-ms": { type: "string", default: "15000" }
    }
  });
  const artifacts = await fetchArticles({
    manifestPath: values.manifest ?? "config/article-sources.nextbigfuture.json",
    outputDir: values["output-dir"] ?? "data/articles",
    timeoutMs: Number(values["timeout-ms"] ?? 15000)
  });
  console.log(JSON.stringify({ articleCount: artifacts.length, outputDir: values["output-dir"] }, null, 2));
}

export async function fetchArticles(options: FetchArticlesOptions): Promise<ArticleArtifact[]> {
  const manifest = await readJson<ArticleSourceManifest>(options.manifestPath);
  const fetchedAt = new Date().toISOString();
  const rawDir = join(options.outputDir, "raw-html");
  await mkdir(rawDir, { recursive: true });

  const artifacts: ArticleArtifact[] = [];
  for (const source of manifest.sources) {
    const html = await fetchText(
      source.url,
      options.timeoutMs,
      options.userAgent ?? "NBF-Forecasting-Engine/0.1 article-fetcher"
    );
    const rawHtmlPath = join(rawDir, `${source.id}.html`);
    await writeFile(rawHtmlPath, html, "utf8");
    artifacts.push(htmlToArticleArtifact(source, html, fetchedAt, rawHtmlPath));
  }

  await writeJsonl(join(options.outputDir, "articles.jsonl"), artifacts);
  return artifacts;
}

function isDirectRun(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}
