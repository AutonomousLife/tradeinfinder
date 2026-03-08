import { merchantAdapters } from "@/lib/adapters";
import type {
  AcquisitionSource,
  AlertSubscription,
  Condition,
  Device,
  ManualOverride,
  Merchant,
  QuoteArtifact,
  QuoteJob,
  QuoteRun,
  RawIngestRecord,
  SavedScenario,
  ValueRecord,
  WatchedItem,
} from "@/lib/schema";

const allConditions: Condition[] = ["good", "damaged", "poor"];
const flagshipConditions: Condition[] = ["good", "damaged"];

type DeviceRow = [string, string, string, number, number, string[], number, number, string, string[], Condition[]?];

function makeDevice([slug, brand, model, year, msrp, storageVariants, searchVolume, trendScore, notes, preferredStoreSlugs, supportedConditions]: DeviceRow): Device {
  return {
    id: `dev_${slug.replace(/-/g, "_")}`,
    slug,
    brand,
    model,
    year,
    msrp,
    storageVariants,
    imageUrl: `/devices/${slug}.svg`,
    releaseDate: `${year}-09-15`,
    category: "smartphone",
    supportedConditions: supportedConditions ?? allConditions,
    deprecated: false,
    notes,
    searchVolume,
    trendScore,
    preferredStoreSlugs,
  };
}

const deviceRows: DeviceRow[] = [
  ["iphone-se-2022-128", "Apple", "iPhone SE (2022)", 2022, 479, ["64GB", "128GB"], 19, 8, "Budget iPhone with simple trade-in demand.", ["apple", "best-buy", "amazon"]],
  ["iphone-11-128", "Apple", "iPhone 11", 2019, 699, ["64GB", "128GB"], 67, 16, "Common trade-in baseline.", ["apple", "best-buy", "amazon"]],
  ["iphone-11-pro-256", "Apple", "iPhone 11 Pro", 2019, 999, ["64GB", "256GB", "512GB"], 28, 11, "Older Pro with solid residual value.", ["apple", "best-buy"]],
  ["iphone-11-pro-max-256", "Apple", "iPhone 11 Pro Max", 2019, 1099, ["64GB", "256GB", "512GB"], 26, 10, "Large-screen legacy iPhone.", ["apple", "best-buy"]],
  ["iphone-12-mini-128", "Apple", "iPhone 12 mini", 2020, 729, ["64GB", "128GB", "256GB"], 18, 9, "Compact iPhone with decent resale.", ["apple", "best-buy", "amazon"]],
  ["iphone-12-128", "Apple", "iPhone 12", 2020, 799, ["64GB", "128GB", "256GB"], 64, 21, "Popular sell-vs-trade benchmark.", ["apple", "best-buy", "amazon"]],
  ["iphone-12-pro-256", "Apple", "iPhone 12 Pro", 2020, 999, ["128GB", "256GB", "512GB"], 31, 14, "Older Pro with strong store-credit appeal.", ["apple", "best-buy"]],
  ["iphone-12-pro-max-256", "Apple", "iPhone 12 Pro Max", 2020, 1099, ["128GB", "256GB", "512GB"], 29, 15, "Large-screen Apple option.", ["apple", "best-buy"]],
  ["iphone-13-mini-128", "Apple", "iPhone 13 mini", 2021, 699, ["128GB", "256GB"], 17, 8, "Compact iPhone with niche demand.", ["apple", "best-buy"]],
  ["iphone-13-128", "Apple", "iPhone 13", 2021, 799, ["128GB", "256GB"], 92, 31, "The main benchmark device across the app.", ["apple", "best-buy", "amazon"]],
  ["iphone-13-pro-256", "Apple", "iPhone 13 Pro", 2021, 999, ["128GB", "256GB", "512GB"], 34, 18, "Premium iPhone with strong direct trade value.", ["apple", "best-buy"], flagshipConditions],
  ["iphone-13-pro-max-256", "Apple", "iPhone 13 Pro Max", 2021, 1099, ["128GB", "256GB", "512GB"], 33, 19, "High-value Pro Max.", ["apple", "best-buy"], flagshipConditions],
  ["iphone-14-128", "Apple", "iPhone 14", 2022, 799, ["128GB", "256GB"], 59, 23, "Still a clean upgrade trigger.", ["apple", "best-buy", "amazon"]],
  ["iphone-14-plus-128", "Apple", "iPhone 14 Plus", 2022, 899, ["128GB", "256GB"], 16, 9, "Larger non-Pro iPhone.", ["apple", "best-buy"]],
  ["iphone-14-pro-256", "Apple", "iPhone 14 Pro", 2022, 1099, ["128GB", "256GB", "512GB"], 46, 27, "Strong trade and resale phone.", ["apple", "best-buy"], flagshipConditions],
  ["iphone-14-pro-max-256", "Apple", "iPhone 14 Pro Max", 2022, 1199, ["128GB", "256GB", "512GB"], 42, 25, "Premium iPhone with durable value.", ["apple", "best-buy"], flagshipConditions],
  ["iphone-15-128", "Apple", "iPhone 15", 2023, 799, ["128GB", "256GB"], 48, 34, "Current-gen base iPhone.", ["apple", "best-buy"]],
  ["iphone-15-pro-256", "Apple", "iPhone 15 Pro", 2023, 999, ["128GB", "256GB", "512GB"], 44, 36, "Premium iPhone for strong checkout credit.", ["apple", "best-buy"], flagshipConditions],
  ["iphone-16-128", "Apple", "iPhone 16", 2025, 799, ["128GB", "256GB"], 51, 44, "Current Apple upgrade destination.", ["apple", "best-buy"]],
  ["iphone-16-pro-256", "Apple", "iPhone 16 Pro", 2025, 1099, ["128GB", "256GB", "512GB"], 68, 57, "Premium Apple target.", ["apple", "best-buy"], flagshipConditions],
  ["pixel-5-128", "Google", "Pixel 5", 2020, 699, ["128GB"], 12, 6, "Older Pixel still relevant for trade-in baselines.", ["google-store", "best-buy", "amazon"]],
  ["pixel-5a-128", "Google", "Pixel 5a", 2021, 449, ["128GB"], 11, 6, "Budget Pixel resale benchmark.", ["google-store", "best-buy", "amazon"]],
  ["pixel-6-128", "Google", "Pixel 6", 2021, 599, ["128GB", "256GB"], 18, 11, "Mainline Pixel with active trade-in demand.", ["google-store", "best-buy", "amazon"]],
  ["pixel-6-pro-256", "Google", "Pixel 6 Pro", 2021, 899, ["128GB", "256GB", "512GB"], 13, 10, "Pixel flagship with direct-store appeal.", ["google-store", "best-buy"], flagshipConditions],
  ["pixel-6a-128", "Google", "Pixel 6a", 2022, 449, ["128GB"], 26, 16, "Value Pixel with straightforward store-credit paths.", ["google-store", "best-buy", "amazon"]],
  ["pixel-7-128", "Google", "Pixel 7", 2022, 599, ["128GB", "256GB"], 43, 21, "Popular baseline Pixel.", ["google-store", "best-buy", "amazon"]],
  ["pixel-7a-128", "Google", "Pixel 7a", 2023, 499, ["128GB"], 16, 12, "Affordable Pixel with strong sell-vs-trade relevance.", ["google-store", "best-buy", "amazon"]],
  ["pixel-8-128", "Google", "Pixel 8", 2023, 699, ["128GB", "256GB"], 22, 23, "Current Pixel with good direct-store value.", ["google-store", "best-buy"]],
  ["pixel-8-pro-256", "Google", "Pixel 8 Pro", 2023, 999, ["128GB", "256GB", "512GB"], 19, 24, "Pixel flagship for direct purchase credit.", ["google-store", "best-buy"], flagshipConditions],
  ["pixel-9-pro-256", "Google", "Pixel 9 Pro", 2024, 1099, ["128GB", "256GB", "512GB"], 39, 42, "Current flagship Pixel target.", ["google-store", "best-buy"], flagshipConditions],
  ["galaxy-s20-128", "Samsung", "Galaxy S20", 2020, 999, ["128GB"], 10, 5, "Older Samsung benchmark device.", ["samsung", "best-buy", "amazon"]],
  ["galaxy-s20-plus-128", "Samsung", "Galaxy S20+", 2020, 1199, ["128GB", "512GB"], 9, 5, "Large-screen S20 family model.", ["samsung", "best-buy", "amazon"]],
  ["galaxy-s20-ultra-128", "Samsung", "Galaxy S20 Ultra", 2020, 1399, ["128GB", "512GB"], 11, 6, "Legacy Samsung flagship with trade-in relevance.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-s21-128", "Samsung", "Galaxy S21", 2021, 799, ["128GB", "256GB"], 18, 9, "Common Samsung base model.", ["samsung", "best-buy", "amazon"]],
  ["galaxy-s21-plus-128", "Samsung", "Galaxy S21+", 2021, 999, ["128GB", "256GB"], 12, 7, "Larger S21 variant.", ["samsung", "best-buy"]],
  ["galaxy-s21-ultra-256", "Samsung", "Galaxy S21 Ultra", 2021, 1199, ["128GB", "256GB", "512GB"], 14, 8, "Flagship S21 family device.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-s22-128", "Samsung", "Galaxy S22", 2022, 799, ["128GB", "256GB"], 20, 12, "Popular Samsung upgrade trigger.", ["samsung", "best-buy"]],
  ["galaxy-s22-plus-128", "Samsung", "Galaxy S22+", 2022, 999, ["128GB", "256GB"], 14, 9, "Larger S22 family option.", ["samsung", "best-buy"]],
  ["galaxy-s22-ultra-256", "Samsung", "Galaxy S22 Ultra", 2022, 1199, ["128GB", "256GB", "512GB"], 17, 13, "Premium Galaxy with strong Samsung credit.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-s23-128", "Samsung", "Galaxy S23", 2023, 799, ["128GB", "256GB"], 36, 24, "Main Samsung sell-vs-trade phone.", ["samsung", "best-buy", "amazon"]],
  ["galaxy-s23-plus-256", "Samsung", "Galaxy S23+", 2023, 999, ["256GB", "512GB"], 17, 14, "Larger S23 option with strong store-credit value.", ["samsung", "best-buy"]],
  ["galaxy-s23-ultra-256", "Samsung", "Galaxy S23 Ultra", 2023, 1199, ["256GB", "512GB"], 31, 26, "Flagship Samsung with broad upgrade use.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-s24-128", "Samsung", "Galaxy S24", 2024, 799, ["128GB", "256GB"], 24, 31, "Current Samsung target.", ["samsung", "best-buy"]],
  ["galaxy-s24-ultra-256", "Samsung", "Galaxy S24 Ultra", 2024, 1299, ["256GB", "512GB"], 28, 37, "Premium Samsung upgrade destination.", ["samsung", "best-buy"], flagshipConditions],
  ["oneplus-11-256", "OnePlus", "OnePlus 11", 2023, 799, ["128GB", "256GB"], 8, 7, "Useful Android comparison device.", ["best-buy", "amazon"]],
];

export const devices: Device[] = deviceRows.map(makeDevice);

export const merchants: Merchant[] = [
  { id: "apple", slug: "apple", name: "Apple", type: "manufacturer", logoUrl: "/merchants/apple.svg", siteUrl: "https://www.apple.com", affiliateCapable: false, trustScore: 0.94, notes: "Direct Apple trade-in and Apple Gift Card values." },
  { id: "samsung", slug: "samsung", name: "Samsung", type: "manufacturer", logoUrl: "/merchants/samsung.svg", siteUrl: "https://www.samsung.com", affiliateCapable: false, trustScore: 0.91, notes: "Direct Samsung trade-in and purchase-credit values." },
  { id: "best-buy", slug: "best-buy", name: "Best Buy", type: "retailer", logoUrl: "/merchants/bestbuy.svg", siteUrl: "https://www.bestbuy.com", affiliateCapable: true, trustScore: 0.87, notes: "Gift card and store credit values with broad device coverage." },
  { id: "amazon", slug: "amazon", name: "Amazon Trade-In", type: "retailer", logoUrl: "/merchants/amazon.svg", siteUrl: "https://www.amazon.com", affiliateCapable: true, trustScore: 0.8, notes: "Amazon gift-card trade-in path." },
  { id: "google-store", slug: "google-store", name: "Google Store", type: "manufacturer", logoUrl: "/merchants/google-store.svg", siteUrl: "https://store.google.com", affiliateCapable: false, trustScore: 0.89, notes: "Pixel purchase-credit values." },
  { id: "ebay", slug: "ebay", name: "eBay", type: "marketplace", logoUrl: "/merchants/ebay.svg", siteUrl: "https://www.ebay.com", affiliateCapable: true, trustScore: 0.74, notes: "Resale estimate benchmark." },
];

function rawRecord(id: string, merchantId: string, sourceName: string, sourceUrl: string, retrievedAt: string, merchantParserVersion: string, entries: unknown[], captureMode: RawIngestRecord["captureMode"] = "seeded_import"): RawIngestRecord {
  return {
    id,
    merchantId,
    sourceName,
    fetchUrl: sourceUrl,
    sourceUrl,
    payload: JSON.stringify({ entries }),
    retrievedAt,
    parseStatus: "parsed",
    parseErrors: [],
    merchantParserVersion,
    captureMode,
  };
}

export const rawIngestRecords: RawIngestRecord[] = [
  rawRecord("raw_apple_1", "apple", "Apple Trade In Snapshot", "https://www.apple.com/shop/trade-in", "2026-03-06T08:10:00.000Z", "apple-v2", [
    { deviceSlug: "iphone-13-128", storageVariant: "128GB", condition: "good condition", valueAmount: 430, valueType: "purchase_credit", targetDeviceSlug: "iphone-16-pro-256", notes: "Direct Apple checkout value for a current iPhone purchase." },
    { deviceSlug: "iphone-12-128", storageVariant: "128GB", condition: "good condition", valueAmount: 315, valueType: "gift_card", notes: "Apple Gift Card fallback when no purchase is selected." },
    { deviceSlug: "iphone-14-pro-256", storageVariant: "256GB", condition: "screen damage", valueAmount: 410, valueType: "purchase_credit", targetDeviceSlug: "iphone-16-pro-256", notes: "Damaged-screen device remains eligible but lower confidence after inspection." },
    { deviceSlug: "galaxy-s23-128", storageVariant: "128GB", condition: "good condition", valueAmount: 360, valueType: "gift_card", notes: "Non-Apple trade-in path at Apple remains eligible but lower than iPhone values." },
  ]),
  rawRecord("raw_samsung_1", "samsung", "Samsung Trade-In Snapshot", "https://www.samsung.com/us/trade-in/", "2026-03-06T07:15:00.000Z", "samsung-v2", [
    { deviceSlug: "galaxy-s23-128", storageVariant: "128GB", condition: "good", valueAmount: 520, valueType: "instant_credit", targetDeviceSlug: "galaxy-s24-ultra-256", notes: "Exact Samsung flagship upgrade value.", parserQuality: 0.93 },
    { deviceSlug: "galaxy-s22-ultra-256", storageVariant: "256GB", condition: "damaged", valueAmount: 430, valueType: "instant_credit", targetDeviceSlug: "galaxy-s24-ultra-256", notes: "Samsung accepts cosmetic damage but final inspection still matters." },
    { deviceSlug: "iphone-13-128", storageVariant: "128GB", condition: "good", valueAmount: 470, valueType: "purchase_credit", targetDeviceSlug: "galaxy-s24-ultra-256", notes: "Cross-platform switcher value into Samsung checkout." },
  ]),
  rawRecord("raw_bestbuy_1", "best-buy", "Best Buy Trade-In Grid", "https://www.bestbuy.com/site/mobile-cell-phones/trade-in/pcmcat1563302948687.c", "2026-03-05T11:40:00.000Z", "bestbuy-v2", [
    { deviceSlug: "iphone-13-128", storageVariant: "128GB", condition: "good", valueAmount: 405, valueType: "store_credit", notes: "Best Buy gift card / store credit value for unlocked shopping.", parserQuality: 0.78, staleAfterHours: 20 },
    { deviceSlug: "pixel-7-128", storageVariant: "128GB", condition: "good", valueAmount: 250, valueType: "store_credit", targetDeviceSlug: "pixel-9-pro-256", notes: "Current Best Buy Pixel trade value from manual grid import.", exactMatch: true },
    { deviceSlug: "galaxy-s24-128", storageVariant: "128GB", condition: "damaged", valueAmount: 335, valueType: "store_credit", notes: "Damaged condition mapped from Best Buy fair bucket.", exactStorageMatch: true },
  ]),
  rawRecord("raw_amazon_1", "amazon", "Amazon Trade-In Snapshot", "https://www.amazon.com/b?node=tradein", "2026-03-04T09:20:00.000Z", "amazon-v2", [
    { deviceSlug: "iphone-12-128", storageVariant: "128GB", condition: "good", valueAmount: 255, valueType: "gift_card", notes: "Amazon gift-card trade-in estimate from recent snapshot.", parserQuality: 0.74, staleAfterHours: 16 },
    { deviceSlug: "galaxy-s21-128", storageVariant: "128GB", condition: "good", valueAmount: 185, valueType: "gift_card", notes: "Amazon trade-in gift-card estimate for an older Samsung device.", parserQuality: 0.7, staleAfterHours: 16 },
    { deviceSlug: "pixel-6a-128", storageVariant: "128GB", condition: "not accepted", valueAmount: 0, valueType: "gift_card", notes: "Explicitly not accepted in the latest Amazon snapshot.", parserQuality: 0.72 },
  ]),
  rawRecord("raw_google_1", "google-store", "Google Store Trade-In Snapshot", "https://store.google.com/tradein", "2026-03-06T06:50:00.000Z", "google-v1", [
    { deviceSlug: "pixel-7-128", storageVariant: "128GB", condition: "good", valueAmount: 335, valueType: "purchase_credit", targetDeviceSlug: "pixel-9-pro-256", notes: "Exact Pixel-to-Pixel checkout value." },
    { deviceSlug: "pixel-8-128", storageVariant: "128GB", condition: "screen damage", valueAmount: 275, valueType: "purchase_credit", targetDeviceSlug: "pixel-9-pro-256", notes: "Damaged-screen Pixel value from Google store estimate." },
    { deviceSlug: "iphone-13-128", storageVariant: "128GB", condition: "good", valueAmount: 290, valueType: "purchase_credit", targetDeviceSlug: "pixel-9-pro-256", notes: "Cross-platform Google Store value." },
  ]),
  rawRecord("raw_ebay_1", "ebay", "eBay Sold Listing Snapshot", "https://www.ebay.com/sch/i.html?_nkw=phone+sold", "2026-03-06T08:30:00.000Z", "ebay-v1", [
    { deviceSlug: "iphone-13-128", storageVariant: "128GB", condition: "good", valueAmount: 360, valueType: "resale_estimate", notes: "Recent sold-listing net estimate after typical fees.", parserQuality: 0.76, staleAfterHours: 12 },
    { deviceSlug: "pixel-7-128", storageVariant: "128GB", condition: "good", valueAmount: 240, valueType: "resale_estimate", notes: "Recent sold-listing net estimate after typical fees.", parserQuality: 0.73, staleAfterHours: 12 },
    { deviceSlug: "galaxy-s23-128", storageVariant: "128GB", condition: "good", valueAmount: 338, valueType: "resale_estimate", notes: "Recent sold-listing net estimate after typical fees.", parserQuality: 0.74, staleAfterHours: 12 },
    { deviceSlug: "iphone-14-pro-256", storageVariant: "256GB", condition: "damaged", valueAmount: 430, valueType: "resale_estimate", notes: "Damaged-device private sale estimate after fees.", parserQuality: 0.67, staleAfterHours: 12 },
  ]),
];

export const manualOverrides: ManualOverride[] = [
  {
    id: "override_1",
    valueRecordId: null,
    deviceId: devices.find((device) => device.slug === "iphone-13-128")!.id,
    merchantId: "best-buy",
    storageVariant: "128GB",
    condition: "good",
    valueAmount: 398,
    valueType: "store_credit",
    verificationStatus: "manual",
    confidenceScore: 0.82,
    notes: "Manual override after Best Buy quote tool review on March 6.",
    active: true,
    reviewedAt: "2026-03-06T08:55:00.000Z",
  },
];

const devicesBySlug = new Map(devices.map((device) => [device.slug, device]));
const merchantsById = new Map(merchants.map((merchant) => [merchant.id, merchant]));

const adapterValues = merchantAdapters.flatMap((adapter) =>
  rawIngestRecords
    .filter((record) => record.merchantId === adapter.merchantId)
    .flatMap((record) => adapter.parse(record, { devicesBySlug, merchantsById })),
);

const manualValueRecords: ValueRecord[] = manualOverrides.map((override) => ({
  id: `value_manual_${override.id}`,
  slug: `${override.merchantId}-${devices.find((device) => device.id === override.deviceId)?.slug ?? override.deviceId}-${override.valueType}-manual`,
  deviceId: override.deviceId,
  merchantId: override.merchantId,
  storageVariant: override.storageVariant,
  condition: override.condition,
  valueAmount: override.valueAmount,
  currency: "USD",
  valueType: override.valueType,
  sourceName: "Manual override",
  sourceUrl: "/admin",
  rawSourceId: override.id,
  retrievedAt: override.reviewedAt,
  staleAfterHours: 48,
  verificationStatus: override.verificationStatus,
  confidenceScore: override.confidenceScore,
  notes: override.notes,
  manualOverride: true,
  active: override.active,
  targetDeviceSlug: null,
  conditionNotes: "Manually reviewed by admin.",
  exactStorageMatch: true,
  origin: "manual_review",
  publicVisible: false,
  quoteCapturedAt: override.reviewedAt,
}));

const merged = [...adapterValues.filter((value) => value.valueAmount > 0), ...manualValueRecords];
const deduped = new Map<string, ValueRecord>();
for (const value of merged) {
  const key = `${value.deviceId}:${value.merchantId}:${value.storageVariant}:${value.condition}:${value.valueType}:${value.targetDeviceSlug ?? "none"}`;
  const existing = deduped.get(key);
  if (!existing || value.manualOverride) deduped.set(key, value);
}

export const valueRecords: ValueRecord[] = [...deduped.values()];
export const offers: ValueRecord[] = valueRecords.filter((value) => value.valueType !== "resale_estimate");
export const resaleEstimates: ValueRecord[] = valueRecords.filter((value) => value.valueType === "resale_estimate");

export const quoteArtifacts: QuoteArtifact[] = [];

export const quoteRuns: QuoteRun[] = [
  {
    id: "quote_run_bestbuy_iphone13_good",
    merchantId: "best-buy",
    deviceSlug: "iphone-13-128",
    targetDeviceSlug: null,
    condition: "good",
    status: "failed",
    startedAt: "2026-03-07T11:30:00.000Z",
    finishedAt: "2026-03-07T11:31:00.000Z",
    error: "Live quote capture is not connected yet. Seeded snapshot remains admin-only.",
    artifactId: null,
    valueRecordId: null,
  },
  {
    id: "quote_run_apple_iphone13_good",
    merchantId: "apple",
    deviceSlug: "iphone-13-128",
    targetDeviceSlug: "iphone-16-pro-256",
    condition: "good",
    status: "pending",
    startedAt: "2026-03-07T12:00:00.000Z",
    finishedAt: null,
    error: null,
    artifactId: null,
    valueRecordId: null,
  },
];

export const quoteJobs: QuoteJob[] = [
  {
    id: "job_apple_quote_refresh",
    merchantId: "apple",
    targetDeviceSlug: "iphone-16-pro-256",
    cadence: "Every 6 hours",
    priority: "high",
    status: "paused",
    lastRunAt: null,
    nextRunAt: null,
    note: "Waiting for a real quote-capture worker.",
  },
  {
    id: "job_bestbuy_quote_refresh",
    merchantId: "best-buy",
    targetDeviceSlug: null,
    cadence: "Every 6 hours",
    priority: "high",
    status: "paused",
    lastRunAt: null,
    nextRunAt: null,
    note: "Best Buy trade-in values should not be public until a live capture pipeline exists.",
  },
];

export const acquisitionSources: AcquisitionSource[] = [
  { id: "acq_iphone11_ebay", deviceId: devices.find((device) => device.slug === "iphone-11-128")!.id, merchantId: "ebay", sourceType: "ebay", title: "iPhone 11 128GB sold listings", url: "https://www.ebay.com/sch/i.html?_nkw=iPhone+11+128GB", affiliateUrl: null, estimatedPrice: 210, condition: "good", sellerRatingOrConfidence: 0.78, lastCheckedAt: "2026-03-06T08:20:00.000Z" },
  { id: "acq_pixel6a_ebay", deviceId: devices.find((device) => device.slug === "pixel-6a-128")!.id, merchantId: "ebay", sourceType: "ebay", title: "Pixel 6a sold listings", url: "https://www.ebay.com/sch/i.html?_nkw=Pixel+6a", affiliateUrl: null, estimatedPrice: 145, condition: "good", sellerRatingOrConfidence: 0.77, lastCheckedAt: "2026-03-06T08:22:00.000Z" },
  { id: "acq_galaxys21_ebay", deviceId: devices.find((device) => device.slug === "galaxy-s21-128")!.id, merchantId: "ebay", sourceType: "ebay", title: "Galaxy S21 sold listings", url: "https://www.ebay.com/sch/i.html?_nkw=Galaxy+S21", affiliateUrl: null, estimatedPrice: 188, condition: "good", sellerRatingOrConfidence: 0.76, lastCheckedAt: "2026-03-06T08:24:00.000Z" },
];

export const savedScenarios: SavedScenario[] = [
  { id: "scenario_1", userId: "demo_user", currentDevice: "iphone-13-128", targetDevice: "iphone-16-pro-256", condition: "good", selectedStore: "apple", preferences: { sortBy: "highest-value" }, resultSnapshot: "Apple exact verified value edged out Best Buy once freshness was applied." },
  { id: "scenario_2", userId: "demo_user", currentDevice: "pixel-7-128", targetDevice: "pixel-9-pro-256", condition: "damaged", selectedStore: "google-store", preferences: { mode: "simple-upgrade" }, resultSnapshot: "Google Store remained the cleanest path, but the damaged-condition value was marked estimated." },
];

export const watchedItems: WatchedItem[] = [
  { id: "watch_1", userId: "demo_user", type: "device", referenceSlug: "iphone-13-128", note: "Watch if Apple verified value drops below $420.", lastChangeSummary: "Best Buy manual override lowered confidence gap versus Apple." },
  { id: "watch_2", userId: "demo_user", type: "store", referenceSlug: "amazon", note: "Watch stale Amazon gift-card values.", lastChangeSummary: "Amazon snapshot is nearing its stale threshold." },
];

export const alertSubscriptions: AlertSubscription[] = [
  { id: "alert_1", email: "signals@tradeinfinder.example", type: "device_value", referenceSlug: "iphone-13-128", status: "active" },
  { id: "alert_2", email: "signals@tradeinfinder.example", type: "store_offer", referenceSlug: "best-buy", status: "active" },
];

export const topUpgradeComparisons = [
  { slug: "iphone-13-to-iphone-16-pro", oldDeviceSlug: "iphone-13-128", newDeviceSlug: "iphone-16-pro-256" },
  { slug: "iphone-12-to-galaxy-s24-ultra", oldDeviceSlug: "iphone-12-128", newDeviceSlug: "galaxy-s24-ultra-256" },
  { slug: "pixel-7-to-pixel-9-pro", oldDeviceSlug: "pixel-7-128", newDeviceSlug: "pixel-9-pro-256" },
  { slug: "galaxy-s23-to-iphone-16", oldDeviceSlug: "galaxy-s23-128", newDeviceSlug: "iphone-16-128" },
] as const;
