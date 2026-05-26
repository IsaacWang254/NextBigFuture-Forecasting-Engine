import type { Fetcher, FetchResult, IngestContext, IngestItem, Source } from "../types.ts";
import { stableId } from "../utils.ts";

interface XUserResponse {
  data?: { id: string; username: string; name: string };
  errors?: Array<{ detail?: string; title?: string }>;
}

interface XTimelineResponse {
  data?: Array<{
    id: string;
    text: string;
    created_at?: string;
    author_id?: string;
  }>;
  errors?: Array<{ detail?: string; title?: string }>;
}

export class XFetcher implements Fetcher {
  supports(source: Source): boolean {
    return source.kind === "x";
  }

  async fetch(source: Source, context: IngestContext): Promise<FetchResult> {
    const token = process.env.X_BEARER_TOKEN;
    if (!token) {
      return {
        source,
        items: [],
        issues: [{
          sourceId: source.id,
          severity: "warning",
          message: "Skipped X source because X_BEARER_TOKEN is not set"
        }]
      };
    }

    try {
      const username = source.handle;
      if (!username) throw new Error("Missing X username");

      const user = await getJson<XUserResponse>(
        `https://api.x.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=name,username`,
        token,
        context
      );
      if (!user.data) throw new Error(formatXError(user.errors) ?? "X user lookup returned no data");

      const timeline = await getJson<XTimelineResponse>(
        `https://api.x.com/2/users/${user.data.id}/tweets?max_results=${context.maxItemsPerSource}&tweet.fields=created_at,author_id`,
        token,
        context
      );
      const items: IngestItem[] = (timeline.data ?? []).map((tweet) => ({
        id: stableId([source.id, tweet.id]),
        sourceId: source.id,
        sourceKind: "x",
        url: `https://x.com/${user.data?.username}/status/${tweet.id}`,
        title: tweet.text.split(/\n/)[0]?.slice(0, 120) || `Post ${tweet.id}`,
        summary: tweet.text,
        author: user.data?.name,
        publishedAt: tweet.created_at,
        fetchedAt: context.now.toISOString(),
        raw: { tweetId: tweet.id, authorId: tweet.author_id }
      }));

      return {
        source,
        items,
        issues: timeline.errors?.length
          ? [{ sourceId: source.id, severity: "warning", message: formatXError(timeline.errors) ?? "X returned partial errors" }]
          : []
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

async function getJson<T>(url: string, token: string, context: IngestContext): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), context.timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "authorization": `Bearer ${token}`,
        "user-agent": context.userAgent
      }
    });
    if (!response.ok) throw new Error(`X API HTTP ${response.status} ${response.statusText}`);
    return await response.json() as T;
  } finally {
    clearTimeout(timer);
  }
}

function formatXError(errors: XUserResponse["errors"]): string | undefined {
  if (!errors?.length) return undefined;
  return errors.map((error) => error.detail ?? error.title).filter(Boolean).join("; ");
}
