export interface ForecastQuestionManifest {
  datasetVersion: string;
  questions: ForecastQuestion[];
}

export interface ForecastQuestion {
  id: string;
  question: string;
  snapshotDate: string;
  resolutionDate: string;
  outcomes: string[];
  targetOutcome: string;
  category?: string;
  notes?: string;
  sourceUrls: string[];
}

export interface ForecastExample {
  exampleId: string;
  datasetVersion: string;
  question: string;
  category?: string;
  snapshotTimestamp: string;
  resolutionTimestamp: string;
  outcomes: string[];
  targetOutcome: string;
  context: string;
  contextJsonPath?: string;
  sourceUrls: string[];
  notes?: string;
}

export interface ForecastDatasetManifest {
  datasetVersion: string;
  createdAt: string;
  outputDir: string;
  trainPath: string;
  valPath: string;
  heldoutPath: string;
  heldoutLocked: boolean;
  splitExampleIds: {
    train: string[];
    val: string[];
    heldout: string[];
  };
}

export interface ForecastResponse {
  outcome_probs: Record<string, number>;
}

export interface ForecastScores {
  brier: number;
  logLoss: number;
  targetProb: number;
  top1Correct: number;
  formatValid: number;
  unknownProbabilityMass: number;
  rawTotalProbability: number;
}

export interface ArticleSourceManifest {
  datasetVersion: string;
  sources: ArticleSource[];
}

export interface ArticleSource {
  id: string;
  url: string;
  category?: string;
  titleHint?: string;
  qualityHint?: string;
}

export interface ArticleArtifact {
  id: string;
  url: string;
  category?: string;
  title: string;
  publishedAt?: string;
  fetchedAt: string;
  text: string;
  rawHtmlPath?: string;
}

export interface FermiMilestone {
  id: string;
  question: string;
  whyItMatters: string;
  observableSignals: string[];
}

export interface FermiTrainingExample {
  exampleId: string;
  sourceUrl: string;
  sourceTitle: string;
  category?: string;
  userQuestion: string;
  assistantReasoning: {
    summary: string;
    fermiDecomposition: FermiMilestone[];
    evidence: string[];
    baseRatesOrComparables: string[];
    prediction: string;
    probabilities?: Record<string, number>;
    caveats: string[];
  };
}
