import type { Fetcher, FetchResult, IngestContext, IngestItem, Source } from "../types.ts";
import { cleanText, fetchText, firstMatch, resolveUrl, stableId, toIsoDate } from "../utils.ts";

export class RssFetcher implements Fetcher {
  supports(source: Source): boolean {
    return source.kind === "rss";
  }

  async fetch(source: Source, context: IngestContext): Promise<FetchResult> {
    try {
      const xml = await fetchText(source.url, context.timeoutMs, context.userAgent);
      return {
        source,
        items: parseFeed(xml, source, context).slice(0, context.maxItemsPerSource),
        issues: []
      };
    } catch (error) {
      return {
        source,
        items: [],
        issues: [{ sourceId: source.id, severity: "error", message: String(error) }]
      };
    }
  }
}

export function parseFeed(xml: string, source: Source, context: IngestContext): IngestItem[] {
  const itemBlocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const entryBlocks = [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  const blocks = itemBlocks.length > 0 ? itemBlocks : entryBlocks;

  return blocks.map((block) => {
    const link = firstMatch(block, [
      /<link>([\s\S]*?)<\/link>/i,
      /<link\b[^>]*href=["']([^"']+)["'][^>]*>/i,
      /<guid\b[^>]*>([\s\S]*?)<\/guid>/i
    ]);
    const url = resolveUrl(source.url, link) ?? source.url;
    const title = cleanText(firstMatch(block, [/<title>([\s\S]*?)<\/title>/i])) ?? url;
    const summary = cleanText(firstMatch(block, [
      /<description>([\s\S]*?)<\/description>/i,
      /<summary>([\s\S]*?)<\/summary>/i,
      /<content:encoded>([\s\S]*?)<\/content:encoded>/i
    ]));
    const publishedAt = toIsoDate(firstMatch(block, [
      /<pubDate>([\s\S]*?)<\/pubDate>/i,
      /<published>([\s\S]*?)<\/published>/i,
      /<updated>([\s\S]*?)<\/updated>/i,
      /<dc:date>([\s\S]*?)<\/dc:date>/i
    ]));

    return {
      id: stableId([source.id, url, title, publishedAt ?? ""]),
      sourceId: source.id,
      sourceKind: source.kind,
      url,
      title,
      summary,
      publishedAt,
      fetchedAt: context.now.toISOString()
    };
  });
}
