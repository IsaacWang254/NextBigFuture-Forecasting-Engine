import { createHash } from "node:crypto";
import { cleanText, firstMatch } from "../utils.ts";
import type { ArticleArtifact, ArticleSource } from "./types.ts";

export function articleIdFromUrl(url: string): string {
  const parsed = new URL(url);
  const slug = parsed.pathname.split("/").filter(Boolean).at(-1) ?? parsed.hostname;
  const readable = slug.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 8);
  return `${readable || "article"}-${hash}`;
}

export function htmlToArticleArtifact(
  source: ArticleSource,
  html: string,
  fetchedAt: string,
  rawHtmlPath?: string
): ArticleArtifact {
  return {
    id: source.id || articleIdFromUrl(source.url),
    url: source.url,
    category: source.category,
    title: extractTitle(html) ?? source.titleHint ?? source.url,
    publishedAt: extractPublishedAt(html),
    fetchedAt,
    text: extractArticleText(html),
    rawHtmlPath
  };
}

export function extractTitle(html: string): string | undefined {
  return firstMatch(html, [
    /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta\b[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<h1\b[^>]*>([\s\S]*?)<\/h1>/i,
    /<title>([\s\S]*?)<\/title>/i
  ]);
}

export function extractPublishedAt(html: string): string | undefined {
  const raw = firstMatch(html, [
    /<meta\b[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta\b[^>]*name=["']date["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<time\b[^>]*datetime=["']([^"']+)["'][^>]*>/i
  ]);
  if (!raw) return undefined;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed.toISOString();
}

export function extractArticleText(html: string): string {
  const article = firstMatch(html, [
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<main\b[^>]*>([\s\S]*?)<\/main>/i,
    /<body\b[^>]*>([\s\S]*?)<\/body>/i
  ]) ?? html;

  const stripped = article
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(p|h1|h2|h3|li|blockquote)\b[^>]*>/gi, "\n")
    .replace(/<\/(p|h1|h2|h3|li|blockquote)>/gi, "\n");

  return cleanText(stripped)?.slice(0, 24000) ?? "";
}
