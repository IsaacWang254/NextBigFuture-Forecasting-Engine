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
  sources: PredictionSource[];
};

export type PredictionSource = {
  label: string;
  url: string;
};

export type PredictionCategory = {
  id: string;
  label: string;
};

export const categories: PredictionCategory[] = [
  { id: "ai-compute", label: "AI & Compute" },
  { id: "space-infrastructure", label: "Space Infrastructure" },
  { id: "robotaxi-autonomy", label: "Robotaxi & Autonomy" },
  { id: "energy-fusion", label: "Energy & Fusion" },
  { id: "biotech-longevity", label: "Biotech & Longevity" },
  { id: "defense-industrial", label: "Defense & Industrial" }
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
    caveat: "Returns on deployed compute must stay visible in cloud and ad revenue.",
    sources: [
      { label: "NBF: profitable AI data build", url: "https://www.nextbigfuture.com/2026/01/profitable-ai-data-build-could-be-an-enduring-mobilization-with-18-gdp-growth.html" },
      { label: "NBF: first-principles GDP growth", url: "https://www.nextbigfuture.com/2026/02/first-principles-gdp-real-gdp-growth-via-massive-investment.html" },
      { label: "Epoch AI", url: "https://epoch.ai" }
    ]
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
    caveat: "Security and review costs may slow replacement of human labor.",
    sources: [
      { label: "NBF: AI opportunities", url: "https://www.nextbigfuture.com/2025/03/ai-opportunities.html" },
      { label: "Simon Willison", url: "https://simonwillison.net/" },
      { label: "arXiv cs.AI RSS", url: "https://rss.arxiv.org/rss/cs.AI" }
    ]
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
    caveat: "One major mishap or environmental review can reset the schedule.",
    sources: [
      { label: "NBF: 35 V3 Raptor engines", url: "https://www.nextbigfuture.com/2025/04/35-version-3-raptor-engines-on-new-spacex-starship-booster.html" },
      { label: "NBF: 33-engine static fire", url: "https://www.nextbigfuture.com/2026/04/spacex-will-have-static-fire-testing-of-all-33-engines.html" },
      { label: "SpaceX", url: "https://x.com/SpaceX" }
    ]
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
    caveat: "Launch economics alone do not prove surface operations.",
    sources: [
      { label: "NBF: Moonbase Alpha", url: "https://www.nextbigfuture.com/2026/02/how-spacex-and-xai-will-build-moonbase-alpha-and-mass-drivers.html" },
      { label: "NBF: Clavius moonbase", url: "https://www.nextbigfuture.com/2026/02/making-clavius-moonbase-for-real.html" },
      { label: "NASA NIAC", url: "https://www.nasa.gov/niac-funded-studies/" }
    ]
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
    caveat: "Expansion must show low support labor per active vehicle.",
    sources: [
      { label: "NBF: Tesla robotaxi expansion", url: "https://www.nextbigfuture.com/2025/07/tesla-robotaxi-expansion-and-comparison-to-waymo.html" },
      { label: "NBF: Tesla safety vs human", url: "https://www.nextbigfuture.com/2024/07/tesla-autopilot-fsd-and-robotaxi-safety-versus-human.html#more-196354" },
      { label: "Tesla", url: "https://x.com/Tesla" }
    ]
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
    caveat: "Gross margin disclosure may remain opaque.",
    sources: [
      { label: "NBF: Waymo vs Tesla data", url: "https://www.nextbigfuture.com/2025/12/waymo-versus-tesla-robotaxi-collision-and-incident-data.html" },
      { label: "NBF: Why Waymo and Cruise will go bankrupt", url: "https://www.nextbigfuture.com/2023/08/why-waymo-and-cruise-will-go-bankrupt.html#more-185979" },
      { label: "NBF: remote Cruise employees", url: "https://www.nextbigfuture.com/2023/11/one-and-half-remote-cruise-employees-were-supporting-each-driverless-car.html" }
    ]
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
    caveat: "Single-shot physics results are not equivalent to plant economics.",
    sources: [
      { label: "NBF: Pulsar Fusion", url: "https://www.nextbigfuture.com/2026/04/pulsar-fusion.html" },
      { label: "Fusion Industry Association reports", url: "https://www.fusionindustryassociation.org/fusion-industry-reports/" }
    ]
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
    caveat: "Terrestrial power alternatives may stay cheaper longer.",
    sources: [
      { label: "NBF: space solar for AI", url: "https://www.nextbigfuture.com/2026/03/recursively-self-improving-ai-will-have-unlimited-space-based-solar-power.html" },
      { label: "NBF: AI data build", url: "https://www.nextbigfuture.com/2026/01/profitable-ai-data-build-could-be-an-enduring-mobilization-with-18-gdp-growth.html" }
    ]
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
    caveat: "Biomarker movement can overstate real healthspan effects.",
    sources: [
      { label: "Aging Biotech companies", url: "https://agingbiotech.info/companies/" },
      { label: "Aging Biotech therapeutics", url: "https://agingbiotech.info/therapeutics/" },
      { label: "InsideTracker blog", url: "https://blog.insidetracker.com/" }
    ]
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
    caveat: "Procurement speed remains the dominant institutional bottleneck.",
    sources: [
      { label: "DIU", url: "https://www.diu.mil/" },
      { label: "AFRL News", url: "https://www.afrl.af.mil/News/" },
      { label: "Anduril", url: "https://x.com/anduriltech" }
    ]
  }
];

export function categoryStats(categoryLabel: string) {
  const rows = predictions.filter((prediction) => prediction.category === categoryLabel);
  const average = rows.length
    ? rows.reduce((sum, prediction) => sum + prediction.probability, 0) / rows.length
    : 0;
  const movement = rows.reduce((sum, prediction) => sum + prediction.movement, 0);
  return {
    count: rows.length,
    average,
    movement
  };
}
