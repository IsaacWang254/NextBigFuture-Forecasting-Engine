import type { Source, SourceKind } from "./types.ts";

const rawUrls = [
  "https://simonwillison.net/",
  "https://x.com/RohOnChain",
  "https://epoch.ai",
  "https://x.com/Similarweb",
  "https://x.com/CernBasher",
  "https://www.youtube.com/@allin",
  "https://x.com/theallinpod",
  "https://x.com/planet4589",
  "https://x.com/StockSavvyShay",
  "https://x.com/Speculator_io",
  "https://rss.arxiv.org/rss/cs.AI",
  "https://x.com/seti_park",
  "https://x.com/elonmusk",
  "https://x.com/tslaming",
  "https://x.com/rasbt",
  "https://x.com/Scobleizer",
  "https://x.com/dair_ai",
  "https://x.com/karpathy",
  "https://x.com/CathieDWood",
  "https://x.com/ARK_Funds",
  "https://x.com/SpaceX",
  "https://x.com/Starlink",
  "https://x.com/robotaxi",
  "https://x.com/NASAAdmin",
  "https://x.com/NASA",
  "https://x.com/nextbigfuture",
  "https://www.fusionindustryassociation.org/fusion-industry-reports/",
  "https://www.youtube.com/@FusionIndustryAssociation",
  "https://x.com/QCWare",
  "https://x.com/qctrlHQ",
  "https://x.com/DavidOndrej1",
  "https://x.com/alojoh",
  "https://x.com/PeterDiamandis",
  "https://www.nasa.gov/niac-funded-studies/",
  "https://quantumcomputingreport.com/news/",
  "https://x.com/preskill",
  "https://x.com/SERobinsonJr",
  "https://x.com/TheHumanoidHub",
  "https://x.com/LimitingThe",
  "https://x.com/drfeifei",
  "https://x.com/AST_SpaceMobile",
  "https://x.com/Dr_Singularity",
  "https://x.com/xAIMemphis",
  "https://x.com/xai",
  "https://x.com/DarioAmodei",
  "https://x.com/andy_l_jones",
  "https://x.com/GoogleDeepMind",
  "https://x.com/AIatMeta",
  "https://x.com/PalmerLuckey",
  "https://x.com/alexwg",
  "https://x.com/PalantirTech",
  "https://x.com/sama",
  "https://x.com/demishassabis",
  "https://x.com/payloadspace",
  "https://payloadspace.com/",
  "https://x.com/DIU_x",
  "https://x.com/DefenseScoop",
  "https://x.com/BreakingDefense",
  "https://x.com/SpaceNews_Inc",
  "https://x.com/NASAWatch",
  "https://www.diu.mil/",
  "https://www.afrl.af.mil/News/",
  "https://payloadspace.com/",
  "https://x.com/CernBasher",
  "https://x.com/bradsferguson",
  "https://x.com/aaronburnett",
  "https://x.com/VladSaigau",
  "https://x.com/StockSavvyShay",
  "https://cnevpost.com",
  "https://tracxn.com/d/companies",
  "https://blog.insidetracker.com/",
  "https://x.com/KarlPfleger",
  "https://agingbiotech.info/companies/",
  "https://agingbiotech.info/therapeutics/",
  "https://agingbiotech.info/databases/",
  "https://agingbiotech.info/people/",
  "https://x.com/argonne",
  "https://x.com/aubreydegrey",
  "https://x.com/foresightinst",
  "https://x.com/anduriltech",
  "https://x.com/DARPA",
  "https://research.33fg.com/feed",
  "https://x.com/SawyerMerritt",
  "https://developspace.info/",
  "https://www.technologyreview.com/",
  "https://x.com/teslaownersSV",
  "https://space.skyrocket.de/index.html",
  "https://projectrho.com/public_html/rocket/",
  "https://www.centauri-dreams.org/",
  "https://x.com/AFOSR",
  "https://x.com/SemiAnalysis_",
  "https://semianalysis.com/",
  "https://fabricatedknowledge.com/",
  "https://x.com/dylan522p",
  "https://www.angstronomics.com/",
  "https://www.asianometry.com/",
  "https://semiengineering.com/",
  "https://semiwiki.com/",
  "https://thechipletter.substack.com/",
  "https://x.com/chamath",
  "https://x.com/IonQ_Inc",
  "https://x.com/CoreWeave",
  "https://x.com/DbrxMosaicAI",
  "https://x.com/Tesla",
  "https://x.com/a16z",
  "https://x.com/pmarca",
  "https://lifearchitect.ai/",
  "https://arena.ai/leaderboard/text"
];

export const sources: Source[] = [...new Set(rawUrls)].map((url) => {
  const parsed = new URL(url);
  const kind = inferKind(parsed);
  const handle = kind === "x" ? parsed.pathname.split("/").filter(Boolean)[0] : undefined;
  return {
    id: createSourceId(parsed),
    kind,
    url,
    title: handle,
    tags: inferTags(url),
    handle
  };
});

function inferKind(url: URL): SourceKind {
  if (url.hostname === "x.com" || url.hostname === "twitter.com") return "x";
  if (url.hostname.includes("youtube.com")) return "youtube";
  if (url.pathname.endsWith("/feed") || url.pathname.includes("/rss/") || url.hostname.startsWith("rss.")) {
    return "rss";
  }
  return "website";
}

function createSourceId(url: URL): string {
  const parts = [url.hostname.replace(/^www\./, ""), ...url.pathname.split("/").filter(Boolean)];
  return parts.join(":").replace(/[^a-zA-Z0-9:_-]+/g, "-").toLowerCase();
}

function inferTags(url: string): string[] {
  const lower = url.toLowerCase();
  const tags = new Set<string>();

  if (lower.includes("space") || lower.includes("nasa") || lower.includes("rocket") || lower.includes("payload")) tags.add("space");
  if (lower.includes("ai") || lower.includes("deepmind") || lower.includes("karpathy") || lower.includes("arxiv")) tags.add("ai");
  if (lower.includes("tesla") || lower.includes("tsla") || lower.includes("cnev")) tags.add("ev");
  if (lower.includes("quantum") || lower.includes("qctrl") || lower.includes("qcware") || lower.includes("ionq")) tags.add("quantum");
  if (lower.includes("fusion")) tags.add("fusion");
  if (lower.includes("bio") || lower.includes("aging") || lower.includes("lifearchitect") || lower.includes("insidetracker")) tags.add("biotech");
  if (lower.includes("semi") || lower.includes("chip") || lower.includes("angstronomics")) tags.add("semiconductors");
  if (lower.includes("defense") || lower.includes("diu") || lower.includes("darpa") || lower.includes("anduril") || lower.includes("afrl")) tags.add("defense");

  return [...tags].sort();
}
