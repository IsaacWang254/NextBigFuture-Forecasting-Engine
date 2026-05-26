import type { Fetcher, FetchResult, IngestContext, Source } from "../types.ts";
import { parseFeed } from "./rss.ts";
import { fetchText, firstMatch } from "../utils.ts";

export class YouTubeFetcher implements Fetcher {
  supports(source: Source): boolean {
    return source.kind === "youtube";
  }

  async fetch(source: Source, context: IngestContext): Promise<FetchResult> {
    try {
      const page = await fetchText(source.url, context.timeoutMs, context.userAgent);
      const channelId = firstMatch(page, [
        /"channelId":"([^"]+)"/,
        /<meta\b[^>]*itemprop=["']channelId["'][^>]*content=["']([^"']+)["'][^>]*>/i
      ]);
      if (!channelId) {
        return {
          source,
          items: [],
          issues: [{ sourceId: source.id, severity: "warning", message: "Could not discover YouTube channel id" }]
        };
      }

      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
      const xml = await fetchText(feedUrl, context.timeoutMs, context.userAgent);
      const feedSource = { ...source, kind: "youtube" as const, url: feedUrl };
      return {
        source,
        items: parseFeed(xml, feedSource, context).map((item) => ({ ...item, sourceId: source.id, sourceKind: "youtube" })),
        issues: [{ sourceId: source.id, severity: "info", message: `Resolved YouTube feed: ${feedUrl}` }]
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
