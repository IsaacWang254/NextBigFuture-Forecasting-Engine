import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";
import { articleIdFromUrl } from "./article-extract.ts";
import { readJsonl, writeJsonl } from "./io.ts";
import type { ArticleArtifact, FermiMilestone, FermiTrainingExample } from "./types.ts";

export interface GenerateFermiExamplesOptions {
  articlesPath: string;
  outputPath: string;
}

if (isDirectRun()) {
  const { values } = parseArgs({
    options: {
      "articles": { type: "string", default: "data/articles/selected-articles.jsonl" },
      "output": { type: "string", default: "data/articles/fermi-examples.jsonl" }
    }
  });
  const count = await generateFermiExamples({
    articlesPath: values.articles ?? "data/articles/selected-articles.jsonl",
    outputPath: values.output ?? "data/articles/fermi-examples.jsonl"
  });
  console.log(JSON.stringify({ exampleCount: count, outputPath: values.output }, null, 2));
}

export async function generateFermiExamples(options: GenerateFermiExamplesOptions): Promise<number> {
  const articles = await readJsonl<ArticleArtifact>(options.articlesPath);
  const examples = articles.map(articleToFermiExample);
  await writeJsonl(options.outputPath, examples);
  return examples.length;
}

function articleToFermiExample(article: ArticleArtifact): FermiTrainingExample {
  const category = article.category ?? inferCategory(article);
  const evidence = selectEvidence(article.text);
  const comparables = selectComparables(article.text, category);
  const milestones = milestoneTemplates(category, article);
  const probabilities = categoryProbabilities(category);

  return {
    exampleId: article.id || articleIdFromUrl(article.url),
    sourceUrl: article.url,
    sourceTitle: article.title,
    category,
    userQuestion: buildUserQuestion(article, category),
    assistantReasoning: {
      summary: `I would not answer this forecast from the headline alone. The article's argument should be decomposed into concrete gates: technical progress, capital deployment, regulatory or operational permission, and observed unit economics.`,
      fermiDecomposition: milestones,
      evidence,
      baseRatesOrComparables: comparables,
      prediction: buildPrediction(article, category, probabilities),
      probabilities,
      caveats: buildCaveats(category)
    }
  };
}

function buildUserQuestion(article: ArticleArtifact, category: string): string {
  const topic = article.title.replace(/\s*\|\s*NextBigFuture\.com\s*$/i, "");
  const horizon = category.includes("space") ? "by 2030" : category.includes("robotaxi") ? "within the next two years" : "by the end of this decade";
  return `Using Fermi decomposition, what would need to be true for the thesis in "${topic}" to be mostly correct ${horizon}, and what is your forecast?`;
}

function buildPrediction(article: ArticleArtifact, category: string, probabilities: Record<string, number>): string {
  const topic = article.title.replace(/\s*\|\s*NextBigFuture\.com\s*$/i, "");
  const yes = Math.round((probabilities.yes ?? 0.5) * 100);
  const no = Math.round((probabilities.no ?? 0.5) * 100);
  return [
    `My forecast for the main thesis of "${topic}" is cautiously probabilistic rather than binary: ${yes}% yes / ${no}% no.`,
    `The article gives a useful upside case, but I would update only when the milestone questions resolve with public evidence.`,
    `The most important evidence to watch is whether claimed technical capacity turns into measured deployment, revenue, regulatory clearance, or repeatable operations.`
  ].join(" ");
}

function milestoneTemplates(category: string, article: ArticleArtifact): FermiMilestone[] {
  if (category.includes("robotaxi")) {
    return [
      milestone("m1", "Are safety outcomes at least competitive with human drivers in the deployment geography?", "Robotaxi scaling requires regulators and riders to trust observed safety, not just autonomy demos.", ["collision reports", "disengagement or intervention data", "insurance cost trends"]),
      milestone("m2", "Has remote-operator labor fallen low enough for attractive unit economics?", "High remote support can turn driverless service into expensive teleoperation.", ["remote operator to vehicle ratio", "intervention miles", "gross margin per vehicle-hour"]),
      milestone("m3", "Can the company expand geofenced service without a large bespoke mapping or operations burden?", "A robotaxi forecast depends on repeatable expansion, not a single-city pilot.", ["new market launches", "service area growth", "vehicles active per city"])
    ];
  }

  if (category.includes("space")) {
    return [
      milestone("m1", "Has the launch system achieved the cadence and cost needed for the proposed infrastructure?", "Space forecasts are usually gated by mass-to-orbit economics and repeatable launch cadence.", ["launch cadence", "payload mass delivered", "reuse and refurbishment data"]),
      milestone("m2", "Have the critical in-space construction, power, propulsion, or resource-utilization steps been demonstrated?", "Large space infrastructure requires operational demonstrations before the business case becomes credible.", ["orbital demos", "surface construction tests", "power generation and thermal data"]),
      milestone("m3", "Is there a paying customer or internal demand large enough to finance deployment?", "A technically possible architecture still needs an economic pull.", ["contracts", "capex commitments", "revenue per deployed unit"])
    ];
  }

  if (category.includes("ai")) {
    return [
      milestone("m1", "Is compute, power, and data-center capex scaling at the rate assumed by the thesis?", "AI growth forecasts depend on physical capital, not only model announcements.", ["hyperscaler capex", "power interconnection queues", "GPU or accelerator deployment"]),
      milestone("m2", "Are AI systems producing measurable productivity gains in large economic sectors?", "GDP or market forecasts require output gains outside demos.", ["revenue per employee", "software throughput", "automation of paid workflows"]),
      milestone("m3", "Do returns on AI investment remain high enough to fund continued buildout?", "If returns compress, the investment flywheel slows.", ["cloud margins", "AI revenue", "capital return disclosures"])
    ];
  }

  if (category.includes("fusion")) {
    return [
      milestone("m1", "Has the system demonstrated the claimed performance in a repeatable test?", "Fusion forecasts need measured physics performance before commercialization claims matter.", ["plasma confinement data", "net energy metrics", "peer-reviewed or third-party validation"]),
      milestone("m2", "Is the engineering path compatible with maintainable power-plant economics?", "A lab result is not enough if materials, duty cycle, or maintenance costs fail.", ["component lifetime", "thermal conversion plan", "estimated cost per watt"]),
      milestone("m3", "Is financing tied to clear technical milestones rather than broad hype?", "Capital availability is a signal but only if milestone-based.", ["funding rounds", "pilot-plant contracts", "grid connection plans"])
    ];
  }

  return [
    milestone("m1", "What measurable prerequisite must happen before the article's main thesis can be true?", "The main forecast needs at least one observable gate.", ["public deployment", "customer adoption", "independent measurement"]),
    milestone("m2", "Are costs, throughput, or performance improving fast enough to support the claimed outcome?", "Forecasts often fail because trend rates are too slow.", ["cost curves", "capacity data", "performance benchmarks"]),
    milestone("m3", "Is there enough capital, demand, and institutional permission for scale?", "Even technically sound claims need money, customers, and permission.", ["capex", "contracts", "regulatory approvals"])
  ];
}

function milestone(id: string, question: string, whyItMatters: string, observableSignals: string[]): FermiMilestone {
  return { id, question, whyItMatters, observableSignals };
}

function selectEvidence(text: string): string[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 60 && sentence.length < 320);
  const ranked = sentences
    .map((sentence) => ({ sentence, score: evidenceScore(sentence) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((row) => row.sentence);
  return ranked.length ? ranked : sentences.slice(0, 3);
}

function evidenceScore(sentence: string): number {
  const lower = sentence.toLowerCase();
  let score = 0;
  if (/\d/.test(sentence)) score += 3;
  if (/\b(will|could|forecast|predict|estimate|target|plan|by 20\d\d)\b/.test(lower)) score += 2;
  if (/\b(cost|revenue|growth|capacity|launch|safety|power|investment|data|test)\b/.test(lower)) score += 2;
  if (/\b(if|because|requires|depends|therefore|however)\b/.test(lower)) score += 1;
  return score;
}

function selectComparables(text: string, category: string): string[] {
  const lower = text.toLowerCase();
  const comparables: string[] = [];
  if (lower.includes("wwii") || lower.includes("world war")) comparables.push("WWII mobilization is used as a comparator for investment-driven production growth.");
  if (lower.includes("china")) comparables.push("China's high-growth investment period is used as a benchmark for sustained capital-led growth.");
  if (category.includes("robotaxi")) comparables.push("Waymo and Cruise provide comparables for city-by-city autonomy deployment and remote operations burden.");
  if (category.includes("space")) comparables.push("Reusable launch cadence and cost curves provide the main comparable for space infrastructure scale-up.");
  if (category.includes("ai")) comparables.push("Electricity, software, and cloud buildouts are useful comparables for general-purpose technology diffusion.");
  return comparables.length ? comparables : ["Use prior technology deployment curves as the base-rate anchor, then update on article-specific milestones."];
}

function categoryProbabilities(category: string): Record<string, number> {
  if (category.includes("robotaxi")) return { yes: 0.55, no: 0.45 };
  if (category.includes("ai")) return { yes: 0.62, no: 0.38 };
  if (category.includes("space")) return { yes: 0.42, no: 0.58 };
  if (category.includes("fusion")) return { yes: 0.32, no: 0.68 };
  return { yes: 0.5, no: 0.5 };
}

function buildCaveats(category: string): string[] {
  const common = [
    "I would update upward if independent data confirms the key milestone rather than only company statements.",
    "I would update downward if the article's assumed cost, cadence, or deployment curve stalls for multiple quarters."
  ];
  if (category.includes("robotaxi")) return [...common, "A major safety incident or regulatory pause would materially lower the forecast."];
  if (category.includes("space")) return [...common, "Launch cadence, orbital operations, and financing are separate gates; failure of any one can break the schedule."];
  if (category.includes("ai")) return [...common, "If AI capex stops producing revenue or productivity gains, the investment flywheel weakens quickly."];
  return common;
}

function inferCategory(article: ArticleArtifact): string {
  const lower = `${article.title} ${article.text}`.toLowerCase();
  if (lower.includes("robotaxi") || lower.includes("waymo")) return "robotaxi";
  if (lower.includes("spacex") || lower.includes("moon") || lower.includes("mars") || lower.includes("launch")) return "space";
  if (lower.includes("ai") || lower.includes("xai") || lower.includes("data center")) return "ai-economics";
  if (lower.includes("fusion")) return "fusion";
  return "general";
}

function isDirectRun(): boolean {
  return process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;
}
