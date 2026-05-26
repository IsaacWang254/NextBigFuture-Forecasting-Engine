import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { buildArticleTransformRequest } from "./article-prompts.ts";
import { readJsonl, writeJsonl } from "./io.ts";
import type { ArticleArtifact } from "./types.ts";

export interface BuildFermiPromptsOptions {
  articlesPath: string;
  outputPath: string;
}

if (isDirectRun()) {
  const { values } = parseArgs({
    options: {
      "articles": { type: "string", default: "data/articles/articles.jsonl" },
      "output": { type: "string", default: "data/articles/fermi-transform-requests.jsonl" }
    }
  });
  const count = await buildFermiPrompts({
    articlesPath: values.articles ?? "data/articles/articles.jsonl",
    outputPath: values.output ?? "data/articles/fermi-transform-requests.jsonl"
  });
  console.log(JSON.stringify({ requestCount: count, outputPath: values.output }, null, 2));
}

export async function buildFermiPrompts(options: BuildFermiPromptsOptions): Promise<number> {
  const articles = await readJsonl<ArticleArtifact>(options.articlesPath);
  const requests = articles.map(buildArticleTransformRequest);
  await writeJsonl(options.outputPath, requests);
  return requests.length;
}

function isDirectRun(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}
