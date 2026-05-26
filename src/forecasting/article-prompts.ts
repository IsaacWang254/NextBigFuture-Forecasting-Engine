import type { ArticleArtifact, FermiTrainingExample } from "./types.ts";

export interface ArticleTransformRequest {
  custom_id: string;
  messages: Array<{ role: "system" | "user"; content: string }>;
  metadata: {
    articleId: string;
    sourceUrl: string;
    category?: string;
  };
}

export const fermiTransformSystemPrompt = [
  "You transform high-quality forecasting articles into training dialogues.",
  "The dialogue teaches a model to decompose predictions into smaller verifiable milestones before forecasting.",
  "Do not invent facts outside the article. If the article is speculative, preserve that uncertainty.",
  "Write in a clear user/agent style suitable for supervised fine-tuning."
].join(" ");

export function buildArticleTransformRequest(article: ArticleArtifact): ArticleTransformRequest {
  return {
    custom_id: article.id,
    metadata: {
      articleId: article.id,
      sourceUrl: article.url,
      category: article.category
    },
    messages: [
      { role: "system", content: fermiTransformSystemPrompt },
      { role: "user", content: renderArticleTransformPrompt(article) }
    ]
  };
}

export function renderArticleTransformPrompt(article: ArticleArtifact): string {
  return [
    "Create one training example from this article.",
    "",
    "The user message should ask a forecasting question inspired by the article.",
    "The assistant message should answer by doing Fermi decomposition first, then reasoning to a prediction.",
    "",
    "Return strict JSON matching this schema:",
    JSON.stringify(exampleSchema(), null, 2),
    "",
    "Rules:",
    "- Use milestones that are smaller than the main forecast and observable from public evidence.",
    "- Phrase each milestone as a question, not a vague factor.",
    "- Include base rates or comparable cases when the article supports them.",
    "- Include caveats and what evidence would change the forecast.",
    "- If a prediction cannot be resolved from the article alone, still produce calibrated reasoning rather than certainty.",
    "- Do not include markdown fences.",
    "",
    `Article title: ${article.title}`,
    `Article URL: ${article.url}`,
    `Published at: ${article.publishedAt ?? "unknown"}`,
    `Category: ${article.category ?? "general"}`,
    "",
    "Article text:",
    article.text
  ].join("\n");
}

export function renderTrainingMessages(example: FermiTrainingExample): Record<string, unknown> {
  return {
    example_id: example.exampleId,
    source_url: example.sourceUrl,
    messages: [
      {
        role: "user",
        content: example.userQuestion
      },
      {
        role: "assistant",
        content: renderAssistantReasoning(example)
      }
    ]
  };
}

export function renderAssistantReasoning(example: FermiTrainingExample): string {
  const reasoning = example.assistantReasoning;
  const probabilityLines = reasoning.probabilities
    ? Object.entries(reasoning.probabilities).map(([label, probability]) => `- ${label}: ${probability}`)
    : [];

  return [
    reasoning.summary,
    "",
    "Fermi decomposition:",
    ...reasoning.fermiDecomposition.map((milestone, index) => [
      `${index + 1}. ${milestone.question}`,
      `   Why it matters: ${milestone.whyItMatters}`,
      `   Observable signals: ${milestone.observableSignals.join("; ")}`
    ].join("\n")),
    "",
    "Evidence:",
    ...reasoning.evidence.map((item) => `- ${item}`),
    "",
    "Base rates / comparables:",
    ...reasoning.baseRatesOrComparables.map((item) => `- ${item}`),
    "",
    "Prediction:",
    reasoning.prediction,
    ...(probabilityLines.length ? ["", "Probabilities:", ...probabilityLines] : []),
    "",
    "Caveats:",
    ...reasoning.caveats.map((item) => `- ${item}`)
  ].join("\n");
}

function exampleSchema(): FermiTrainingExample {
  return {
    exampleId: "stable-slug-for-this-example",
    sourceUrl: "https://example.com/article",
    sourceTitle: "Article title",
    category: "space",
    userQuestion: "What would need to be true for X to happen by DATE, and what is your forecast?",
    assistantReasoning: {
      summary: "One paragraph framing the forecast.",
      fermiDecomposition: [
        {
          id: "m1",
          question: "Did the prerequisite milestone happen by the relevant date?",
          whyItMatters: "Why this gates the main forecast.",
          observableSignals: ["Public announcement", "Regulatory filing", "Measured deployment data"]
        }
      ],
      evidence: ["Evidence from the article."],
      baseRatesOrComparables: ["Relevant comparable or base rate."],
      prediction: "Calibrated forecast with reasoning.",
      probabilities: { yes: 0.35, no: 0.65 },
      caveats: ["What would change the forecast."]
    }
  };
}
