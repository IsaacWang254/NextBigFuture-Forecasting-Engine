# NBF Forecasting Engine

Comprehensive LLM predictor and news data pipeline to ingest the latest events and make predictions.

## Data Ingest

The TypeScript ingest pipeline is source-driven and writes newline-delimited JSON to `data/raw/YYYY-MM-DD/`.

```bash
npm install
npm run build
npm run ingest
```

Useful options:

```bash
npm run ingest -- --max-items 20 --concurrency 8 --timeout-ms 20000
```

Outputs:

- `items.jsonl`: normalized posts, feed entries, videos, and web page snapshots.
- `issues.jsonl`: fetch errors, skipped sources, and discovered feed hints.
- `llm-context.md`: paste-ready context for an LLM that cannot use files or tools.
- `llm-context.json`: structured version of the same LLM context pack.
- `summary.json`: run-level counts and file paths.

To print the LLM context directly to stdout:

```bash
npm run ingest -- --print-context --max-context-items 100
```

Programmatic use:

```ts
import { ingestForLlmContext, sources } from "./src/index.ts";

const context = await ingestForLlmContext({
  sources,
  outputDir: "data/raw",
  maxItemsPerSource: 10,
  maxContextItems: 100,
  timeoutMs: 15000,
  concurrency: 5
});

// Inject `context` directly into a model prompt or agent memory.
```

X sources use the official API when `X_BEARER_TOKEN` is available:

```bash
X_BEARER_TOKEN=... npm run ingest
```

Without that token, X sources are skipped with warning records so scheduled runs still complete.
