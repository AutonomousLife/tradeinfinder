import {
  acquisitionSources,
  alertSubscriptions,
  devices,
  merchants,
  offers,
  rawIngestRecords,
  savedScenarios,
  topUpgradeComparisons,
  watchedItems,
} from "@/lib/seed-data";
import { formatCurrency } from "@/lib/format";
import { buildPathLinks } from "@/lib/links";
import type {
  AcquisitionSource,
  AdminModel,
  ArbitrageExplorerModel,
  ComparePageModel,
  DashboardModel,
  Device,
  DevicePageModel,
  Merchant,
  MerchantPageModel,
  MethodologyModel,
  Offer,
  OfferPageModel,
  RankedPath,
  TradeInFinderModel,
  UpgradeBoard,
} from "@/lib/schema";

const delayedTypes = new Set(["bill_credit"]);
const instantTypes = new Set(["cash", "store_credit", "instant"]);

type PathSort = "best-net" | "highest-credit" | "lowest-risk" | "highest-confidence" | "instant";

type PathFilterOptions = {
  tradeInType?: Offer["tradeInType"] | "all";
  instantOnly?: boolean;
  excludeNewLine?: boolean;
  sortBy?: PathSort;
  unlockedOnly?: boolean;
};

function getDevice(slug: string) {
  return devices.find((device) => device.slug === slug) ?? devices[0];
}

function getMerchant(slug?: string) {
  if (!slug) return undefined;
  return merchants.find((merchant) => merchant.slug === slug);
}

function merchantById(id: string) {
  return merchants.find((merchant) => merchant.id === id) ?? merchants[0];
}

function deviceById(id: string) {
  return devices.find((device) => device.id === id);
}

function acquisitionForDevice(deviceSlug: string, condition: string) {
  const device = devices.find((entry) => entry.slug === deviceSlug);
  if (!device) return null;

  return (
    acquisitionSources.find(
      (source) => source.deviceId === device.id && source.condition === condition,
    ) ?? null
  );
}

function conditionPenalty(condition: string) {
  if (condition === "mint") return 0;
  if (condition === "good") return 30;
  if (condition === "fair") return 70;
  return 150;
}

function delayPenalty(offer: Offer) {
  if (offer.tradeInType !== "bill_credit" || !offer.months) return 0;
  return Math.round(offer.tradeInValue * 0.22);
}

function lockInPenalty(offer: Offer) {
  let penalty = 0;
  if (offer.newLineRequired) penalty += 90;
  if (offer.installmentRequired) penalty += 70;
  if (offer.eligiblePlanRequired) penalty += 60;
  if (offer.activationRequired) penalty += 30;
  if (offer.onlineOnly) penalty += 10;
  if (offer.inStoreOnly) penalty += 15;
  if (offer.unlockedRequired) penalty += 18;
  return penalty;
}

function acquisitionRisk(acquisition: AcquisitionSource | null) {
  if (!acquisition) return 0;
  return Math.round((1 - acquisition.sellerRatingOrConfidence) * 120);
}

function biggestCaveat(offer: Offer) {
  if (offer.newLineRequired) return "Requires a new line.";
  if (offer.tradeInType === "bill_credit" && offer.months) {
    return `${offer.months}-month bill credits delay value realization.`;
  }
  if (offer.eligiblePlanRequired) return "Requires an eligible premium plan.";
  if (offer.onlineOnly) return "Online-only stock and pricing can shift.";
  if (offer.unlockedRequired) return "Unlocked device required.";
  return "Trade-in inspection can still affect final value.";
}

function offerTags(offer: Offer) {
  const tags = [
    offer.tradeInType === "bill_credit"
      ? "Bill credits"
      : offer.tradeInType === "store_credit"
        ? "Store credit"
        : offer.tradeInType === "cash" || offer.tradeInType === "instant"
          ? "Instant value"
          : "Promo credit",
    offer.sourceType === "verified"
      ? "Verified"
      : offer.sourceType === "estimated"
        ? "Estimated"
        : "Manual",
  ];

  if (offer.newLineRequired) tags.push("New line required");
  if (offer.installmentRequired) tags.push("Installment required");
  if (offer.eligiblePlanRequired) tags.push("Eligible plan required");
  if (offer.onlineOnly) tags.push("Online only");
  if (offer.inStoreOnly) tags.push("In-store only");
  if (offer.unlockedRequired) tags.push("Unlocked required");

  return tags;
}

function classifyRisk(score: number, offer: Offer) {
  if (score > 0.72 && !offer.newLineRequired && !offer.installmentRequired) return "low" as const;
  if (score > 0.52) return "medium" as const;
  return "high" as const;
}

function rankPath(args: {
  currentDevice: Device;
  targetDevice: Device;
  offer: Offer;
  condition: string;
  merchant: Merchant;
  acquisition: AcquisitionSource | null;
}): RankedPath {
  const acquisitionCost = args.acquisition?.estimatedPrice ?? 0;
  const conditionDrag = conditionPenalty(args.condition);
  const delayDrag = delayPenalty(args.offer);
  const lockInDrag = lockInPenalty(args.offer);
  const riskDrag = acquisitionRisk(args.acquisition);
  const tradeInGross = Math.max(args.offer.tradeInValue - conditionDrag, 0);
  const netValue = tradeInGross - acquisitionCost - delayDrag - lockInDrag - riskDrag;
  const instantValue = delayedTypes.has(args.offer.tradeInType)
    ? Math.round(tradeInGross * 0.72)
    : tradeInGross;
  const effectiveUpgradeCost = Math.max(args.targetDevice.msrp - netValue, 0);
  const confidence =
    args.offer.confidenceScore *
    args.merchant.trustScore *
    (args.acquisition ? args.acquisition.sellerRatingOrConfidence : 1);
  const trustAdjustedScore =
    netValue * 0.52 +
    instantValue * 0.2 +
    confidence * 100 * 0.16 +
    args.merchant.trustScore * 100 * 0.12;

  return {
    slug: `${args.currentDevice.slug}-${args.offer.slug}${args.acquisition ? "-arb" : ""}`,
    label: `${args.merchant.name} -> ${args.targetDevice.model}`,
    summary: `${formatCurrency(tradeInGross)} effective trade-in value into ${args.targetDevice.model}`,
    reasonBadge: delayedTypes.has(args.offer.tradeInType)
      ? "Best Net Value"
      : instantTypes.has(args.offer.tradeInType)
        ? "Best Instant Cash"
        : "Best Promo Credit",
    device: args.currentDevice,
    merchant: args.merchant,
    offer: args.offer,
    acquisition: args.acquisition,
    netValue,
    effectiveUpgradeCost,
    instantValue,
    confidence,
    trustAdjustedScore,
    biggestCaveat: biggestCaveat(args.offer),
    explanation: `Net value starts at ${formatCurrency(tradeInGross)}, then subtracts acquisition cost, bill-credit drag, and lock-in friction.`,
    tags: offerTags(args.offer),
    riskLevel: classifyRisk(confidence, args.offer),
    valueTimelineLabel:
      args.offer.tradeInType === "bill_credit" && args.offer.months
        ? `${args.offer.months} month timeline`
        : "Immediate value",
    links: buildPathLinks({
      acquisition: args.acquisition,
      merchant: args.merchant,
      targetDeviceSlug: args.targetDevice.slug,
    }),
  };
}

function relevantOffers(
  currentDeviceSlug: string,
  condition: string,
  targetDeviceSlug?: string,
  merchantSlug?: string,
) {
  return offers.filter((offer) => {
    const matchesDevice = offer.acceptedTradeInDevices.includes(currentDeviceSlug);
    const matchesCondition = offer.acceptedConditions.includes(
      condition as Offer["acceptedConditions"][number],
    );
    const matchesTarget = targetDeviceSlug ? offer.targetDeviceSlug === targetDeviceSlug : true;
    const matchesMerchant = merchantSlug ? offer.merchantId === merchantSlug : true;
    return matchesDevice && matchesCondition && matchesTarget && matchesMerchant;
  });
}

function pathSortValue(path: RankedPath, sortBy: PathSort = "best-net") {
  if (sortBy === "highest-credit") return path.offer.tradeInValue;
  if (sortBy === "lowest-risk") return path.confidence * 100 - (path.offer.newLineRequired ? 20 : 0) - (path.offer.installmentRequired ? 15 : 0);
  if (sortBy === "highest-confidence") return path.confidence * 100;
  if (sortBy === "instant") return path.instantValue;
  return path.trustAdjustedScore;
}

function applyPathFilters(paths: RankedPath[], options: PathFilterOptions = {}) {
  const filtered = paths.filter((path) => {
    if (options.tradeInType && options.tradeInType !== "all" && path.offer.tradeInType !== options.tradeInType) return false;
    if (options.instantOnly && delayedTypes.has(path.offer.tradeInType)) return false;
    if (options.excludeNewLine && path.offer.newLineRequired) return false;
    if (options.unlockedOnly && !path.offer.unlockedRequired && path.merchant.type === "carrier") return false;
    return true;
  });

  return [...filtered].sort((a, b) => pathSortValue(b, options.sortBy) - pathSortValue(a, options.sortBy));
}

function topPathsForDevice({
  currentDeviceSlug,
  targetDeviceSlug,
  condition,
  merchantSlug,
  allowIntermediate = true,
  filters,
}: {
  currentDeviceSlug: string;
  targetDeviceSlug: string;
  condition: string;
  merchantSlug?: string;
  allowIntermediate?: boolean;
  filters?: PathFilterOptions;
}) {
  const currentDevice = getDevice(currentDeviceSlug);
  const targetDevice = getDevice(targetDeviceSlug);

  const directPaths = relevantOffers(currentDevice.slug, condition, targetDevice.slug, merchantSlug).map((offer) =>
    rankPath({
      currentDevice,
      targetDevice,
      offer,
      condition,
      merchant: merchantById(offer.merchantId),
      acquisition: null,
    }),
  );

  const arbitragePaths = allowIntermediate
    ? offers
        .filter((offer) => {
          const matchesTarget = offer.targetDeviceSlug === targetDevice.slug;
          const matchesMerchant = merchantSlug ? offer.merchantId === merchantSlug : true;
          const matchesCondition = offer.acceptedConditions.includes(
            condition as Offer["acceptedConditions"][number],
          );
          return matchesTarget && matchesMerchant && matchesCondition;
        })
        .flatMap((offer) =>
          offer.acceptedTradeInDevices.map((acceptedSlug) => {
            const acquisition = acquisitionForDevice(acceptedSlug, condition);
            if (!acquisition) return null;
            return rankPath({
              currentDevice: getDevice(acceptedSlug),
              targetDevice,
              offer,
              condition,
              merchant: merchantById(offer.merchantId),
              acquisition,
            });
          }),
        )
        .filter((path): path is RankedPath => Boolean(path))
        .filter((path) => path.netValue > 100)
    : [];

  return applyPathFilters([...directPaths, ...arbitragePaths], filters);
}

export function hasDeviceSlug(slug: string) {
  return devices.some((device) => device.slug === slug);
}

export function hasMerchantSlug(slug: string) {
  return merchants.some((merchant) => merchant.slug === slug);
}

export function buildHomepageSnapshot() {
  const heroPaths = topPathsForDevice({
    currentDeviceSlug: "iphone-13-128",
    targetDeviceSlug: "iphone-16-pro-256",
    condition: "good",
    allowIntermediate: true,
  });
  const arbitrageModel = buildArbitrageExplorer();
  const trendingDevices = [...devices]
    .sort((a, b) => b.trendScore - a.trendScore || b.searchVolume - a.searchVolume)
    .slice(0, 6);
  const expiringOffers = [...offers]
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 4)
    .map((offer) => ({
      slug: offer.slug,
      merchant: merchantById(offer.merchantId).name,
      target: offer.targetDevice,
      ends: offer.endDate,
      value: offer.tradeInValue,
    }));

  return {
    freshness: "2026-03-05",
    devices,
    merchants: merchants.filter((merchant) => merchant.slug !== "ebay"),
    heroStats: {
      bestSpread: Math.max(...arbitrageModel.paths.map((path) => path.netValue)),
      offerCount: offers.length,
      avgConfidence: offers.reduce((sum, offer) => sum + offer.confidenceScore, 0) / offers.length,
      deviceCoverage: devices.length,
    },
    examplePath: heroPaths[0],
    trustItems: [
      { label: "Freshness", value: "Daily seeded refresh", copy: "Every offer shows last verified timing." },
      { label: "Sources", value: "Verified + estimated split", copy: "Confidence badges stay visible in every result." },
      { label: "Caveats", value: "Lock-in tags included", copy: "New line, plan, and installment rules are explicit." },
      { label: "Coverage", value: `${devices.length} phones modeled`, copy: "Large seeded catalog across Apple, Samsung, Google, and OnePlus." },
    ],
    merchantStrip: merchants.filter((merchant) => merchant.slug !== "ebay").map((merchant) => merchant.name),
    methodologySteps: [
      { kicker: "01", title: "Price the trade-in honestly", copy: "The engine discounts delayed bill credits, new-line friction, and plan lock-in before ranking any path." },
      { kicker: "02", title: "Compare direct and buy-first paths", copy: "Every result can include a cheap acquisition phone, a redemption merchant, and the true net spread." },
      { kicker: "03", title: "Show why it won", copy: "Top paths expose confidence, freshness, and the main caveat so recommendations stay auditable." },
    ],
    instantVsDelayedChart: heroPaths.slice(0, 4).map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.netValue })),
    bestDeals: heroPaths.slice(0, 3),
    upgradeBoards: buildUpgradeOptimizer({ currentDeviceSlug: "iphone-13-128", targetDeviceSlug: "iphone-16-pro-256", condition: "good", allowIntermediate: true }).boards,
    arbitrage: arbitrageModel.paths.slice(0, 3),
    trendingDevices,
    expiringOffers,
    popularPaths: topUpgradeComparisons.map((comparison) => ({
      slug: comparison.slug,
      title: `${getDevice(comparison.oldDeviceSlug).model} -> ${getDevice(comparison.newDeviceSlug).model}`,
    })),
    whyItRanksFirst: [
      { label: "Real net value", copy: `${heroPaths[0].merchant.name} still wins after subtracting delay, plan lock-in, and expected friction.` },
      { label: "Confidence", copy: `The path combines merchant trust and verification into a ${Math.round(heroPaths[0].confidence * 100)} confidence score.` },
      { label: "Caveat", copy: heroPaths[0].biggestCaveat },
    ],
    linkSystem: [
      { title: "Acquisition links", copy: "Buy-first scenarios keep direct and affiliate acquisition links separate so monetization can expand without changing ranking logic." },
      { title: "Redemption links", copy: "Trade-in or upgrade CTAs can route to carrier, retailer, or OEM checkout pages with future tracking parameters added later." },
      { title: "Fallback behavior", copy: "When no affiliate program exists, the app still exposes a clean direct CTA and marks the merchant normally in the ranking engine." },
    ],
    differentiators: [
      "Best net value instead of best headline promo.",
      "Buy ? Trade ? Save flow with acquisition and redemption separated.",
      "Confidence, freshness, and caveats shown inline rather than hidden.",
    ],
  };
}

export function buildTradeInFinder(args: {
  currentDeviceSlug: string;
  targetDeviceSlug: string;
  condition: string;
  merchantSlug?: string;
  tradeInType?: Offer["tradeInType"] | "all";
  sortBy?: PathSort;
  instantOnly?: boolean;
  excludeNewLine?: boolean;
}) : TradeInFinderModel {
  const currentDevice = getDevice(args.currentDeviceSlug);
  const targetDevice = getDevice(args.targetDeviceSlug);
  const merchant = getMerchant(args.merchantSlug);
  const paths = topPathsForDevice({
    currentDeviceSlug: currentDevice.slug,
    targetDeviceSlug: targetDevice.slug,
    condition: args.condition,
    merchantSlug: merchant?.slug,
    allowIntermediate: true,
    filters: {
      tradeInType: args.tradeInType,
      sortBy: args.sortBy,
      instantOnly: args.instantOnly,
      excludeNewLine: args.excludeNewLine,
    },
  });

  const bestNet = paths[0];
  const bestInstant = [...paths].sort((a, b) => b.instantValue - a.instantValue)[0] ?? bestNet;
  const bestPromo = paths.find((path) => path.offer.tradeInType === "bill_credit") ?? bestNet;

  return {
    inputs: { currentDevice, targetDevice, merchant, condition: args.condition },
    summary: {
      bestNetValue: bestNet?.netValue ?? 0,
      bestNetLabel: bestNet?.merchant.name ?? "No result",
      bestInstantValue: bestInstant?.instantValue ?? 0,
      bestInstantLabel: bestInstant?.merchant.name ?? "No result",
      bestPromoValue: bestPromo?.netValue ?? 0,
      bestPromoLabel: bestPromo?.merchant.name ?? "No result",
      avgConfidence: paths.reduce((sum, path) => sum + path.confidence, 0) / Math.max(paths.length, 1),
    },
    whyTopResult: bestNet
      ? [
          { label: "Net value", copy: `${bestNet.merchant.name} lands at ${formatCurrency(bestNet.netValue)} after drag adjustments.` },
          { label: "Value timing", copy: bestNet.offer.tradeInType === "bill_credit" ? `The value is delayed over ${bestNet.offer.months} months, but still ranks first on net math.` : "This result realizes value faster than most promo paths." },
          { label: "Biggest caveat", copy: bestNet.biggestCaveat },
        ]
      : [],
    paths,
    chart: paths.slice(0, 5).map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.netValue })),
  };
}

export function buildUpgradeOptimizer(args: {
  currentDeviceSlug: string;
  targetDeviceSlug: string;
  condition: string;
  merchantSlug?: string;
  allowIntermediate: boolean;
  unlockedOnly?: boolean;
  excludeNewLine?: boolean;
  sortBy?: PathSort;
}) {
  const paths = topPathsForDevice({
    currentDeviceSlug: args.currentDeviceSlug,
    targetDeviceSlug: args.targetDeviceSlug,
    condition: args.condition,
    merchantSlug: args.merchantSlug,
    allowIntermediate: args.allowIntermediate,
    filters: {
      sortBy: args.sortBy,
      excludeNewLine: args.excludeNewLine,
      unlockedOnly: args.unlockedOnly,
    },
  });

  const direct = paths.filter((path) => path.acquisition === null).slice(0, 3);
  const arbitrage = paths.filter((path) => path.acquisition !== null).slice(0, 3);
  const lowRisk = [...paths].sort((a, b) => pathSortValue(b, "lowest-risk") - pathSortValue(a, "lowest-risk")).slice(0, 3);
  const instant = [...paths].sort((a, b) => b.instantValue - a.instantValue).slice(0, 3);

  const boards: UpgradeBoard[] = [
    { kicker: "Best direct path", title: "Use your current phone directly", description: "Best for simplicity if you do not want an intermediate acquisition step.", paths: direct },
    { kicker: "Best arbitrage path", title: "Buy-first trade-in spread", description: "Best when you are willing to buy a cheaper trade-in phone before redeeming the offer.", paths: arbitrage },
    { kicker: "Lowest risk path", title: "Cleaner upgrade path", description: "Best for avoiding new-line friction, low-confidence inventory, and excessive lock-in.", paths: lowRisk },
    { kicker: "Best instant path", title: "Faster value realization", description: "Best when you care more about immediate usable value than maximum bill-credit headline value.", paths: instant },
  ].filter((board) => board.paths.length > 0);

  return {
    inputs: { currentDevice: getDevice(args.currentDeviceSlug), targetDevice: getDevice(args.targetDeviceSlug), merchant: getMerchant(args.merchantSlug), condition: args.condition },
    boards,
  };
}

export function buildArbitrageExplorer(): ArbitrageExplorerModel {
  const targetPairs = [
    ["pixel-6a-128", "iphone-16-pro-256"],
    ["pixel-6a-128", "galaxy-s25-ultra-256"],
    ["pixel-7-128", "pixel-9-pro-256"],
    ["iphone-12-128", "iphone-16-pro-max-256"],
    ["galaxy-s21-128", "galaxy-s25-ultra-256"],
  ] as const;

  const paths = applyPathFilters(
    targetPairs.flatMap(([currentDeviceSlug, targetDeviceSlug]) =>
      topPathsForDevice({ currentDeviceSlug, targetDeviceSlug, condition: "good", allowIntermediate: true }).filter((path) => path.acquisition !== null),
    ),
    { sortBy: "best-net" },
  ).slice(0, 9);

  return {
    summary: [
      { label: "Best spread", value: formatCurrency(paths[0]?.netValue ?? 0), copy: "Highest net value after buy cost and drag adjustments." },
      { label: "Average confidence", value: `${Math.round((paths.reduce((sum, path) => sum + path.confidence, 0) / Math.max(paths.length, 1)) * 100)}%`, copy: "Mix of merchant trust and acquisition-source confidence." },
      { label: "Tracked opportunities", value: String(paths.length), copy: "Only positive-spread scenarios survive ranking and filtering." },
    ],
    paths,
  };
}

export function buildDealsHub() {
  return {
    sections: [
      { eyebrow: "Top net value", title: "Best direct trade-in deals", description: "Top-ranked across all seeded offers.", paths: topPathsForDevice({ currentDeviceSlug: "iphone-13-128", targetDeviceSlug: "iphone-16-pro-256", condition: "good", allowIntermediate: true }).slice(0, 3) },
      { eyebrow: "Apple", title: "Best iPhone upgrade deals", description: "Strongest routes into the current iPhone flagship target.", paths: topPathsForDevice({ currentDeviceSlug: "iphone-12-128", targetDeviceSlug: "iphone-16-pro-max-256", condition: "good", allowIntermediate: true }).slice(0, 3) },
      { eyebrow: "Samsung", title: "Best Samsung upgrade deals", description: "Top Galaxy upgrade paths for carrier and retailer buyers.", paths: topPathsForDevice({ currentDeviceSlug: "galaxy-s23-128", targetDeviceSlug: "galaxy-s25-ultra-256", condition: "good", allowIntermediate: true }).slice(0, 3) },
      { eyebrow: "Google", title: "Best Pixel upgrade deals", description: "Unlocked-friendly and promo-heavy Pixel options.", paths: topPathsForDevice({ currentDeviceSlug: "pixel-7-128", targetDeviceSlug: "pixel-9-pro-256", condition: "good", allowIntermediate: true }).slice(0, 3) },
    ],
  };
}

export function buildDashboardModel(): DashboardModel {
  return {
    summary: [
      { label: "Saved scenarios", value: String(savedScenarios.length), copy: "Seeded examples ready for persistence in Supabase." },
      { label: "Watched items", value: String(watchedItems.length), copy: "Devices, merchants, offers, and paths ready for alerts." },
      { label: "Alert subscriptions", value: String(alertSubscriptions.length), copy: "Foundation for email and watched-value notifications." },
    ],
    savedScenarios: savedScenarios.map((scenario) => ({ id: scenario.id, title: `${getDevice(scenario.currentDevice).model} -> ${getDevice(scenario.targetDevice).model}`, subtitle: `Condition: ${scenario.condition}`, summary: scenario.resultSnapshot, status: "Watching" })),
    watchedItems: watchedItems.map((item) => ({ id: item.id, title: `${item.type}: ${item.referenceSlug}`, note: item.note, change: item.lastChangeSummary })),
    notificationHooks: [
      { title: "Watched device alerts", copy: "Alert when the best net path for a saved phone changes by a meaningful threshold." },
      { title: "Merchant alerts", copy: "Trigger when a preferred carrier or retailer adds a materially stronger promo or changes fine print." },
      { title: "Expiring offer alerts", copy: "Surface offers nearing end date or turning stale due to missing verification." },
    ],
    alertSubscriptions: alertSubscriptions.map((subscription) => ({ label: subscription.type.replace("_", " "), status: subscription.status, scope: subscription.referenceSlug })),
  };
}

export function buildMethodologyModel(): MethodologyModel {
  return {
    sections: [
      { title: "Data sources", copy: "TradeInFinder currently uses realistic seeded data split into normalized tables for devices, merchants, offers, acquisition sources, saved scenarios, watched items, alert subscriptions, and raw ingest records.", points: ["Offers show verified, estimated, or manual source labels rather than pretending every value is live.", "Acquisition prices are seeded from marketplace and retailer-style comps to support buy-first arbitrage logic.", "Raw ingest rows exist now so future scrapers and CSV imports have a place to land before promotion into production tables."] },
      { title: "Ranking engine", copy: "Every path starts with headline trade-in value, then discounts for condition drag, bill-credit delay, merchant lock-in, acquisition risk, and user preference filters.", points: ["Instant cash and store credit keep more of their headline value because realization is immediate.", "Bill-credit offers can still win if the spread is strong enough after 36-month drag is applied.", "Merchant trust and confidence scores are positive signals but do not overpower net value."] },
      { title: "Affiliate transparency", copy: "Links are abstracted so the product can add affiliate or referral monetization without changing ranking logic or biasing recommendations.", points: ["Every recommendation can include an acquisition CTA and a redemption CTA separately.", "Direct links remain first-class when no affiliate program is available.", "A production system would log click attribution independently from ranking decisions."] },
      { title: "Limitations", copy: "Seeded and manual values are useful for planning, but final trade-in outcomes still depend on condition inspection, carrier terms, and current merchant inventory.", points: ["Some retailer and marketplace values are modeled benchmarks rather than live inventory quotes.", "Bill-credit offers assume the user keeps service long enough to realize the full credit stream.", "The next production step is a Vercel-friendly ingest and verification pipeline backed by hosted Postgres storage."] },
    ],
  };
}

export function buildAdminModel(): AdminModel {
  return {
    summary: [
      { label: "Devices", value: String(devices.length), copy: "Normalized device catalog across major phone families." },
      { label: "Merchants", value: String(merchants.length), copy: "Carrier, retailer, OEM, and marketplace rows." },
      { label: "Offers", value: String(offers.length), copy: "Current seeded trade-in offers." },
      { label: "Raw ingest", value: String(rawIngestRecords.length), copy: "Pipeline inspection records." },
    ],
    collections: [
      { title: "Device CRUD", copy: "Add new devices, deprecate old models, and manage storage variants and trend metadata.", count: String(devices.length) },
      { title: "Merchant CRUD", copy: "Maintain trust scores, default link types, and notes.", count: String(merchants.length) },
      { title: "Offer CRUD", copy: "Track conditions, confidence, start/end dates, and fine print summaries.", count: String(offers.length) },
      { title: "Acquisition sources", copy: "Used-market pricing references for arbitrage evaluation.", count: String(acquisitionSources.length) },
      { title: "Alert subscriptions", copy: "Retention hooks for watched-value and expiring-offer signals.", count: String(alertSubscriptions.length) },
    ],
    actions: [
      { title: "Confidence overrides", copy: "Manually lift or suppress offers when source quality changes faster than automation can catch." },
      { title: "Stale offer marking", copy: "Flag offers whose last verification date has aged past the accepted threshold." },
      { title: "Raw source inspection", copy: "Review imported payloads and parsing errors before promoting rows into the public dataset." },
      { title: "Featured deal curation", copy: "Control homepage and deals-hub emphasis without changing underlying rank calculations." },
    ],
  };
}

export function getDevicePageModel(slug: string): DevicePageModel | null {
  const device = devices.find((entry) => entry.slug === slug);
  if (!device) return null;

  const paths = offers
    .filter((offer) => offer.acceptedTradeInDevices.includes(device.slug) && offer.acceptedConditions.includes("good"))
    .map((offer) => rankPath({ currentDevice: device, targetDevice: getDevice(offer.targetDeviceSlug), offer, condition: "good", merchant: merchantById(offer.merchantId), acquisition: null }))
    .sort((a, b) => b.trustAdjustedScore - a.trustAdjustedScore)
    .slice(0, 6);

  return {
    device,
    chart: paths.slice(0, 5).map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.netValue })),
    paths: paths.slice(0, 3),
    relatedLinks: [
      { label: "Best trade-in page", href: `/best-trade-in/${device.slug}` },
      { label: "Best upgrade page", href: `/best-upgrade/${device.slug}` },
      { label: "Deals hub", href: "/deals" },
    ],
  };
}

export function getMerchantPageModel(slug: string): MerchantPageModel | null {
  const merchant = merchants.find((entry) => entry.slug === slug);
  if (!merchant) return null;

  const paths = offers
    .filter((offer) => offer.merchantId === merchant.id && offer.acceptedConditions.includes("good"))
    .map((offer) => {
      const currentDeviceSlug = offer.acceptedTradeInDevices[0];
      return rankPath({ currentDevice: getDevice(currentDeviceSlug), targetDevice: getDevice(offer.targetDeviceSlug), offer, condition: "good", merchant, acquisition: null });
    })
    .sort((a, b) => b.trustAdjustedScore - a.trustAdjustedScore)
    .slice(0, 3);

  return {
    merchant,
    tags: [merchant.type, merchant.affiliateCapable ? "Affiliate-ready" : "Direct links only", `${Math.round(merchant.trustScore * 100)} trust`],
    paths,
    rules: ["Review condition eligibility carefully because final inspection can move devices between value tiers.", merchant.notes, "Treat headline bill-credit values as delayed value, not instant money."],
    relatedLinks: [
      { label: "Search all results", href: "/search" },
      { label: "Methodology", href: "/methodology" },
    ],
  };
}

export function getOfferPageModel(slug: string): OfferPageModel | null {
  const offer = offers.find((entry) => entry.slug === slug);
  if (!offer) return null;

  const merchant = merchantById(offer.merchantId);
  const currentDeviceSlug = offer.acceptedTradeInDevices[0];
  const primaryPath = rankPath({ currentDevice: getDevice(currentDeviceSlug), targetDevice: getDevice(offer.targetDeviceSlug), offer, condition: "good", merchant, acquisition: acquisitionForDevice(currentDeviceSlug, "good") });

  return {
    offer: { ...offer, merchant, confidenceLabel: `${Math.round(offer.confidenceScore * 100)} confidence` },
    tags: offerTags(offer),
    creditTimeline: offer.tradeInType === "bill_credit" && offer.months ? `${offer.monthlyCreditAmount?.toFixed(2)} monthly for ${offer.months} months` : "Immediate at checkout or after inspection",
    acceptedDevices: offer.acceptedTradeInDevices.map((deviceSlug) => getDevice(deviceSlug).model).join(", "),
    acquisitionSummary: acquisitionSources.filter((source) => offer.acceptedTradeInDevices.includes(deviceById(source.deviceId)?.slug ?? "")).map((source) => `${source.title}: ${formatCurrency(source.estimatedPrice)}`).slice(0, 3).join(" | "),
    primaryPath,
  };
}

export function getComparePageModel(slug: string): ComparePageModel | null {
  const comparison = topUpgradeComparisons.find((entry) => entry.slug === slug);
  if (!comparison) return null;

  const currentDevice = getDevice(comparison.oldDeviceSlug);
  const targetDevice = getDevice(comparison.newDeviceSlug);

  return {
    title: `Compare ${currentDevice.model} to ${targetDevice.model} upgrade paths`,
    description: "Direct, buy-first, and lower-risk upgrade outcomes ranked by effective cost, confidence, and caveat load.",
    boards: buildUpgradeOptimizer({ currentDeviceSlug: currentDevice.slug, targetDeviceSlug: targetDevice.slug, condition: "good", allowIntermediate: true }).boards,
  };
}

