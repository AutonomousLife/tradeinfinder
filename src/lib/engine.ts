import {
  acquisitionSources,
  alertSubscriptions,
  devices,
  manualOverrides,
  merchants,
  offers,
  quoteJobs,
  quoteRuns,
  rawIngestRecords,
  resaleEstimates,
  savedScenarios,
  topUpgradeComparisons,
  watchedItems,
} from "@/lib/seed-data";
import { buildResolvedValue, fallbackLabel } from "@/lib/accuracy";
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
  FallbackLevel,
  HomepageSnapshot,
  MerchantPageModel,
  MethodologyModel,
  OfferPageModel,
  RankedPath,
  ResolvedValue,
  SellVsTradeModel,
  SellVsTradeOption,
  Store,
  TradeInFinderModel,
  UpgradeBoard,
  ValueRecord,
  ValueType,
} from "@/lib/schema";

type PathSort = "highest-value" | "easiest" | "best-upgrade" | "highest-confidence" | "newest";

type FinderArgs = {
  currentDeviceSlug: string;
  targetDeviceSlug?: string;
  condition: Condition;
  merchantSlug?: string;
  valueType?: ValueType | "all";
  sortBy?: PathSort;
};

type UpgradeArgs = {
  currentDeviceSlug: string;
  targetDeviceSlug: string;
  condition: Condition;
  merchantSlug?: string;
  sortBy?: PathSort;
};

type ResolvedRecord = {
  record: ValueRecord;
  fallbackLevel: FallbackLevel;
  whyValue: string;
  rationale: ResolvedValue["confidenceRationale"];
};

const CURRENT_YEAR = 2026;
const EXACT_FALLBACK_LEVEL: Record<ValueRecord["verificationStatus"], FallbackLevel> = {
  verified: "exact_verified",
  manual: "exact_verified",
  estimated: "exact_estimated",
  stale: "exact_estimated",
  low_confidence: "exact_estimated",
};

const devicesBySlug = new Map(devices.map((device) => [device.slug, device]));
const devicesById = new Map(devices.map((device) => [device.id, device]));
const merchantsBySlug = new Map(merchants.map((merchant) => [merchant.slug, merchant]));
const merchantsById = new Map(merchants.map((merchant) => [merchant.id, merchant]));
const rawIngestById = new Map(rawIngestRecords.map((record) => [record.id, record]));
const publicOffers = offers.filter((record) => record.publicVisible);

function getDevice(slug?: string) {
  return slug ? devicesBySlug.get(slug) : undefined;
}

function getStore(slug?: string) {
  return slug ? merchantsBySlug.get(slug) : undefined;
}

function storeById(id: string) {
  return merchantsById.get(id);
}

function deviceById(id: string) {
  return devicesById.get(id);
}

function formatValueType(valueType: ValueType) {
  if (valueType === "instant_credit") return "Instant credit";
  if (valueType === "gift_card") return "Gift card";
  if (valueType === "store_credit") return "Store credit";
  if (valueType === "purchase_credit") return "Purchase credit";
  return "Resale estimate";
}

function conditionLabel(condition: Condition) {
  if (condition === "good") return "Good";
  if (condition === "damaged") return "Damaged";
  return "Poor / not accepted";
}

function familyKey(device: Device) {
  return `${device.brand}:${device.model.replace(/\s+\d+GB$/i, "").toLowerCase()}`;
}

function valueTypeUsability(valueType: ValueType) {
  if (valueType === "instant_credit") return 1;
  if (valueType === "purchase_credit") return 0.98;
  if (valueType === "store_credit") return 0.93;
  if (valueType === "gift_card") return 0.9;
  return 0.86;
}

function valueTypePenalty(valueType: ValueType) {
  if (valueType === "instant_credit") return 0;
  if (valueType === "purchase_credit") return 6;
  if (valueType === "store_credit") return 12;
  if (valueType === "gift_card") return 18;
  return 24;
}

function effortLabel(valueType: ValueType, acquisition: AcquisitionSource | null): RankedPath["effortLabel"] {
  if (acquisition) return "higher effort";
  if (valueType === "instant_credit" || valueType === "purchase_credit") return "easy";
  return "moderate";
}

function riskLevel(confidence: number, resolved: ResolvedValue, acquisition: AcquisitionSource | null): RankedPath["riskLevel"] {
  if (!resolved.stale && confidence >= 0.86 && !acquisition) return "low";
  if (confidence >= 0.68) return "medium";
  return "high";
}

function biggestCaveat(resolved: ResolvedValue, record: ValueRecord) {
  if (resolved.stale) return "Stale value. Verify with the store before acting.";
  if (resolved.fallbackLevel === "family_estimate") return "This is a family-level estimate, not an exact device match.";
  if (resolved.fallbackLevel === "storage_adjusted") return "Value was adjusted from a different storage tier of the same phone.";
  if (record.valueType === "gift_card") return "Value is paid as store balance, not cash.";
  if (record.valueType === "store_credit") return "Value only helps if this store is still the best place to buy next.";
  if (record.valueType === "purchase_credit") return "Credit usually applies only when you buy a phone in the same checkout flow.";
  return "Final inspection can still change the store's payout if condition does not match.";
}

function targetCompatible(store: Store, targetDevice?: Device, record?: ValueRecord) {
  if (!targetDevice) return true;
  if (record?.targetDeviceSlug) return record.targetDeviceSlug === targetDevice.slug;
  if (store.slug === "apple") return targetDevice.brand === "Apple";
  if (store.slug === "samsung") return targetDevice.brand === "Samsung";
  if (store.slug === "google-store") return targetDevice.brand === "Google";
  return ["best-buy", "amazon", "ebay"].includes(store.slug);
}

function resolveValueRecord(args: {
  device: Device;
  merchant: Store;
  condition: Condition;
  valueType?: ValueType | "all";
}): ResolvedRecord | null {
  const base = publicOffers.filter((record) => {
    if (!record.active) return false;
    if (record.merchantId !== args.merchant.id) return false;
    if (args.valueType && args.valueType !== "all" && record.valueType !== args.valueType) return false;
    return record.condition === args.condition;
  });

  const exact = base
    .filter((record) => record.deviceId === args.device.id)
    .sort((a, b) => b.confidenceScore - a.confidenceScore || new Date(b.retrievedAt).getTime() - new Date(a.retrievedAt).getTime())[0];
  if (exact) {
    return {
      record: exact,
      fallbackLevel: EXACT_FALLBACK_LEVEL[exact.verificationStatus],
      whyValue: `Exact ${args.device.model} ${exact.storageVariant} match from ${exact.sourceName}.`,
      rationale: [
        { label: "Match", impact: "Exact device, storage, and condition match." },
        { label: "Source", impact: `Pulled from ${exact.sourceName}.` },
        { label: "Status", impact: `Marked ${exact.verificationStatus.replace(/_/g, " ")}.` },
      ],
    };
  }

  const sameModel = base
    .filter((record) => {
      const candidate = deviceById(record.deviceId);
      return candidate ? candidate.brand === args.device.brand && candidate.model === args.device.model : false;
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore || new Date(b.retrievedAt).getTime() - new Date(a.retrievedAt).getTime())[0];
  if (sameModel) {
    const candidateDevice = deviceById(sameModel.deviceId)!;
    const sourceMsrp = candidateDevice.msrp || args.device.msrp;
    const adjustedAmount = Math.max(0, Math.round(sameModel.valueAmount * (args.device.msrp / sourceMsrp)));
    const adjusted: ValueRecord = {
      ...sameModel,
      id: `${sameModel.id}-storage-adjusted-${args.device.id}`,
      slug: `${sameModel.slug}-storage-adjusted-${args.device.slug}`,
      deviceId: args.device.id,
      storageVariant: args.device.storageVariants[0] ?? sameModel.storageVariant,
      valueAmount: adjustedAmount,
      exactStorageMatch: false,
      confidenceScore: Math.max(0.4, Number((sameModel.confidenceScore - 0.08).toFixed(2))),
      notes: `${sameModel.notes} Adjusted from ${candidateDevice.model} ${sameModel.storageVariant} to ${args.device.storageVariants[0] ?? "selected storage"}.`,
    };
    return {
      record: adjusted,
      fallbackLevel: "storage_adjusted",
      whyValue: `Adjusted from ${candidateDevice.model} ${sameModel.storageVariant} because an exact storage match was unavailable.`,
      rationale: [
        { label: "Fallback", impact: "Same phone model, different storage tier." },
        { label: "Adjustment", impact: "Scaled using MSRP difference between storage tiers." },
        { label: "Confidence", impact: "Lowered because exact storage was unavailable." },
      ],
    };
  }

  const family = base
    .filter((record) => {
      const candidate = deviceById(record.deviceId);
      return candidate
        ? (candidate.brand === args.device.brand && familyKey(candidate) === familyKey(args.device)) ||
            (candidate.brand === args.device.brand && Math.abs(candidate.year - args.device.year) <= 1)
        : false;
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore || new Date(b.retrievedAt).getTime() - new Date(a.retrievedAt).getTime())[0];
  if (family) {
    const candidateDevice = deviceById(family.deviceId)!;
    const yearPenalty = Math.max(-0.18, Math.min(0.18, (args.device.year - candidateDevice.year) * 0.06));
    const adjustedAmount = Math.max(0, Math.round(family.valueAmount * (1 + yearPenalty)));
    const inferred: ValueRecord = {
      ...family,
      id: `${family.id}-family-estimate-${args.device.id}`,
      slug: `${family.slug}-family-estimate-${args.device.slug}`,
      deviceId: args.device.id,
      storageVariant: args.device.storageVariants[0] ?? family.storageVariant,
      valueAmount: adjustedAmount,
      exactStorageMatch: false,
      confidenceScore: Math.max(0.35, Number((family.confidenceScore - 0.18).toFixed(2))),
      verificationStatus: "low_confidence",
      notes: `${family.notes} Estimated from ${candidateDevice.brand} ${candidateDevice.model}.`,
    };
    return {
      record: inferred,
      fallbackLevel: "family_estimate",
      whyValue: `Estimated from similar ${candidateDevice.brand} family data because no exact listing was available.`,
      rationale: [
        { label: "Fallback", impact: "Closest family-level match in the same brand." },
        { label: "Adjustment", impact: "Shifted for model year difference." },
        { label: "Confidence", impact: "Shown as a range instead of an exact amount." },
      ],
    };
  }

  return null;
}

function resaleForDevice(device: Device, condition: Condition) {
  return resaleEstimates
    .filter((estimate) => estimate.deviceId === device.id && estimate.condition === condition && estimate.active)
    .sort((a, b) => b.confidenceScore - a.confidenceScore || b.valueAmount - a.valueAmount)[0] ?? null;
}

function adjustedConfidence(record: ValueRecord, merchant: Store, resolved: ResolvedValue) {
  const freshnessPenalty = resolved.stale ? 0.16 : 0;
  const fallbackPenalty = resolved.fallbackLevel === "storage_adjusted" ? 0.08 : resolved.fallbackLevel === "family_estimate" ? 0.18 : 0;
  const giftPenalty = record.valueType === "gift_card" ? 0.02 : 0;
  const score = record.confidenceScore * 0.62 + merchant.trustScore * 0.3 - freshnessPenalty - fallbackPenalty - giftPenalty;
  return Math.max(0.22, Number(score.toFixed(2)));
}

function computePathScore(path: RankedPath, sortBy: PathSort = "highest-value") {
  const freshnessBoost = path.resolvedValue.stale ? -32 : 18;
  const matchBoost = path.resolvedValue.fallbackLevel === "exact_verified" ? 26 : path.resolvedValue.fallbackLevel === "exact_estimated" ? 14 : path.resolvedValue.fallbackLevel === "storage_adjusted" ? 0 : -26;
  const base = path.netValue * 0.52 + path.instantValue * 0.18 + path.confidence * 100 * 0.2 + path.merchant.trustScore * 100 * 0.1 + freshnessBoost + matchBoost;

  if (sortBy === "easiest") return base + (path.effortLabel === "easy" ? 28 : path.effortLabel === "moderate" ? 10 : -18) - valueTypePenalty(path.offer.valueType);
  if (sortBy === "best-upgrade") return base + (1000 - path.effectiveUpgradeCost);
  if (sortBy === "highest-confidence") return path.confidence * 100 + (path.resolvedValue.stale ? -20 : 10);
  if (sortBy === "newest") return new Date(path.offer.retrievedAt).getTime();
  return base;
}

function pathTags(path: RankedPath) {
  return [
    formatValueType(path.offer.valueType),
    path.resolvedValue.confidenceLabel,
    path.resolvedValue.freshnessLabel,
    fallbackLabel(path.resolvedValue.fallbackLevel),
  ];
}

function createPath(args: {
  device: Device;
  record: ValueRecord;
  resolvedValue: ResolvedValue;
  targetDevice?: Device;
  acquisition?: AcquisitionSource | null;
}): RankedPath | null {
  const merchant = storeById(args.record.merchantId);
  if (!merchant) return null;
  if (!targetCompatible(merchant, args.targetDevice, args.record)) return null;

  const resale = resaleForDevice(args.device, args.record.condition);
  const acquisition = args.acquisition ?? null;
  const gross = args.record.valueAmount;
  const instantValue = Math.max(0, Math.round(gross * valueTypeUsability(args.record.valueType)));
  const netValue = Math.max(0, gross - (acquisition?.estimatedPrice ?? 0));
  const effectiveUpgradeCost = args.targetDevice ? Math.max(args.targetDevice.msrp - instantValue, 0) : 0;
  const confidence = adjustedConfidence(args.record, merchant, args.resolvedValue);
  const effort = effortLabel(args.record.valueType, acquisition);

  const path: RankedPath = {
    slug: acquisition ? `${args.device.slug}-${args.record.slug}-${acquisition.id}` : `${args.device.slug}-${args.record.slug}`,
    label: `${merchant.name} ${formatValueType(args.record.valueType).toLowerCase()}`,
    summary: args.targetDevice
      ? `${args.resolvedValue.displayValue} at ${merchant.name} brings ${args.targetDevice.model} to about ${formatCurrency(effectiveUpgradeCost)}.`
      : `${args.resolvedValue.displayValue} from ${merchant.name} with ${args.resolvedValue.confidenceLabel.toLowerCase()} support.`,
    reasonBadge: args.resolvedValue.fallbackLevel === "exact_verified"
      ? "Best verified value"
      : args.record.valueType === "instant_credit"
        ? "Best instant value"
        : args.record.valueType === "purchase_credit"
          ? "Best upgrade path"
          : "Best direct trade-in",
    device: args.device,
    merchant,
    offer: args.record,
    acquisition,
    resolvedValue: args.resolvedValue,
    netValue,
    effectiveUpgradeCost,
    instantValue,
    confidence,
    trustAdjustedScore: 0,
    biggestCaveat: biggestCaveat(args.resolvedValue, args.record),
    explanation: `${args.resolvedValue.whyValue} ${args.resolvedValue.stale ? "The record is stale and was deprioritized." : "Freshness and merchant trust improved its rank."}`,
    tags: [],
    riskLevel: riskLevel(confidence, args.resolvedValue, acquisition),
    valueTimelineLabel: args.record.valueType === "gift_card" ? "Gift card after acceptance" : args.record.valueType === "store_credit" ? "Store credit" : "Immediate usable value",
    resaleNetValue: resale?.valueAmount,
    resaleDelta: resale ? netValue - resale.valueAmount : undefined,
    effortLabel: effort,
    links: buildPathLinks({ deviceSlug: args.device.slug, acquisition, merchant, targetDeviceSlug: args.targetDevice?.slug ?? args.record.targetDeviceSlug ?? undefined, deviceLabel: args.device.model, targetDeviceLabel: args.targetDevice?.model, sourceUrl: args.record.sourceUrl }),
  };

  path.tags = pathTags(path);
  path.trustAdjustedScore = computePathScore(path);
  return path;
}

function sortPaths(paths: RankedPath[], sortBy?: PathSort) {
  return [...paths].sort((a, b) => computePathScore(b, sortBy) - computePathScore(a, sortBy));
}

function candidatePaths(device: Device, condition: Condition, targetDevice?: Device, merchantSlug?: string, valueType?: ValueType | "all") {
  return merchants
    .filter((merchant) => !merchantSlug || merchant.slug === merchantSlug)
    .map((merchant) => {
      const resolved = resolveValueRecord({ device, merchant, condition, valueType });
      if (!resolved) return null;
      const resolvedValue = buildResolvedValue(resolved.record, resolved.fallbackLevel, resolved.whyValue, resolved.rationale);
      return createPath({ device, record: resolved.record, resolvedValue, targetDevice });
    })
    .filter((path): path is RankedPath => Boolean(path));
}

function sellVsTradeOptions(device: Device, condition: Condition, targetDevice?: Device): SellVsTradeOption[] {
  const tradePaths = sortPaths(candidatePaths(device, condition, targetDevice)).slice(0, 3);
  const resale = resaleForDevice(device, condition);
  const options: SellVsTradeOption[] = [];

  if (tradePaths[0]) {
    options.push({
      slug: `${device.slug}-trade`,
      type: "trade_in",
      title: `Trade in at ${tradePaths[0].merchant.name}`,
      subtitle: `${tradePaths[0].resolvedValue.displayValue} ${formatValueType(tradePaths[0].offer.valueType).toLowerCase()}`,
      value: tradePaths[0].netValue,
      displayValue: tradePaths[0].resolvedValue.displayValue,
      confidence: tradePaths[0].confidence,
      confidenceLabel: tradePaths[0].resolvedValue.confidenceLabel,
      speed: "Fast",
      effort: tradePaths[0].effortLabel === "easy" ? "Low effort" : "Medium effort",
      risk: tradePaths[0].riskLevel === "low" ? "Low risk" : "Moderate risk",
      caveat: tradePaths[0].biggestCaveat,
      label: "Best direct trade-in",
      href: `/trade-in/${device.slug}/${tradePaths[0].merchant.slug}`,
      freshnessLabel: tradePaths[0].resolvedValue.freshnessLabel,
    });
  }

  if (resale) {
    const resolved = buildResolvedValue(
      resale,
      resale.verificationStatus === "verified" || resale.verificationStatus === "manual" ? "exact_verified" : "exact_estimated",
      `Exact ${device.model} resale estimate from ${resale.sourceName}.`,
      [
        { label: "Source", impact: `Benchmarked from ${resale.sourceName}.` },
        { label: "Net value", impact: "Fees are already deducted from the estimate." },
      ],
    );
    options.push({
      slug: `${device.slug}-resale`,
      type: "resale",
      title: "Sell it yourself",
      subtitle: `${resolved.displayValue} estimated net after fees`,
      value: resale.valueAmount,
      displayValue: resolved.displayValue,
      confidence: resale.confidenceScore,
      confidenceLabel: resolved.confidenceLabel,
      speed: "Slower",
      effort: "Higher effort",
      risk: "More variance",
      caveat: "Listing quality, fees, and timing can move real resale results.",
      label: "Best resale alternative",
      href: `/resale-vs-trade/${device.slug}`,
      freshnessLabel: resolved.freshnessLabel,
    });
  }

  if (targetDevice) {
    const bestUpgrade = sortPaths(candidatePaths(device, condition, targetDevice), "best-upgrade")[0];
    if (bestUpgrade) {
      options.push({
        slug: `${device.slug}-upgrade`,
        type: "upgrade",
        title: `Upgrade at ${bestUpgrade.merchant.name}`,
        subtitle: `${targetDevice.model} for about ${formatCurrency(bestUpgrade.effectiveUpgradeCost)}`,
        value: bestUpgrade.netValue,
        displayValue: bestUpgrade.resolvedValue.displayValue,
        confidence: bestUpgrade.confidence,
        confidenceLabel: bestUpgrade.resolvedValue.confidenceLabel,
        speed: "Fast",
        effort: bestUpgrade.effortLabel === "easy" ? "Low effort" : "Medium effort",
        risk: bestUpgrade.riskLevel === "low" ? "Low risk" : "Moderate risk",
        caveat: bestUpgrade.biggestCaveat,
        label: "Best upgrade path",
        href: `/upgrade-path/${device.slug}/${targetDevice.slug}`,
        freshnessLabel: bestUpgrade.resolvedValue.freshnessLabel,
      });
    }
  }

  return options.sort((a, b) => b.value - a.value);
}

export function hasDeviceSlug(slug: string) {
  return devicesBySlug.has(slug);
}

export function hasMerchantSlug(slug: string) {
  return merchantsBySlug.has(slug);
}

export function buildTradeInFinder(args: FinderArgs): TradeInFinderModel {
  const currentDevice = getDevice(args.currentDeviceSlug) ?? devices[0];
  const targetDevice = getDevice(args.targetDeviceSlug);
  const merchant = getStore(args.merchantSlug);
  const paths = sortPaths(candidatePaths(currentDevice, args.condition, targetDevice, args.merchantSlug, args.valueType), args.sortBy);
  const resale = resaleForDevice(currentDevice, args.condition);
  const top = paths[0];

  return {
    inputs: { currentDevice, targetDevice, merchant, condition: args.condition },
    summary: {
      bestTradeInValue: top?.resolvedValue.displayValue ?? "Unavailable",
      bestTradeInLabel: top ? `${top.merchant.name} ${formatValueType(top.offer.valueType).toLowerCase()}` : "No live store quote captured",
      bestResaleValue: resale ? buildResolvedValue(resale, resale.verificationStatus === "verified" || resale.verificationStatus === "manual" ? "exact_verified" : "exact_estimated", `Exact ${currentDevice.model} resale estimate.`, [{ label: "Source", impact: `Based on ${resale.sourceName}.` }]).displayValue : "Unavailable",
      bestResaleLabel: resale ? `${resale.sourceName} net estimate` : "No resale estimate",
      bestUpgradeValue: targetDevice && top ? formatCurrency(top.effectiveUpgradeCost) : "Choose a target phone",
      bestUpgradeLabel: targetDevice && top ? `${top.merchant.name} keeps the upgrade simple` : targetDevice ? "No live store quote captured for this upgrade" : "Add a target phone for upgrade math",
      avgConfidence: paths.length ? paths.reduce((sum, path) => sum + path.confidence, 0) / paths.length : 0,
    },
    whyTopResult: top
      ? [
          { label: "Why this value", copy: top.resolvedValue.whyValue },
          { label: "Source and freshness", copy: `${top.offer.sourceName}. ${top.resolvedValue.freshnessLabel}.` },
          { label: "Confidence", copy: `${top.resolvedValue.confidenceLabel}. ${top.resolvedValue.confidenceRationale.map((item) => `${item.label}: ${item.impact}`).join(" ")}` },
        ]
      : [],
    paths,
    sellVsTrade: sellVsTradeOptions(currentDevice, args.condition, targetDevice),
    chart: paths.slice(0, 5).map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.resaleNetValue ?? 0 })),
  };
}

export function buildUpgradeOptimizer(args: UpgradeArgs) {
  const currentDevice = getDevice(args.currentDeviceSlug) ?? devices[0];
  const targetDevice = getDevice(args.targetDeviceSlug) ?? devices[0];
  const merchant = getStore(args.merchantSlug);
  const allPaths = sortPaths(candidatePaths(currentDevice, args.condition, targetDevice, args.merchantSlug), args.sortBy);
  const direct = allPaths.filter((path) => ["apple", "samsung", "google-store"].includes(path.merchant.slug));
  const flexible = allPaths.filter((path) => ["best-buy", "amazon"].includes(path.merchant.slug));

  return {
    inputs: { currentDevice, targetDevice, merchant, condition: args.condition },
    boards: [
      {
        kicker: "Best simple path",
        title: `Upgrade ${currentDevice.model} to ${targetDevice.model}`,
        description: "Verified exact matches and fresher values outrank thin estimates, even when the estimate is slightly higher.",
        paths: allPaths.slice(0, 3),
      },
      {
        kicker: "Brand-native stores",
        title: "Best direct brand upgrade paths",
        description: "Brand stores stay high when they offer exact, verified purchase credit toward the target phone.",
        paths: direct.slice(0, 3),
      },
      {
        kicker: "Flexible retailers",
        title: "Best cross-brand upgrade paths",
        description: "Retailer paths stay visible when they keep value high without leaning on lower-trust estimates.",
        paths: flexible.slice(0, 3),
      },
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
      { label: "Best trade-in", value: bestTrade?.displayValue ?? "Unavailable", copy: bestTrade?.title ?? "No reliable store value found" },
      { label: "Best resale net", value: bestResale?.displayValue ?? "Unavailable", copy: bestResale?.title ?? "No resale estimate found" },
      { label: "Difference", value: formatCurrency(Math.abs(gap)), copy: gap > 40 ? "Resale likely pays more" : "Trade-in is close once convenience matters" },
    ],
    options,
    recommendation: gap > 40
      ? { title: "Sell if maximizing dollars matters", copy: `Resale likely beats the top trade-in by about ${formatCurrency(gap)}, but it comes with more work and more uncertainty.` }
      : { title: "Trade in if simplicity matters", copy: "The value gap is small enough that fast store credit is likely the cleaner move for most people." },
    chart: [
      { label: "Trade in", tradeIn: bestTrade?.value ?? 0, resale: 0 },
      { label: "Sell yourself", tradeIn: 0, resale: bestResale?.value ?? 0 },
    ],
  };
}

export function buildArbitrageExplorer(): ArbitrageExplorerModel {
  const paths = sortPaths(
    acquisitionSources.flatMap((acquisition) => {
      const device = deviceById(acquisition.deviceId);
      if (!device) return [];
      return merchants
        .map((merchant) => {
          const resolved = resolveValueRecord({ device, merchant, condition: acquisition.condition });
          if (!resolved) return null;
          const resolvedValue = buildResolvedValue(resolved.record, resolved.fallbackLevel, resolved.whyValue, resolved.rationale);
          return createPath({ device, record: resolved.record, resolvedValue, targetDevice: getDevice(resolved.record.targetDeviceSlug ?? undefined), acquisition });
        })
        .filter((path): path is RankedPath => Boolean(path))
        .filter((path) => path.netValue > 60);
    }),
    "highest-value",
  ).slice(0, 6);

  return {
    summary: [
      { label: "Best spread", value: paths[0]?.resolvedValue.displayValue ?? "Unavailable", copy: "Top value before subtracting the used-phone buy cost." },
      { label: "Opportunities", value: String(paths.length), copy: "Paths where a buy-first move still survives confidence and freshness checks." },
      { label: "Guardrails", value: "Trust-weighted", copy: "Low-confidence or stale values are pushed down even when the headline number is high." },
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
      { eyebrow: "Best direct trade-ins", title: "Strong immediate-value paths", description: publicOffers.length ? "Exact and recently checked values rank first, with estimated fallbacks clearly labeled." : "This section stays empty until a live quote capture exists.", paths: bestTrade.slice(0, 3) },
      { eyebrow: "Best Samsung upgrades", title: "Clean Galaxy upgrade paths", description: "Useful when you want simple purchase-credit value without hidden lock-in.", paths: bestSamsung.slice(0, 3) },
      { eyebrow: "Best Pixel upgrades", title: "Best current Pixel paths", description: "Google and retailer options compared with confidence and freshness built in.", paths: bestPixel.slice(0, 3) },
    ],
  };
}

export function buildHomepageSnapshot(): HomepageSnapshot {
  const exampleFinder = buildTradeInFinder({ currentDeviceSlug: "iphone-13-128", targetDeviceSlug: "iphone-16-pro-256", condition: "good" });
  const examplePath = exampleFinder.paths[0];
  const sellVsTrade = buildSellVsTradeModel("iphone-13-128", "good");
  const bestDeals = buildDealsHub().sections.flatMap((section) => section.paths).slice(0, 3);
  const freshest = rawIngestRecords
    .map((record) => record.retrievedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? new Date().toISOString();

  return {
    freshness: freshest,
    devices: devices.slice(0, 24),
    merchants,
    examplePath,
    heroStats: {
      bestDirectValue: bestDeals[0]?.resolvedValue.displayValue ?? "No live quote",
      bestResaleValue: sellVsTrade?.options.find((option) => option.type === "resale")?.displayValue ?? "Unavailable",
      offerCount: publicOffers.length,
      deviceCoverage: devices.length,
      avgConfidence: publicOffers.length ? publicOffers.reduce((sum, offer) => sum + offer.confidenceScore, 0) / publicOffers.length : 0,
    },
    merchantStrip: merchants.map((merchant) => merchant.name),
    trustItems: [
      { label: "Source-backed values", value: `${rawIngestRecords.length} ingest snapshots`, copy: "Snapshots are stored even when the public site withholds the value until a live quote is captured." },
      { label: "Simple value types", value: "Instant, store, gift card, purchase credit", copy: "No carrier bill-credit math in the core ranking." },
      { label: "Confidence aware", value: "Ranges when certainty is low", copy: "Low-confidence estimates stop pretending to be exact numbers." },
      { label: "Live quote gate", value: `${publicOffers.length} public quote${publicOffers.length === 1 ? "" : "s"}`, copy: "Seeded and manual values stay in admin until a true quote capture exists." },
    ],
    methodologySteps: [
      { kicker: "1", title: "Capture source data", copy: "Raw merchant snapshots are stored before normalization so values can be audited later." },
      { kicker: "2", title: "Require a live quote", copy: "Seeded merchant snapshots stay internal research. Public rankings only use quotes marked safe for display." },
      { kicker: "3", title: "Show value quality", copy: "Each public result shows source, last checked time, confidence, and why that value was chosen. If no live quote exists, the UI says so." },
    ],
    instantVsDelayedChart: bestDeals.map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.resaleNetValue ?? 0 })),
    bestDeals,
    arbitrage: buildArbitrageExplorer().paths.slice(0, 3),
    trendingDevices: [...devices].sort((a, b) => b.searchVolume - a.searchVolume).slice(0, 6),
    differentiators: [
      "Exact verified values rank above bigger-looking stale estimates.",
      "When the app has to infer a number, it says so and often shows a range instead of fake precision.",
      "Every result explains where the value came from and why it appears at that rank.",
    ],
    sellVsTradeHighlights: sellVsTrade?.options.slice(0, 3) ?? [],
    popularTargets: devices.filter((device) => device.year >= CURRENT_YEAR - 2).slice(0, 6),
    upgradeBoards: buildUpgradeOptimizer({ currentDeviceSlug: "iphone-13-128", targetDeviceSlug: "iphone-16-pro-256", condition: "good" }).boards,
    expiringOffers: publicOffers
      .map((offer) => ({
        slug: offer.slug,
        merchant: storeById(offer.merchantId)?.name ?? offer.merchantId,
        target: offer.targetDeviceSlug ?? "Compatible phones",
        ends: new Date(new Date(offer.retrievedAt).getTime() + offer.staleAfterHours * 60 * 60 * 1000).toISOString(),
        value: buildResolvedValue(offer, EXACT_FALLBACK_LEVEL[offer.verificationStatus], `Exact value from ${offer.sourceName}.`, [{ label: "Source", impact: offer.sourceName }]).displayValue,
      }))
      .sort((a, b) => a.ends.localeCompare(b.ends))
      .slice(0, 4),
    linkSystem: [
      { title: "Store links stay modular", copy: "Each result can carry a direct or affiliate link without affecting the underlying rank." },
      { title: "Monetization stays secondary", copy: "Usable value, confidence, and freshness all outrank any link strategy." },
    ],
  };
}

export function buildDashboardModel(): DashboardModel {
  return {
    summary: [
      { label: "Saved scenarios", value: String(savedScenarios.length), copy: "Ready for signed-in persistence once Supabase auth is connected." },
      { label: "Watched items", value: String(watchedItems.length), copy: "Device and store monitoring hooks for future alerts." },
      { label: "Alert hooks", value: String(alertSubscriptions.length), copy: "Notification foundations for value-change and expiring-offer updates." },
    ],
    notificationHooks: [
      { title: "Value-change alerts", copy: "Trigger when a watched phone moves meaningfully at a trusted store." },
      { title: "Freshness warnings", copy: "Notify when a saved scenario relies on stale values that need re-checking." },
      { title: "Best-path changes", copy: "Show when a previously saved upgrade path loses the top spot." },
    ],
  };
}

export function buildMethodologyModel(): MethodologyModel {
  return {
    sections: [
      {
        title: "How values are normalized",
        copy: "Every value record includes a source URL, raw ingest reference, retrieval time, staleness threshold, confidence score, and verification status.",
        points: [
          "Value types stay separate: instant credit, store credit, gift card, purchase credit, and resale estimate.",
          "User-facing conditions are simplified to Good, Damaged, and Poor / not accepted.",
          "Values without source or freshness metadata are not allowed into the normalized layer.",
        ],
      },
      {
        title: "Confidence and freshness",
        copy: "Confidence rises when the match is exact, recent, parser quality is high, and the merchant itself is trustworthy.",
        points: [
          "Verified values can still go stale if they age past the record's freshness threshold.",
          "Low-confidence or family-level estimates show as ranges instead of fake exact amounts.",
          "Manual overrides can improve trust when an admin has reviewed the value directly.",
        ],
      },
      {
        title: "Fallback hierarchy",
        copy: "TradeInFinder uses the cleanest available match first, then steps down in a visible and honest order.",
        points: [
          "1. Exact verified value",
          "2. Exact estimated value",
          "3. Same model, different storage adjusted estimate",
          "4. Similar family estimate",
          "5. Unavailable",
        ],
      },
      {
        title: "What the ranking rewards",
        copy: "A slightly lower but verified value can rank above a higher stale estimate because trust matters.",
        points: [
          "The ranking blends usable value, freshness, confidence, merchant trust, and exactness of match.",
          "Low-confidence values are visible, but they should not dominate the page just because the raw number is high.",
          "Resale remains clearly labeled as an estimate with more uncertainty than direct store value.",
        ],
      },
    ],
  };
}

export function buildAdminModel(): AdminModel {
  const inspectorPaths = offers.slice(0, 4).map((offer) => {
    const merchant = storeById(offer.merchantId)!;
    const device = deviceById(offer.deviceId)!;
    const fallbackLevel = EXACT_FALLBACK_LEVEL[offer.verificationStatus];
    const resolved = buildResolvedValue(
      offer,
      fallbackLevel,
      `Exact ${device.model} ${offer.storageVariant} value from ${offer.sourceName}.`,
      [
        { label: "Parser", impact: rawIngestById.get(offer.rawSourceId)?.merchantParserVersion ?? "Unknown parser version" },
        { label: "Condition", impact: `Mapped to ${conditionLabel(offer.condition)}.` },
      ],
    );
    return {
      title: `${merchant.name} - ${device.model}`,
      rawSource: `${offer.sourceName} (${offer.rawSourceId})`,
      normalizedValue: `${resolved.displayValue} ${formatValueType(offer.valueType).toLowerCase()}`,
      confidence: `${resolved.confidenceLabel} (${Math.round(offer.confidenceScore * 100)}%)`,
      fallback: fallbackLabel(resolved.fallbackLevel),
      stale: resolved.stale ? "Yes" : "No",
    };
  });

  return {
    summary: [
      { label: "Devices", value: String(devices.length), copy: "Phone catalog available for exact and fallback matching." },
      { label: "Stores", value: String(merchants.length), copy: "Merchant adapters keep parsing logic separated by source." },
      { label: "Public quotes", value: String(publicOffers.length), copy: "Only public-visible live quote records rank on the public site." },
      { label: "Raw ingest", value: String(rawIngestRecords.length), copy: "Auditable snapshots for parser QA and manual review." },
    ],
    collections: [
      { title: "Raw ingest", copy: "Stored payload snapshots, parser version, parse status, and errors for every merchant source.", count: String(rawIngestRecords.length) },
      { title: "Normalized values", copy: "Device-specific value records with staleness windows, confidence, verification status, and public visibility.", count: String(offers.length + resaleEstimates.length) },
      { title: "Manual overrides", copy: "Admin-reviewed value corrections that can force a manual status or disable bad records.", count: String(manualOverrides.length) },
      { title: "Resale benchmarks", copy: "Estimated sell-it-yourself net values kept separate from store trade-in records.", count: String(resaleEstimates.length) },
    ],
    actions: [
      { title: "Update value", copy: "Correct a single bad value without waiting for the next parser run." },
      { title: "Mark verified or stale", copy: "Move records between review states as they age or get checked manually." },
      { title: "Inspect parser output", copy: "Compare the raw source snapshot with the normalized result and confidence rationale." },
    ],
    inspectors: inspectorPaths,
    overrides: manualOverrides.map((override) => ({
      title: `${storeById(override.merchantId)?.name ?? override.merchantId} override`,
      status: `${override.verificationStatus} - ${override.active ? "active" : "disabled"}`,
      note: override.notes,
    })),
    quoteRuns: quoteRuns.map((run) => ({
      title: `${storeById(run.merchantId)?.name ?? run.merchantId} · ${run.deviceSlug}`,
      status: run.status,
      note: run.error ?? `Started ${run.startedAt}`,
    })),
    quoteJobs: quoteJobs.map((job) => ({
      title: `${storeById(job.merchantId)?.name ?? job.merchantId} refresh`,
      status: job.status,
      note: job.note,
    })),
  };
}

export function getDevicePageModel(slug: string): DevicePageModel | null {
  const device = getDevice(slug);
  if (!device) return null;
  const targetSlug = device.brand === "Apple" ? "iphone-16-pro-256" : device.brand === "Samsung" ? "galaxy-s24-ultra-256" : device.brand === "Google" ? "pixel-9-pro-256" : "iphone-16-128";
  const sellVsTrade = buildSellVsTradeModel(slug, "good");
  if (!sellVsTrade) return null;
  const paths = buildTradeInFinder({ currentDeviceSlug: slug, targetDeviceSlug: targetSlug, condition: "good" }).paths.slice(0, 6);
  return {
    device,
    chart: paths.map((path) => ({ label: path.merchant.name, instant: path.instantValue, delayed: path.resaleNetValue ?? 0 })),
    paths,
    sellVsTrade,
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
  const sampleDevices = devices
    .filter((device) => merchant.slug === "apple" ? device.brand === "Apple" : merchant.slug === "samsung" ? device.brand === "Samsung" : merchant.slug === "google-store" ? device.brand === "Google" : true)
    .slice(0, 6);
  const paths = sortPaths(sampleDevices.flatMap((device) => candidatePaths(device, "good", undefined, merchant.slug))).slice(0, 6);
  return {
    merchant,
    tags: [merchant.type, `Trust ${Math.round(merchant.trustScore * 100)}%`, merchant.affiliateCapable ? "Affiliate-ready" : "Direct links"],
    paths,
    rules: [
      "Each value shows a source, freshness label, and confidence label.",
      "Stale or fallback estimates stay visible but rank lower than fresh exact matches.",
      "Poor-condition devices are treated as not accepted unless the source says otherwise.",
    ],
    relatedLinks: sampleDevices.slice(0, 3).map((device) => ({ label: `${device.model} trade-in`, href: `/trade-in/${device.slug}/${merchant.slug}` })),
  };
}

export function getOfferPageModel(slug: string): OfferPageModel | null {
  const offer = offers.find((entry) => entry.slug === slug);
  if (!offer) return null;
  const merchant = storeById(offer.merchantId);
  const device = deviceById(offer.deviceId);
  if (!merchant || !device) return null;
  const targetDevice = getDevice(offer.targetDeviceSlug ?? undefined);
  const resolved = buildResolvedValue(
    offer,
    EXACT_FALLBACK_LEVEL[offer.verificationStatus],
    `Exact ${device.model} ${offer.storageVariant} value from ${offer.sourceName}.`,
    [
      { label: "Source", impact: offer.sourceName },
      { label: "Condition", impact: conditionLabel(offer.condition) },
      { label: "Value type", impact: formatValueType(offer.valueType) },
    ],
  );
  const primaryPath = createPath({ device, record: offer, resolvedValue: resolved, targetDevice });
  if (!primaryPath) return null;
  const acceptedDevices = offers
    .filter((entry) => entry.merchantId === offer.merchantId && entry.valueType === offer.valueType)
    .map((entry) => deviceById(entry.deviceId)?.model)
    .filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index)
    .slice(0, 10)
    .join(", ");

  return {
    offer: { ...offer, merchant, confidenceLabel: resolved.confidenceLabel },
    tags: [formatValueType(offer.valueType), resolved.confidenceLabel, resolved.freshnessLabel, fallbackLabel(resolved.fallbackLevel)],
    creditTimeline: offer.valueType === "gift_card" ? "Gift card after acceptance" : offer.valueType === "store_credit" ? "Store credit after acceptance" : "Credit applied at checkout or immediately after approval",
    acceptedDevices,
    acquisitionSummary: `${resolved.whyValue} ${resolved.stale ? "This value is stale and should be rechecked." : "This value is recent enough to stay in the main ranking."}`,
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
