import { parseArgs } from "node:util";
import { sources } from "./source-list.ts";
import { runIngestDetailed } from "./pipeline.ts";

const { values } = parseArgs({
  options: {
    "output-dir": { type: "string", default: "data/raw" },
    "max-items": { type: "string", default: "10" },
    "max-context-items": { type: "string", default: "200" },
    "timeout-ms": { type: "string", default: "15000" },
    "concurrency": { type: "string", default: "5" },
    "print-context": { type: "boolean", default: false }
  }
});

const run = await runIngestDetailed({
  sources,
  outputDir: values["output-dir"] ?? "data/raw",
  maxItemsPerSource: Number(values["max-items"] ?? 10),
  maxContextItems: Number(values["max-context-items"] ?? 200),
  timeoutMs: Number(values["timeout-ms"] ?? 15000),
  concurrency: Number(values.concurrency ?? 5)
});

if (values["print-context"]) {
  console.log(run.llmContextText);
} else {
  console.log(JSON.stringify(run.summary, null, 2));
}
