import type { Fetcher, FetchResult, IngestContext, Source } from "../types.ts";
import { fetchText, firstMatch, resolveUrl, stableId } from "../utils.ts";

export class WebsiteFetcher implements Fetcher {
  supports(source: Source): boolean {
    return source.kind === "website";
  }

  async fetch(source: Source, context: IngestContext): Promise<FetchResult> {
    try {
      const html = await fetchText(source.url, context.timeoutMs, context.userAgent);
      const title = firstMatch(html, [
        /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<title>([\s\S]*?)<\/title>/i
      ]) ?? source.title ?? source.url;
      const summary = firstMatch(html, [
        /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        /<meta\b[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i
      ]);
      const feedUrl = findFeedUrl(html, source.url);

      return {
        source,
        items: [{
          id: stableId([source.id, source.url, title]),
          sourceId: source.id,
          sourceKind: source.kind,
          url: source.url,
          title,
          summary,
          fetchedAt: context.now.toISOString(),
          raw: feedUrl ? { discoveredFeedUrl: feedUrl } : undefined
        }],
        issues: feedUrl ? [{
          sourceId: source.id,
          severity: "info",
          message: `Discovered feed: ${feedUrl}`
        }] : []
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

function findFeedUrl(html: string, baseUrl: string): string | undefined {
  const feedHref = firstMatch(html, [
    /<link\b[^>]*type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    /<link\b[^>]*href=["']([^"']+)["'][^>]*type=["']application\/rss\+xml["'][^>]*>/i,
    /<link\b[^>]*type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["'][^>]*>/i,
    /<link\b[^>]*href=["']([^"']+)["'][^>]*type=["']application\/atom\+xml["'][^>]*>/i
  ]);
  return resolveUrl(baseUrl, feedHref);
}
