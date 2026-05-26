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

## Forecasting Dataset

The model-training layer mirrors the golf forecasting recipe: pair a context snapshot with a resolved question, then train/evaluate strict JSON probability forecasts.

```bash
npm run dev:build-dataset -- \
  --questions config/forecast-questions.example.json \
  --ingest-dir data/raw \
  --output-dir data/forecasting
```

This writes:

- `train.jsonl`, `val.jsonl`, `heldout.jsonl`: forecasting examples.
- `sft.train.jsonl`, `sft.val.jsonl`: chat-style supervised rows.
- `dataset_manifest.json`: split metadata. Treat heldout as frozen once created.

Run the first calibration baseline:

```bash
npm run dev:eval-uniform -- --examples data/forecasting/heldout.jsonl
```

## Article-To-Fermi Training Data

Use this path for articles that already demonstrate strong forecasting logic. The pipeline fetches article text, creates LLM transformation requests, then validates finalized user/agent training rows.

```bash
npm run dev:fetch-articles -- \
  --manifest config/article-sources.nextbigfuture.json \
  --output-dir data/articles
```

Build LLM requests that ask a strong model to create Fermi-decomposition training examples:

```bash
npm run dev:select-articles -- \
  --articles data/articles/articles.jsonl \
  --output data/articles/selected-articles.jsonl \
  --report data/articles/article-selection-report.json \
  --limit 20

npm run dev:build-fermi-prompts -- \
  --articles data/articles/selected-articles.jsonl \
  --output data/articles/fermi-transform-requests.jsonl
```

The generated request asks for strict JSON with:

- `userQuestion`: a forecasting question inspired by the article.
- `assistantReasoning.summary`: the high-level framing.
- `assistantReasoning.fermiDecomposition`: smaller verifiable milestone questions.
- `assistantReasoning.evidence`: article-grounded evidence.
- `assistantReasoning.baseRatesOrComparables`: comparables when supported.
- `assistantReasoning.prediction`: the actual forecast reasoning.
- `assistantReasoning.probabilities`: optional calibrated probabilities.
- `assistantReasoning.caveats`: evidence that would change the forecast.

After an LLM fills `data/articles/fermi-examples.jsonl`, finalize chat-style SFT rows:

```bash
npm run dev:generate-fermi-examples -- \
  --articles data/articles/selected-articles.jsonl \
  --output data/articles/fermi-examples.jsonl

npm run dev:finalize-fermi-training -- \
  --examples data/articles/fermi-examples.jsonl \
  --output data/articles/fermi-sft.jsonl
```

`dev:generate-fermi-examples` creates deterministic draft rows from article evidence. Use a stronger LLM on `fermi-transform-requests.jsonl` to replace or improve those rows when you want higher-quality supervised data.

## Tinker Handoff

The Tinker preparation files live in `tinker/nbf_forecasting/`:

- `model_config.json`: 1B-class base model, LoRA rank, dataset paths, and checkpoint name.
- `reward_spec.json`: strict JSON probability forecast reward shape.
- `README.md`: SFT-then-RL training flow in the same spirit as the golf predictor.

The current filled article dataset contains:

- 26 fetched article artifacts.
- 20 selected high-reasoning articles.
- 20 Fermi transformation requests.
- 20 filled Fermi examples.
- 20 user/assistant SFT rows.

## Prediction Web App

The app is a Next.js, Radix, and Tailwind forecast console for major technology categories represented in the source list.

```bash
npm run web:dev
npm run web:build
```

The dashboard currently covers:

- AI & Compute
- Space Infrastructure
- Robotaxi & Autonomy
- Energy & Fusion
- Biotech & Longevity
- Defense & Industrial

Each question manifest row names the context snapshot date and the resolved target:

```json
{
  "id": "robotaxi-2026-05-01",
  "question": "Will Tesla launch paid unsupervised robotaxi rides in Austin before 2026-07-01?",
  "snapshotDate": "2026-05-01",
  "resolutionDate": "2026-07-01T00:00:00Z",
  "outcomes": ["yes", "no"],
  "targetOutcome": "no",
  "sourceUrls": ["https://x.com/Tesla"]
}
```
