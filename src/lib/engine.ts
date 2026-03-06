import {
  acquisitionSources,
  alertSubscriptions,
  devices,
  merchants,
  offers,
  rawIngestRecords,
  resaleEstimates,
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
  Condition,
  DashboardModel,
  DealsHubModel,
  Device,
  DevicePageModel,
  HomepageSnapshot,
  MerchantPageModel,
  MethodologyModel,
  Offer,
  OfferPageModel,
  RankedPath,
  SellVsTradeModel,
  SellVsTradeOption,
  Store,
  TradeInFinderModel,
  UpgradeBoard,
} from "@/lib/schema";

type PathSort = "highest-value" | "easiest" | "best-upgrade" | "highest-confidence" | "newest";

type FinderArgs = {
  currentDeviceSlug: string;
  targetDeviceSlug?: string;
  condition: Condition;
  merchantSlug?: string;
  valueType?: Offer["valueType"] | "all";
  sortBy?: PathSort;
};

type UpgradeArgs = {
  currentDeviceSlug: string;
  targetDeviceSlug: string;
  condition: Condition;
  merchantSlug?: string;
  sortBy?: PathSort;
};

const confidenceLabels = [
  { threshold: 0.9, label: "Very high" },
  { threshold: 0.8, label: "High" },
  { threshold: 0.68, label: "Moderate" },
  { threshold: 0, label: "Limited" },
];

function getDevice(slug?: string) {
  return devices.find((device) => device.slug === slug);
}

function getStore(slug?: string) {
  return merchants.find((merchant) => merchant.slug === slug);
}

function storeById(id: string) {
  return merchants.find((merchant) => merchant.id === id);
}

function resaleForDevice(deviceId: string, condition: Condition) {
  return resaleEstimates
    .filter((estimate) => estimate.deviceId === deviceId && estimate.condition === condition)
    .sort((a, b) => b.netEstimatedValue - a.netEstimatedValue)[0] ?? null;
}

function conditionFactor(condition: Condition) {
  if (condition === "mint") return 1;
  if (condition === "good") return 0.93;
  if (condition === "fair") return 0.79;
  return 0.54;
}

function ageFactor(year: number) {
  const age = Math.max(2026 - year, 1);
  return Math.max(0.2, 0.82 - age * 0.08);
}

function brandBoost(device: Device, store: Store) {
  if (store.slug === "best-buy") return 1;
  if (store.slug === "amazon") return 0.92;
  if (store.slug === "ebay") return 0.9;
  if (store.slug === "apple") return device.brand === "Apple" ? 1.04 : 0.72;
  if (store.slug === "samsung") return device.brand === "Samsung" ? 1.05 : 0.78;
  if (store.slug === "google-store") return device.brand === "Google" ? 1.05 : 0.74;
  return 1;
}

function valueUsability(type: Offer["valueType"]) {
  if (type === "instant_credit") return 1;
  if (type === "purchase_credit") return 0.98;
  if (type === "store_credit") return 0.95;
  return 0.9;
}

function effortLabel(type: Offer["valueType"]): RankedPath["effortLabel"] {
  if (type === "instant_credit" || type === "purchase_credit") return "easy";
  if (type === "store_credit") return "moderate";
  return "moderate";
}

function biggestCaveat(type: Offer["valueType"]) {
  if (type === "gift_card") return "Value is trapped in store balance, not cash.";
  if (type === "store_credit") return "Value works best if the store sells your next phone competitively.";
  if (type === "purchase_credit") return "Highest value usually assumes you are buying your next phone right away.";
  return "Final value still depends on inspection matching the selected condition.";
}

function targetCompatible(store: Store, targetDevice?: Device) {
  if (!targetDevice) return true;
  if (store.slug === "apple") return targetDevice.brand === "Apple";
  if (store.slug === "samsung") return targetDevice.brand === "Samsung";
  if (store.slug === "google-store") return targetDevice.brand === "Google";
  return ["best-buy", "amazon"].includes(store.slug);
}

function tradeInValueFor(device: Device, offer: Offer, store: Store, condition: Condition) {
  const modeled = Math.round(device.msrp * ageFactor(device.year) * conditionFactor(condition) * brandBoost(device, store));
  return Math.max(0, Math.min(offer.tradeInValue, modeled));
}

function confidenceFor(offer: Offer, store: Store, resaleNet: number, tradeValue: number) {
  const deltaPenalty = Math.min(Math.abs(resaleNet - tradeValue) / 500, 0.16);
  return Math.max(0.48, offer.confidenceScore * store.trustScore - deltaPenalty);
}

function riskLevel(confidence: number, offer: Offer): RankedPath["riskLevel"] {
  if (confidence >= 0.86 && offer.valueType !== "gift_card") return "low";
  if (confidence >= 0.72) return "medium";
  return "high";
}

function pathScore(path: RankedPath, sortBy: PathSort = "highest-value") {
  if (sortBy === "easiest") return path.instantValue + path.confidence * 100 - (path.effortLabel === "easy" ? 0 : 18);
  if (sortBy === "best-upgrade") return 1000 - path.effectiveUpgradeCost + path.confidence * 100;
  if (sortBy === "highest-confidence") return path.confidence * 100;
  if (sortBy === "newest") return new Date(path.offer.lastVerifiedAt).getTime();
  return path.trustAdjustedScore;
}

function pathTags(offer: Offer) {
  return [
    offer.valueType === "instant_credit"
      ? "Instant credit"
      : offer.valueType === "store_credit"
        ? "Store credit"
        : offer.valueType === "gift_card"
          ? "Gift card"
          : "Purchase credit",
    offer.sourceType === "verified" ? "Verified recently" : offer.sourceType === "estimated" ? "Estimated" : "Manual",
  ];
}

function createPath(device: Device, offer: Offer, condition: Condition, targetDevice?: Device, acquisition: AcquisitionSource | null = null): RankedPath | null {
  const store = storeById(offer.storeId);
  if (!store) return null;
  if (!offer.acceptedTradeInDevices.includes(device.slug)) return null;
  if (!offer.acceptedConditions.includes(condition)) return null;
  if (!targetCompatible(store, targetDevice)) return null;

  const resale = resaleForDevice(device.id, condition);
  const netTradeValue = tradeInValueFor(device, offer, store, condition) - (acquisition?.estimatedPrice ?? 0);
  if (netTradeValue <= 0) return null;

  const confidence = confidenceFor(offer, store, resale?.netEstimatedValue ?? netTradeValue, netTradeValue);
  const instantValue = Math.round(netTradeValue * valueUsability(offer.valueType));
  const effectiveUpgradeCost = targetDevice ? Math.max(targetDevice.msrp - instantValue, 0) : 0;
  const trustAdjustedScore = netTradeValue * 0.58 + instantValue * 0.18 + confidence * 100 * 0.16 + store.trustScore * 100 * 0.08;
  const resaleDelta = resale ? netTradeValue - resale.netEstimatedValue : undefined;

  return {
    slug: acquisition ? `${device.slug}-${offer.slug}-acq` : `${device.slug}-${offer.slug}`,
    label: `${store.name} ${targetDevice ? `for ${targetDevice.model}` : "trade-in"}`,
    summary: targetDevice
      ? `${formatCurrency(netTradeValue)} off ${targetDevice.model} with a clear checkout credit.`
      : `${formatCurrency(netTradeValue)} direct value with no carrier lock-in math.`,
    reasonBadge: targetDevice
      ? store.slug === targetDevice.preferredStoreSlugs[0]
        ? `Best for ${targetDevice.brand} upgrade`
        : "Best upgrade path"
      : offer.valueType === "instant_credit"
        ? "Best instant value"
        : offer.valueType === "gift_card"
          ? "Store-balance option"
          : "Best direct trade-in",
    device,
    merchant: store,
    offer,
    acquisition,
    netValue: netTradeValue,
    effectiveUpgradeCost,
    instantValue,
    confidence,
    trustAdjustedScore,
    biggestCaveat: biggestCaveat(offer.valueType),
    explanation: `We model each store's direct value ceiling, adjust it for ${condition} condition, and compare it with likely resale net value and store trust so the top result stays practical.`,
    tags: pathTags(offer),
    riskLevel: riskLevel(confidence, offer),
    valueTimelineLabel: offer.valueType === "gift_card" ? "Store-balance value" : "Immediate checkout value",
    resaleNetValue: resale?.netEstimatedValue,
    resaleDelta,
    effortLabel: effortLabel(offer.valueType),
    links: buildPathLinks({ acquisition, merchant: store, targetDeviceSlug: targetDevice?.slug ?? offer.targetDeviceOptional ?? device.slug }),
  };
}

function sortPaths(paths: RankedPath[], sortBy?: PathSort) {
  return [...paths].sort((a, b) => pathScore(b, sortBy) - pathScore(a, sortBy));
}

function filteredOffers(device: Device, condition: Condition, merchantSlug?: string, valueType?: Offer["valueType"] | "all") {
  return offers.filter((offer) => {
    const store = storeById(offer.storeId);
    if (!store) return false;
    if (merchantSlug && store.slug !== merchantSlug) return false;
    if (valueType && valueType !== "all" && offer.valueType !== valueType) return false;
    return offer.acceptedTradeInDevices.includes(device.slug) && offer.acceptedConditions.includes(condition);
  });
}

function sellVsTradeOptions(device: Device, condition: Condition, targetDevice?: Device): SellVsTradeOption[] {
  const tradePaths = sortPaths(filteredOffers(device, condition).map((offer) => createPath(device, offer, condition, targetDevice)).filter(Boolean) as RankedPath[]);
  const resale = resaleForDevice(device.id, condition);
  const bestTrade = tradePaths[0];
  const bestUpgrade = targetDevice ? buildUpgradeOptimizer({ currentDeviceSlug: device.slug, targetDeviceSlug: targetDevice.slug, condition }).boards[0]?.paths[0] : undefined;
  const options: SellVsTradeOption[] = [];
  if (bestTrade) {
    options.push({ slug: `${device.slug}-trade`, type: "trade_in", title: `Trade in at ${bestTrade.merchant.name}`, subtitle: `${bestTrade.offer.valueType.replace("_", " ")} path`, value: bestTrade.netValue, confidence: bestTrade.confidence, speed: "Fast", effort: bestTrade.effortLabel === "easy" ? "Low effort" : "Medium effort", risk: bestTrade.riskLevel === "low" ? "Low risk" : "Moderate risk", caveat: bestTrade.biggestCaveat, label: "Best direct trade-in", href: `/trade-in/${device.slug}/${bestTrade.merchant.slug}` });
  }
  if (resale) {
    options.push({ slug: `${device.slug}-resale`, type: "resale", title: "Sell it yourself", subtitle: `Estimated ${formatCurrency(resale.estimatedSalePrice)} sale price before fees`, value: resale.netEstimatedValue, confidence: resale.confidenceScore, speed: "Slower", effort: "Higher effort", risk: "More variance", caveat: "You handle listing, fees, shipping, and buyer issues.", label: "Best resale alternative", href: `/resale-vs-trade/${device.slug}` });
  }
  if (bestUpgrade && targetDevice) {
    options.push({ slug: `${device.slug}-upgrade`, type: "upgrade", title: `Upgrade to ${targetDevice.model}`, subtitle: `Best path is ${bestUpgrade.merchant.name}`, value: bestUpgrade.netValue, confidence: bestUpgrade.confidence, speed: "Fast", effort: bestUpgrade.effortLabel === "easy" ? "Low effort" : "Medium effort", risk: bestUpgrade.riskLevel === "low" ? "Low risk" : "Moderate risk", caveat: bestUpgrade.biggestCaveat, label: "Best upgrade path", href: `/upgrade-path/${device.slug}/${targetDevice.slug}` });
  }
  return options.sort((a, b) => b.value - a.value);
}

export function hasDeviceSlug(slug: string) {
  return devices.some((device) => device.slug === slug);
}

export function hasMerchantSlug(slug: string) {
  return merchants.some((merchant) => merchant.slug === slug);
}
export function buildTradeInFinder(args: FinderArgs): TradeInFinderModel {
  const currentDevice = getDevice(args.currentDeviceSlug) ?? devices[0];
  const targetDevice = getDevice(args.targetDeviceSlug);
  const merchant = getStore(args.merchantSlug);
  const paths = sortPaths(
    filteredOffers(currentDevice, args.condition, args.merchantSlug, args.valueType)
      .map((offer) => createPath(currentDevice, offer, args.condition, targetDevice))
      .filter(Boolean) as RankedPath[],
    args.sortBy,
  );
  const resale = resaleForDevice(currentDevice.id, args.condition);
  const top = paths[0];
  const sellVsTrade = sellVsTradeOptions(currentDevice, args.condition, targetDevice);

  return {
    inputs: { currentDevice, targetDevice, merchant, condition: args.condition },
    summary: {
      bestTradeInValue: top?.netValue ?? 0,
      bestTradeInLabel: top ? `${top.merchant.name} ${top.offer.valueType.replace("_", " ")}` : "No matching store",
      bestResaleValue: resale?.netEstimatedValue ?? 0,
      bestResaleLabel: resale ? `${resale.sourceType} net estimate` : "No resale estimate",
      bestUpgradeValue: targetDevice ? Math.max(targetDevice.msrp - (top?.instantValue ?? 0), 0) : 0,
      bestUpgradeLabel: targetDevice && top ? `${top.merchant.name} lowers ${targetDevice.model} to ${formatCurrency(Math.max(targetDevice.msrp - top.instantValue, 0))}` : "Choose a target phone for upgrade math",
      avgConfidence: paths.length ? paths.reduce((sum, path) => sum + path.confidence, 0) / paths.length : 0,
    },
    whyTopResult: top
      ? [
          { label: "Immediate value", copy: `${top.merchant.name} delivers ${formatCurrency(top.instantValue)} in immediately usable value.` },
          { label: "Resale gap", copy: top.resaleNetValue ? `Estimated resale net is ${formatCurrency(top.resaleNetValue)} for the same phone and condition.` : "Resale benchmark is unavailable for this condition." },
          { label: "Confidence", copy: `${confidenceLabels.find((item) => top.confidence >= item.threshold)?.label ?? "Moderate"} confidence based on freshness, store trust, and comp alignment.` },
        ]
      : [],
    paths,
    sellVsTrade,
    chart: paths.slice(0, 5).map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.resaleNetValue ?? 0 })),
  };
}

export function buildUpgradeOptimizer(args: UpgradeArgs) {
  const currentDevice = getDevice(args.currentDeviceSlug) ?? devices[0];
  const targetDevice = getDevice(args.targetDeviceSlug) ?? devices[0];
  const merchant = getStore(args.merchantSlug);
  const allPaths = sortPaths(
    filteredOffers(currentDevice, args.condition, args.merchantSlug)
      .map((offer) => createPath(currentDevice, offer, args.condition, targetDevice))
      .filter(Boolean) as RankedPath[],
    args.sortBy,
  );
  const direct = allPaths.filter((path) => ["apple", "samsung", "google-store"].includes(path.merchant.slug));
  const flexible = allPaths.filter((path) => ["best-buy", "amazon"].includes(path.merchant.slug));

  return {
    inputs: { currentDevice, targetDevice, merchant, condition: args.condition },
    boards: [
      { kicker: "Best simple path", title: `Upgrade ${currentDevice.model} to ${targetDevice.model}`, description: "The cleanest paths prioritize immediately usable value and low friction.", paths: allPaths.slice(0, 3) },
      { kicker: "Brand-native stores", title: "Best direct brand upgrade paths", description: "These routes keep the trade-in and new purchase inside the target brand's own checkout flow when possible.", paths: direct.slice(0, 3) },
      { kicker: "Flexible retailers", title: "Best cross-brand upgrade paths", description: "Useful when you want more flexible store credit or you are switching ecosystems.", paths: flexible.slice(0, 3) },
    ] satisfies UpgradeBoard[],
  };
}

export function buildSellVsTradeModel(deviceSlug: string, condition: Condition = "good"): SellVsTradeModel | null {
  const device = getDevice(deviceSlug);
  if (!device) return null;
  const options = sellVsTradeOptions(device, condition);
  const bestTrade = options.find((option) => option.type === "trade_in");
  const bestResale = options.find((option) => option.type === "resale");
  const gap = (bestResale?.value ?? 0) - (bestTrade?.value ?? 0);

  return {
    device,
    condition,
    summary: [
      { label: "Best trade-in", value: formatCurrency(bestTrade?.value ?? 0), copy: bestTrade?.title ?? "No matching trade-in" },
      { label: "Best resale net", value: formatCurrency(bestResale?.value ?? 0), copy: bestResale?.title ?? "No resale estimate" },
      { label: "Difference", value: formatCurrency(Math.abs(gap)), copy: gap > 40 ? "Resale likely pays more" : "Trade-in is closer than usual" },
    ],
    options,
    recommendation: gap > 40
      ? { title: "Sell if maximizing dollars matters", copy: `Private sale is likely worth about ${formatCurrency(gap)} more, but it comes with more effort and more timing risk.` }
      : { title: "Trade in if simplicity matters", copy: "The value gap is small enough that fast checkout credit is likely the cleaner choice for most people." },
    chart: [
      { label: "Trade in", tradeIn: bestTrade?.value ?? 0, resale: 0 },
      { label: "Sell yourself", tradeIn: 0, resale: bestResale?.value ?? 0 },
    ],
  };
}

export function buildArbitrageExplorer(): ArbitrageExplorerModel {
  const paths = sortPaths(
    acquisitionSources.flatMap((acquisition) => {
      const device = devices.find((entry) => entry.id === acquisition.deviceId);
      if (!device) return [];
      return offers
        .map((offer) => createPath(device, offer, acquisition.condition, getDevice(offer.targetDeviceOptional ?? offer.purchaseCreditTargetOptional ?? "iphone-16-pro-256"), acquisition))
        .filter((path): path is RankedPath => Boolean(path))
        .filter((path) => path.netValue > 80);
    }),
    "highest-value",
  ).slice(0, 6);

  return {
    summary: [
      { label: "Best spread", value: formatCurrency(paths[0]?.netValue ?? 0), copy: "Net direct value after estimated acquisition cost." },
      { label: "Opportunities", value: String(paths.length), copy: "Positive buy-low, trade-high paths in seeded data." },
      { label: "Bias", value: "Simple stores only", copy: "No 36-month bill-credit math in these rankings." },
    ],
    paths,
  };
}

export function buildDealsHub(): DealsHubModel {
  const bestTrade = buildTradeInFinder({ currentDeviceSlug: "iphone-13-128", targetDeviceSlug: "iphone-16-pro-256", condition: "good" }).paths;
  const bestSamsung = buildTradeInFinder({ currentDeviceSlug: "galaxy-s23-128", targetDeviceSlug: "galaxy-s24-ultra-256", condition: "good" }).paths;
  const bestPixel = buildTradeInFinder({ currentDeviceSlug: "pixel-7-128", targetDeviceSlug: "pixel-9-pro-256", condition: "good" }).paths;
  return {
    sections: [
      { eyebrow: "Best direct trade-ins", title: "Clean, immediate-value trade-ins", description: "Ranked for people who want usable value now, not telecom lock-in later.", paths: bestTrade.slice(0, 3) },
      { eyebrow: "Best Samsung upgrades", title: "Strong Galaxy upgrade paths", description: "Best simple store paths for Samsung buyers right now.", paths: bestSamsung.slice(0, 3) },
      { eyebrow: "Best Pixel upgrades", title: "Strong Pixel upgrade paths", description: "Straightforward Google and retailer paths without hidden plan rules.", paths: bestPixel.slice(0, 3) },
    ],
  };
}

export function buildHomepageSnapshot(): HomepageSnapshot {
  const examplePath = buildTradeInFinder({ currentDeviceSlug: "iphone-13-128", targetDeviceSlug: "iphone-16-pro-256", condition: "good" }).paths[0];
  const sellVsTrade = buildSellVsTradeModel("iphone-13-128", "good");
  const bestDeals = buildDealsHub().sections.flatMap((section) => section.paths).slice(0, 3);
  return {
    freshness: "2026-03-05",
    devices: devices.slice(0, 24),
    merchants,
    examplePath,
    heroStats: {
      bestDirectValue: bestDeals[0]?.netValue ?? 0,
      bestResaleValue: resaleForDevice(getDevice("iphone-13-128")!.id, "good")?.netEstimatedValue ?? 0,
      offerCount: offers.length,
      deviceCoverage: devices.length,
      avgConfidence: offers.reduce((sum, offer) => sum + offer.confidenceScore, 0) / offers.length,
    },
    merchantStrip: merchants.map((merchant) => merchant.name),
    trustItems: [
      { label: "Simple value types", value: "Instant, store, gift card, purchase credit", copy: "No default focus on carrier bill credits or line lock-in." },
      { label: "Transparency", value: "Confidence plus freshness on every result", copy: "Every offer carries source and verification context." },
      { label: "Decision support", value: "Trade in vs sell vs upgrade", copy: "The site answers the practical money question, not just the headline credit question." },
      { label: "Store coverage", value: "Apple, Samsung, Best Buy, Amazon, Google", copy: "Seeded for direct-value decision making today and expandable later." },
    ],
    methodologySteps: [
      { kicker: "1", title: "Model store value", copy: "We compare each store's simple trade-in path, then normalize it against device age, condition, and store trust." },
      { kicker: "2", title: "Benchmark resale", copy: "We estimate likely resale net value after fees so the trade-in ranking stays grounded in real alternatives." },
      { kicker: "3", title: "Show real upgrade cost", copy: "When you pick a target phone, we subtract immediately usable credit from the target price to show the actual out-of-pocket move." },
    ],
    instantVsDelayedChart: bestDeals.map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.resaleNetValue ?? 0 })),
    bestDeals,
    arbitrage: buildArbitrageExplorer().paths.slice(0, 3),
    trendingDevices: [...devices].sort((a, b) => b.searchVolume - a.searchVolume).slice(0, 6),
    differentiators: [
      "TradeInFinder is designed to explain the best immediate value, not just surface the biggest marketing number.",
      "Sell-it-yourself benchmarks keep store offers honest and help users decide when convenience is worth the trade-off.",
      "Upgrade paths stay simple: Apple, Samsung, Best Buy, Amazon, and Google Store first.",
    ],
    sellVsTradeHighlights: sellVsTrade?.options.slice(0, 3) ?? [],
    popularTargets: devices.filter((device) => device.year >= 2024).slice(0, 6),
    upgradeBoards: buildUpgradeOptimizer({ currentDeviceSlug: "iphone-13-128", targetDeviceSlug: "iphone-16-pro-256", condition: "good" }).boards,
    expiringOffers: offers.map((offer) => ({ slug: offer.slug, merchant: storeById(offer.storeId)?.name ?? offer.storeId, target: offer.purchaseCreditTargetOptional ?? offer.targetDeviceOptional ?? "Any compatible phone", ends: offer.endDate, value: offer.tradeInValue })).sort((a, b) => a.ends.localeCompare(b.ends)).slice(0, 4),
    linkSystem: [
      { title: "Store links stay modular", copy: "Each result supports affiliate links when available and clean direct links when they are not." },
      { title: "Monetization does not distort ranking", copy: "Stores rank on usable value, confidence, and simplicity before any affiliate consideration." },
    ],
  };
}

export function buildDashboardModel(): DashboardModel {
  return {
    summary: [
      { label: "Saved scenarios", value: String(savedScenarios.length), copy: "Trade-in and upgrade comparisons ready for auth-backed persistence." },
      { label: "Watched items", value: String(watchedItems.length), copy: "Track specific devices, stores, and offers over time." },
      { label: "Alert hooks", value: String(alertSubscriptions.length), copy: "Newsletter, value-change, and expiring-offer foundations are in place." },
    ],
    savedScenarios: savedScenarios.map((scenario) => ({ id: scenario.id, title: `${getDevice(scenario.currentDevice)?.model} -> ${getDevice(scenario.targetDevice)?.model}`, subtitle: `${scenario.condition} condition`, summary: scenario.resultSnapshot, status: "Saved" })),
    watchedItems: watchedItems.map((item) => ({ id: item.id, title: item.referenceSlug.replace(/-/g, " "), note: item.note, change: item.lastChangeSummary })),
    notificationHooks: [
      { title: "Watched device alerts", copy: "Notify when a tracked phone crosses a user-set value threshold." },
      { title: "Store-change alerts", copy: "Trigger when a store's verified estimate changes meaningfully." },
      { title: "Expiring-deal alerts", copy: "Highlight short-lived trade-in opportunities before they age out." },
    ],
    alertSubscriptions: alertSubscriptions.map((subscription) => ({ label: subscription.type.replace(/_/g, " "), status: subscription.status, scope: subscription.referenceSlug })),
  };
}

export function buildMethodologyModel(): MethodologyModel {
  return {
    sections: [
      { title: "How rankings work", copy: "TradeInFinder ranks simple store offers by usable value, store trust, freshness, and how the result compares with likely resale net value.", points: ["Immediate-value paths rank above complicated store-balance outcomes when dollars are close.", "Resale benchmarks keep direct trade-in recommendations honest.", "Upgrade cost is target price minus immediately usable credit."] },
      { title: "Confidence scores", copy: "Confidence blends source freshness, store trust, and how closely the modeled store value matches resale comps for the same device and condition.", points: ["Verified direct-store values score highest.", "Manual or estimated entries remain visible but are tagged and scored lower.", "Older or thinner comp sets lower confidence rather than pretending precision."] },
      { title: "What is seeded vs live", copy: "The current launch foundation uses realistic seeded values and timestamps. The ingest model is already shaped for live store updates later.", points: ["Devices, stores, offers, and resale estimates are seeded today.", "Raw ingest records and freshness timestamps are already represented in the schema.", "Affiliate handling is modular and does not control ranking position."] },
      { title: "Limitations", copy: "This product intentionally avoids leading with 36-month carrier bill-credit math. That keeps the experience easier to trust, but it also means some carrier-specific edge cases are not shown by default.", points: ["Local taxes and shipping are not modeled in the current pass.", "Private-party resale still varies by timing and listing quality.", "Final store inspection can change the payout when condition assumptions are wrong."] },
    ],
  };
}

export function buildAdminModel(): AdminModel {
  return {
    summary: [
      { label: "Devices", value: String(devices.length), copy: "Large seeded phone catalog ready for CRUD." },
      { label: "Stores", value: String(merchants.length), copy: "Simple-store-first merchant coverage." },
      { label: "Offers", value: String(offers.length), copy: "Direct-value trade-in offers with freshness and confidence fields." },
      { label: "Raw ingest", value: String(rawIngestRecords.length), copy: "Foundation for CSV, scraping, and manual verification pipelines." },
    ],
    collections: [
      { title: "Devices", copy: "Phone catalog, storage tiers, support flags, and target ranking metadata.", count: String(devices.length) },
      { title: "Stores", copy: "Apple, Samsung, Best Buy, Amazon, Google Store, and resale benchmark sources.", count: String(merchants.length) },
      { title: "Trade-in offers", copy: "Simple value offers with source type, freshness, and confidence controls.", count: String(offers.length) },
      { title: "Resale estimates", copy: "Net sale benchmarks by device, condition, and source type.", count: String(resaleEstimates.length) },
    ],
    actions: [
      { title: "Mark stale values", copy: "Flag direct-store values that have aged past the verification window." },
      { title: "Override confidence", copy: "Raise or lower confidence on thin or freshly verified data." },
      { title: "Inspect raw sources", copy: "Review raw ingest payloads before promoting them into live offer records." },
    ],
  };
}

export function getDevicePageModel(slug: string): DevicePageModel | null {
  const device = getDevice(slug);
  if (!device) return null;
  const targetSlug = device.brand === "Apple" ? "iphone-16-pro-256" : device.brand === "Samsung" ? "galaxy-s24-ultra-256" : "pixel-9-pro-256";
  const sellVsTrade = buildSellVsTradeModel(slug, "good");
  const paths = buildTradeInFinder({ currentDeviceSlug: slug, targetDeviceSlug: targetSlug, condition: "good" }).paths.slice(0, 6);
  return {
    device,
    chart: paths.map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.resaleNetValue ?? 0 })),
    paths,
    sellVsTrade: sellVsTrade!,
    relatedLinks: [
      { label: `Best trade-in for ${device.model}`, href: `/best-trade-in/${device.slug}` },
      { label: `Sell vs trade ${device.model}`, href: `/resale-vs-trade/${device.slug}` },
      { label: `Trade in ${device.model} at Best Buy`, href: `/trade-in/${device.slug}/best-buy` },
    ],
  };
}

export function getMerchantPageModel(slug: string): MerchantPageModel | null {
  const merchant = getStore(slug);
  if (!merchant) return null;
  const sampleDevices = devices.filter((device) => merchant.slug === "apple" ? device.brand === "Apple" : merchant.slug === "samsung" ? device.brand === "Samsung" : true).slice(0, 6);
  const paths = sortPaths(sampleDevices.flatMap((device) => filteredOffers(device, "good", merchant.slug).map((offer) => createPath(device, offer, "good"))).filter(Boolean) as RankedPath[]).slice(0, 6);
  return {
    merchant,
    tags: [merchant.type, `Trust ${Math.round(merchant.trustScore * 100)}%`, merchant.affiliateCapable ? "Affiliate-ready" : "Direct links"],
    paths,
    rules: [
      "Results show immediately understandable credit types only.",
      "Confidence is based on freshness, source quality, and comp stability.",
      "Trade-in estimates assume the selected condition survives final inspection.",
    ],
    relatedLinks: sampleDevices.slice(0, 3).map((device) => ({ label: `${device.model} trade-in`, href: `/trade-in/${device.slug}/${merchant.slug}` })),
  };
}

export function getOfferPageModel(slug: string): OfferPageModel | null {
  const offer = offers.find((entry) => entry.slug === slug);
  if (!offer) return null;
  const merchant = storeById(offer.storeId);
  if (!merchant) return null;
  const device = getDevice(offer.acceptedTradeInDevices[0]);
  if (!device) return null;
  const targetDevice = getDevice(offer.purchaseCreditTargetOptional ?? offer.targetDeviceOptional ?? undefined);
  const primaryPath = createPath(device, offer, "good", targetDevice) ?? createPath(device, offer, "mint", targetDevice);
  if (!primaryPath) return null;
  return {
    offer: { ...offer, merchant, confidenceLabel: confidenceLabels.find((item) => offer.confidenceScore >= item.threshold)?.label ?? "Moderate" },
    tags: pathTags(offer),
    creditTimeline: offer.valueType === "gift_card" ? "Store-balance value available after acceptance" : "Immediate credit at checkout or after inspection",
    acceptedDevices: offer.acceptedTradeInDevices.slice(0, 10).join(", "),
    acquisitionSummary: "This simplified product centers on using your current phone first. Acquisition comps are only shown on arbitrage pages.",
    primaryPath,
  };
}

export function getComparePageModel(slug: string): ComparePageModel | null {
  const comparison = topUpgradeComparisons.find((entry) => entry.slug === slug);
  if (!comparison) return null;
  const oldDevice = getDevice(comparison.oldDeviceSlug);
  const newDevice = getDevice(comparison.newDeviceSlug);
  if (!oldDevice || !newDevice) return null;
  return {
    title: `${oldDevice.model} to ${newDevice.model}`,
    description: `Compare the cleanest store paths for moving from ${oldDevice.model} to ${newDevice.model}.`,
    boards: buildUpgradeOptimizer({ currentDeviceSlug: oldDevice.slug, targetDeviceSlug: newDevice.slug, condition: "good" }).boards,
  };
}



