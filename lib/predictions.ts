export type Prediction = {
  id: string;
  category: string;
  industry: string;
  question: string;
  probability: number;
  confidence: "low" | "medium" | "high";
  horizon: string;
  movement: number;
  drivers: string[];
  caveat: string;
};

export const categories = [
  "AI & Compute",
  "Space Infrastructure",
  "Robotaxi & Autonomy",
  "Energy & Fusion",
  "Biotech & Longevity",
  "Defense & Industrial"
];

export const predictions: Prediction[] = [
  {
    id: "ai-capex-gdp",
    category: "AI & Compute",
    industry: "AI data centers",
    question: "AI infrastructure capex remains above $1T/year globally through 2028",
    probability: 0.68,
    confidence: "medium",
    horizon: "2028",
    movement: 0.06,
    drivers: ["hyperscaler capex", "power interconnect queues", "sovereign AI financing"],
    caveat: "Returns on deployed compute must stay visible in cloud and ad revenue."
  },
  {
    id: "agent-labor",
    category: "AI & Compute",
    industry: "white-collar automation",
    question: "AI agents automate at least 20% of routine software and office workflows",
    probability: 0.61,
    confidence: "medium",
    horizon: "2027",
    movement: 0.04,
    drivers: ["agent reliability", "desktop-use benchmarks", "enterprise deployment"],
    caveat: "Security and review costs may slow replacement of human labor."
  },
  {
    id: "starship-cadence",
    category: "Space Infrastructure",
    industry: "launch",
    question: "Starship reaches 50+ orbital-class launches in a calendar year",
    probability: 0.46,
    confidence: "low",
    horizon: "2028",
    movement: 0.08,
    drivers: ["booster reuse", "FAA cadence", "Raptor reliability"],
    caveat: "One major mishap or environmental review can reset the schedule."
  },
  {
    id: "moon-industrial",
    category: "Space Infrastructure",
    industry: "lunar construction",
    question: "A credible lunar construction or resource demo operates on the Moon",
    probability: 0.34,
    confidence: "low",
    horizon: "2030",
    movement: 0.02,
    drivers: ["surface power", "robotic construction", "customer demand"],
    caveat: "Launch economics alone do not prove surface operations."
  },
  {
    id: "tesla-robotaxi-scale",
    category: "Robotaxi & Autonomy",
    industry: "autonomous mobility",
    question: "Tesla operates paid robotaxi service in three or more US metros",
    probability: 0.57,
    confidence: "medium",
    horizon: "2027",
    movement: 0.05,
    drivers: ["safety data", "remote intervention rate", "state approvals"],
    caveat: "Expansion must show low support labor per active vehicle."
  },
  {
    id: "waymo-economics",
    category: "Robotaxi & Autonomy",
    industry: "autonomous mobility",
    question: "Waymo reports city-level positive gross margin",
    probability: 0.52,
    confidence: "medium",
    horizon: "2027",
    movement: -0.01,
    drivers: ["utilization", "vehicle cost", "remote operations"],
    caveat: "Gross margin disclosure may remain opaque."
  },
  {
    id: "fusion-pilot",
    category: "Energy & Fusion",
    industry: "fusion",
    question: "A private fusion company demonstrates repeatable power-plant-relevant net gain",
    probability: 0.29,
    confidence: "low",
    horizon: "2030",
    movement: 0.03,
    drivers: ["plasma performance", "materials lifetime", "funding milestones"],
    caveat: "Single-shot physics results are not equivalent to plant economics."
  },
  {
    id: "space-solar-ai",
    category: "Energy & Fusion",
    industry: "space power",
    question: "Space-based solar becomes a credible AI data-center power path",
    probability: 0.24,
    confidence: "low",
    horizon: "2032",
    movement: 0.02,
    drivers: ["launch cost", "thermal management", "orbital assembly"],
    caveat: "Terrestrial power alternatives may stay cheaper longer."
  },
  {
    id: "longevity-trials",
    category: "Biotech & Longevity",
    industry: "aging therapeutics",
    question: "A longevity therapeutic posts convincing human efficacy in an age-linked indication",
    probability: 0.41,
    confidence: "medium",
    horizon: "2029",
    movement: 0.01,
    drivers: ["clinical endpoints", "biomarker validity", "capital availability"],
    caveat: "Biomarker movement can overstate real healthspan effects."
  },
  {
    id: "defense-autonomy",
    category: "Defense & Industrial",
    industry: "autonomous systems",
    question: "Autonomous defense platforms become a top-three procurement growth category",
    probability: 0.64,
    confidence: "medium",
    horizon: "2028",
    movement: 0.07,
    drivers: ["DIU programs", "drone attrition lessons", "software-defined procurement"],
    caveat: "Procurement speed remains the dominant institutional bottleneck."
  }
];

export function categoryStats(category: string) {
  const rows = predictions.filter((prediction) => prediction.category === category);
  const average = rows.reduce((sum, prediction) => sum + prediction.probability, 0) / rows.length;
  const movement = rows.reduce((sum, prediction) => sum + prediction.movement, 0);
  return {
    count: rows.length,
    average,
    movement
  };
}
