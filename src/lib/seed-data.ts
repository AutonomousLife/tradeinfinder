import type {
  AcquisitionSource,
  AlertSubscription,
  Condition,
  Device,
  Merchant,
  Offer,
  RawIngestRecord,
  ResaleEstimate,
  SavedScenario,
  WatchedItem,
} from "@/lib/schema";

const allConditions: Condition[] = ["mint", "good", "fair", "cracked"];
const flagshipConditions: Condition[] = ["mint", "good", "fair"];

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
  ["iphone-15-plus-128", "Apple", "iPhone 15 Plus", 2023, 899, ["128GB", "256GB"], 15, 14, "Large-screen standard iPhone.", ["apple", "best-buy"]],
  ["iphone-15-pro-256", "Apple", "iPhone 15 Pro", 2023, 999, ["128GB", "256GB", "512GB"], 44, 36, "Premium iPhone for strong checkout credit.", ["apple", "best-buy"], flagshipConditions],
  ["iphone-15-pro-max-256", "Apple", "iPhone 15 Pro Max", 2023, 1199, ["256GB", "512GB"], 43, 38, "High-end iPhone with deep resale comps.", ["apple", "best-buy"], flagshipConditions],
  ["iphone-16-128", "Apple", "iPhone 16", 2025, 799, ["128GB", "256GB"], 51, 44, "Current Apple upgrade destination.", ["apple", "best-buy"]],
  ["iphone-16-pro-256", "Apple", "iPhone 16 Pro", 2025, 1099, ["128GB", "256GB", "512GB"], 68, 57, "Premium Apple target.", ["apple", "best-buy"], flagshipConditions],
  ["iphone-16-pro-max-256", "Apple", "iPhone 16 Pro Max", 2025, 1299, ["256GB", "512GB", "1TB"], 56, 55, "Most expensive Apple target.", ["apple", "best-buy"], flagshipConditions],
  ["pixel-5-128", "Google", "Pixel 5", 2020, 699, ["128GB"], 11, 4, "Older Pixel with modest direct value.", ["google-store", "best-buy"]],
  ["pixel-5a-128", "Google", "Pixel 5a", 2021, 449, ["128GB"], 8, 4, "Budget Pixel with resale-first appeal.", ["google-store", "amazon"]],
  ["pixel-6-128", "Google", "Pixel 6", 2021, 599, ["128GB", "256GB"], 17, 7, "Often better as resale than trade-in.", ["google-store", "best-buy"]],
  ["pixel-6a-128", "Google", "Pixel 6a", 2022, 449, ["128GB"], 26, 16, "Value Pixel with straightforward store-credit paths.", ["google-store", "best-buy", "amazon"]],
  ["pixel-6-pro-128", "Google", "Pixel 6 Pro", 2021, 899, ["128GB", "256GB"], 10, 6, "Older premium Pixel.", ["google-store", "best-buy"]],
  ["pixel-7-128", "Google", "Pixel 7", 2022, 599, ["128GB", "256GB"], 43, 21, "Popular baseline Pixel.", ["google-store", "best-buy", "amazon"]],
  ["pixel-7a-128", "Google", "Pixel 7a", 2023, 499, ["128GB"], 16, 14, "Budget Pixel with clean upgrade math.", ["google-store", "amazon"]],
  ["pixel-7-pro-256", "Google", "Pixel 7 Pro", 2022, 899, ["128GB", "256GB", "512GB"], 14, 11, "Higher-end Pixel.", ["google-store", "best-buy"], flagshipConditions],
  ["pixel-8-128", "Google", "Pixel 8", 2023, 699, ["128GB", "256GB"], 22, 23, "Current Pixel with good direct-store value.", ["google-store", "best-buy"]],
  ["pixel-8a-128", "Google", "Pixel 8a", 2024, 499, ["128GB"], 13, 17, "Value Pixel with strong upgrade demand.", ["google-store", "amazon"]],
  ["pixel-8-pro-256", "Google", "Pixel 8 Pro", 2023, 999, ["128GB", "256GB", "512GB"], 19, 24, "Pixel flagship for direct purchase credit.", ["google-store", "best-buy"], flagshipConditions],
  ["pixel-fold-256", "Google", "Pixel Fold", 2023, 1799, ["256GB"], 9, 10, "Foldable Pixel with thinner comps.", ["google-store"], flagshipConditions],
  ["pixel-9-pro-256", "Google", "Pixel 9 Pro", 2024, 1099, ["128GB", "256GB", "512GB"], 39, 42, "Current flagship Pixel target.", ["google-store", "best-buy"], flagshipConditions],
  ["galaxy-s20-128", "Samsung", "Galaxy S20", 2020, 999, ["128GB"], 11, 5, "Older Galaxy with low-effort trade-in appeal.", ["samsung", "best-buy"]],
  ["galaxy-s20-plus-128", "Samsung", "Galaxy S20+", 2020, 1199, ["128GB"], 9, 5, "Large-screen legacy Galaxy.", ["samsung", "best-buy"]],
  ["galaxy-s20-ultra-128", "Samsung", "Galaxy S20 Ultra", 2020, 1399, ["128GB", "512GB"], 8, 6, "Legacy flagship Samsung.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-s21-128", "Samsung", "Galaxy S21", 2021, 799, ["128GB", "256GB"], 18, 9, "Common Samsung base model.", ["samsung", "best-buy", "amazon"]],
  ["galaxy-s21-plus-128", "Samsung", "Galaxy S21+", 2021, 999, ["128GB", "256GB"], 12, 7, "Mid-premium Galaxy option.", ["samsung", "best-buy"]],
  ["galaxy-s21-ultra-256", "Samsung", "Galaxy S21 Ultra", 2021, 1199, ["128GB", "256GB", "512GB"], 15, 8, "Premium Samsung with strong direct trade value.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-s22-128", "Samsung", "Galaxy S22", 2022, 799, ["128GB", "256GB"], 20, 12, "Popular Samsung upgrade trigger.", ["samsung", "best-buy"]],
  ["galaxy-s22-plus-128", "Samsung", "Galaxy S22+", 2022, 999, ["128GB", "256GB"], 13, 9, "Larger Samsung trade-in benchmark.", ["samsung", "best-buy"]],
  ["galaxy-s22-ultra-256", "Samsung", "Galaxy S22 Ultra", 2022, 1199, ["128GB", "256GB", "512GB"], 17, 13, "Premium Galaxy with strong Samsung credit.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-s23-128", "Samsung", "Galaxy S23", 2023, 799, ["128GB", "256GB"], 36, 24, "Main Samsung sell-vs-trade phone.", ["samsung", "best-buy", "amazon"]],
  ["galaxy-s23-plus-256", "Samsung", "Galaxy S23+", 2023, 999, ["256GB", "512GB"], 16, 14, "Large-screen Samsung.", ["samsung", "best-buy"]],
  ["galaxy-s23-ultra-256", "Samsung", "Galaxy S23 Ultra", 2023, 1199, ["256GB", "512GB"], 31, 26, "Flagship Samsung with broad upgrade use.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-s24-128", "Samsung", "Galaxy S24", 2024, 799, ["128GB", "256GB"], 24, 31, "Current Samsung target.", ["samsung", "best-buy"]],
  ["galaxy-s24-plus-256", "Samsung", "Galaxy S24+", 2024, 999, ["256GB", "512GB"], 18, 24, "Balanced Samsung target.", ["samsung", "best-buy"]],
  ["galaxy-s24-ultra-256", "Samsung", "Galaxy S24 Ultra", 2024, 1299, ["256GB", "512GB"], 28, 37, "Premium Samsung upgrade destination.", ["samsung", "best-buy"], flagshipConditions],
  ["galaxy-z-flip-5-256", "Samsung", "Galaxy Z Flip 5", 2023, 999, ["256GB", "512GB"], 12, 15, "Foldable Galaxy with moderate direct value.", ["samsung"], flagshipConditions],
  ["galaxy-z-fold-5-256", "Samsung", "Galaxy Z Fold 5", 2023, 1799, ["256GB", "512GB"], 9, 12, "Foldable flagship Samsung.", ["samsung"], flagshipConditions],
  ["galaxy-note-20-ultra-256", "Samsung", "Galaxy Note 20 Ultra", 2020, 1299, ["128GB", "256GB"], 10, 6, "Legacy Note still accepted in trade-in tables.", ["samsung", "best-buy"], flagshipConditions],
  ["oneplus-10-pro-128", "OnePlus", "OnePlus 10 Pro", 2022, 899, ["128GB", "256GB"], 7, 5, "Optional Android coverage.", ["best-buy", "amazon"]],
  ["oneplus-11-256", "OnePlus", "OnePlus 11", 2023, 799, ["128GB", "256GB"], 8, 7, "Useful Android comparison device.", ["best-buy", "amazon"]],
  ["oneplus-12-256", "OnePlus", "OnePlus 12", 2024, 799, ["256GB", "512GB"], 10, 10, "Current OnePlus for broader search coverage.", ["best-buy", "amazon"]],
];

export const devices: Device[] = deviceRows.map(makeDevice);

export const merchants: Merchant[] = [
  { id: "apple", slug: "apple", name: "Apple", type: "manufacturer", logoUrl: "/merchants/apple.svg", siteUrl: "https://www.apple.com", affiliateCapable: false, trustScore: 0.94, notes: "Clear direct trade-in values with low friction." },
  { id: "samsung", slug: "samsung", name: "Samsung", type: "manufacturer", logoUrl: "/merchants/samsung.svg", siteUrl: "https://www.samsung.com", affiliateCapable: false, trustScore: 0.91, notes: "Strong instant credit on Galaxy upgrades and unlocked purchases." },
  { id: "best-buy", slug: "best-buy", name: "Best Buy", type: "retailer", logoUrl: "/merchants/bestbuy.svg", siteUrl: "https://www.bestbuy.com", affiliateCapable: true, trustScore: 0.87, notes: "Useful for store-credit upgrades across brands." },
  { id: "amazon", slug: "amazon", name: "Amazon Trade-In", type: "retailer", logoUrl: "/merchants/amazon.svg", siteUrl: "https://www.amazon.com", affiliateCapable: true, trustScore: 0.8, notes: "Gift-card trade-in path and resale benchmark anchor." },
  { id: "google-store", slug: "google-store", name: "Google Store", type: "manufacturer", logoUrl: "/merchants/google-store.svg", siteUrl: "https://store.google.com", affiliateCapable: false, trustScore: 0.89, notes: "Straightforward Pixel purchase-credit offers." },
  { id: "ebay", slug: "ebay", name: "eBay", type: "marketplace", logoUrl: "/merchants/ebay.svg", siteUrl: "https://www.ebay.com", affiliateCapable: true, trustScore: 0.74, notes: "Primary resale benchmark for sell-it-yourself value." },
];

const appleEligible = devices.filter((device) => ["Apple", "Samsung", "Google"].includes(device.brand)).map((device) => device.slug);
const samsungEligible = devices.filter((device) => ["Samsung", "Apple", "Google"].includes(device.brand)).map((device) => device.slug);
const googleEligible = devices.filter((device) => ["Google", "Apple", "Samsung"].includes(device.brand)).map((device) => device.slug);
const bestBuyEligible = devices.map((device) => device.slug);
const amazonEligible = devices.filter((device) => device.year >= 2020).map((device) => device.slug);

function offer(slug: string, storeId: string, valueType: Offer["valueType"], tradeInValue: number, acceptedTradeInDevices: string[], confidenceScore: number, finePrintSummary: string, notes: string, extra?: Partial<Offer>): Offer {
  return {
    id: `offer_${slug.replace(/-/g, "_")}`,
    slug,
    storeId,
    targetDeviceOptional: null,
    purchaseCreditTargetOptional: null,
    acceptedTradeInDevices,
    acceptedConditions: allConditions,
    valueType,
    tradeInValue,
    startDate: "2026-02-10",
    endDate: "2026-03-31",
    sourceUrl: `${merchants.find((merchant) => merchant.id === storeId)?.siteUrl ?? "https://example.com"}/trade-in`,
    sourceType: "verified",
    confidenceScore,
    lastVerifiedAt: "2026-03-05",
    notes,
    finePrintSummary,
    ...extra,
  };
}

export const offers: Offer[] = [
  offer("apple-direct-trade-in", "apple", "purchase_credit", 470, appleEligible, 0.95, "Apple applies the estimate immediately toward a new device or issues an Apple Gift Card when no purchase is selected.", "Best for simple iPhone upgrades.", { targetDeviceOptional: "iphone-16-pro-256", purchaseCreditTargetOptional: "iphone-16-pro-256" }),
  offer("apple-gift-card-trade-in", "apple", "gift_card", 420, appleEligible, 0.92, "Gift-card path is lower than checkout credit but very easy to understand.", "Useful when the user is not buying immediately."),
  offer("samsung-instant-credit", "samsung", "instant_credit", 620, samsungEligible, 0.9, "Samsung applies direct checkout credit on qualifying unlocked Galaxy purchases with no line lock-in.", "Best direct Samsung path.", { acceptedConditions: flagshipConditions, targetDeviceOptional: "galaxy-s24-ultra-256", purchaseCreditTargetOptional: "galaxy-s24-ultra-256" }),
  offer("samsung-store-credit", "samsung", "store_credit", 540, samsungEligible, 0.86, "Store credit path is simpler but usually lower than the direct launch credit.", "Fallback Samsung path."),
  offer("best-buy-any-phone-credit", "best-buy", "store_credit", 520, bestBuyEligible, 0.88, "Best Buy issues store credit that can be used toward unlocked phones across major brands.", "Broadest simple upgrade destination."),
  offer("best-buy-upgrade-credit", "best-buy", "purchase_credit", 560, bestBuyEligible, 0.84, "Modeled combination of trade-in and retail savings on select unlocked models.", "Slightly higher variance than the standard gift-card trade-in.", { acceptedConditions: flagshipConditions, sourceType: "manual", targetDeviceOptional: "iphone-16-128", purchaseCreditTargetOptional: "iphone-16-128", endDate: "2026-03-18" }),
  offer("google-store-pixel-credit", "google-store", "purchase_credit", 480, googleEligible, 0.9, "Google Store gives simple purchase credit toward unlocked Pixel phones.", "Best clean Pixel upgrade path.", { targetDeviceOptional: "pixel-9-pro-256", purchaseCreditTargetOptional: "pixel-9-pro-256" }),
  offer("amazon-trade-in-gift-card", "amazon", "gift_card", 405, amazonEligible, 0.74, "Amazon Trade-In usually returns an Amazon gift card, which is flexible but not cash.", "Works best for shoppers comfortable with store-balance value.", { sourceType: "manual", endDate: "2026-03-20" }),
];

function resaleMultiplier(year: number) {
  const age = Math.max(2026 - year, 1);
  return Math.max(0.2, 0.76 - age * 0.09);
}

function conditionFactor(condition: Condition) {
  if (condition === "mint") return 1;
  if (condition === "good") return 0.92;
  if (condition === "fair") return 0.78;
  return 0.56;
}

function feesFactor(device: Device) {
  return device.brand === "Apple" ? 0.11 : 0.13;
}

function resale(device: Device, sourceType: ResaleEstimate["sourceType"], condition: Condition): ResaleEstimate {
  const estimatedSalePrice = Math.round(device.msrp * resaleMultiplier(device.year) * conditionFactor(condition));
  const estimatedFees = sourceType === "manual" ? 0 : Math.round(estimatedSalePrice * feesFactor(device));
  return {
    id: `resale_${device.slug}_${sourceType}_${condition}`,
    deviceId: device.id,
    sourceType,
    condition,
    estimatedSalePrice,
    estimatedFees,
    netEstimatedValue: estimatedSalePrice - estimatedFees,
    confidenceScore: sourceType === "ebay" ? 0.84 : sourceType === "marketplace" ? 0.72 : 0.66,
    lastCheckedAt: "2026-03-05",
    notes: sourceType === "ebay" ? "Based on recent sold listings and typical selling fees." : sourceType === "marketplace" ? "Modeled private-party estimate with more negotiation variance." : "Manual benchmark used when direct comps are thin.",
  };
}

export const resaleEstimates: ResaleEstimate[] = devices.flatMap((device) => [
  resale(device, "ebay", "mint"),
  resale(device, "ebay", "good"),
  resale(device, "ebay", "fair"),
  resale(device, "marketplace", "good"),
  resale(device, "manual", "cracked"),
]);

function sourceFor(deviceSlug: string, merchantId: string, sourceType: AcquisitionSource["sourceType"], estimatedPrice: number, condition: Condition, title: string): AcquisitionSource {
  const device = devices.find((entry) => entry.slug === deviceSlug)!;
  return {
    id: `acq_${deviceSlug}_${merchantId}_${condition}`,
    deviceId: device.id,
    merchantId,
    sourceType,
    title,
    url: `https://example.com/${merchantId}/${deviceSlug}`,
    affiliateUrl: merchantId === "ebay" || merchantId === "amazon" || merchantId === "best-buy" ? `https://example.com/${merchantId}/${deviceSlug}?ref=tradeinfinder` : null,
    estimatedPrice,
    condition,
    sellerRatingOrConfidence: sourceType === "manual" ? 0.68 : 0.79,
    lastCheckedAt: "2026-03-05",
  };
}

export const acquisitionSources: AcquisitionSource[] = [
  sourceFor("iphone-11-128", "ebay", "ebay", 208, "good", "iPhone 11 128GB sold-listing benchmark"),
  sourceFor("iphone-12-128", "ebay", "ebay", 274, "good", "iPhone 12 128GB sold-listing benchmark"),
  sourceFor("iphone-13-128", "ebay", "ebay", 349, "good", "iPhone 13 128GB sold-listing benchmark"),
  sourceFor("pixel-6a-128", "ebay", "ebay", 141, "good", "Pixel 6a sold-listing benchmark"),
  sourceFor("pixel-7-128", "ebay", "ebay", 221, "good", "Pixel 7 sold-listing benchmark"),
  sourceFor("galaxy-s21-128", "ebay", "ebay", 184, "good", "Galaxy S21 sold-listing benchmark"),
  sourceFor("galaxy-s22-128", "ebay", "ebay", 242, "good", "Galaxy S22 sold-listing benchmark"),
  sourceFor("galaxy-s23-128", "amazon", "amazon", 336, "good", "Galaxy S23 renewed benchmark"),
  sourceFor("pixel-8-128", "amazon", "amazon", 304, "good", "Pixel 8 renewed benchmark"),
  sourceFor("oneplus-11-256", "amazon", "marketplace", 292, "good", "OnePlus 11 marketplace benchmark"),
];

export const savedScenarios: SavedScenario[] = [
  { id: "scenario_1", userId: "demo_user", currentDevice: "iphone-13-128", targetDevice: "iphone-16-pro-256", condition: "good", selectedStore: "apple", preferences: { sortBy: "highest-value" }, resultSnapshot: "Apple purchase credit beat resale by a narrow margin, but Best Buy kept more flexibility." },
  { id: "scenario_2", userId: "demo_user", currentDevice: "pixel-7-128", targetDevice: "pixel-9-pro-256", condition: "good", selectedStore: "google-store", preferences: { mode: "simple-upgrade" }, resultSnapshot: "Google Store produced the cleanest Pixel upgrade with strong confidence and low friction." },
  { id: "scenario_3", userId: "demo_user", currentDevice: "galaxy-s23-128", targetDevice: "iphone-16-128", condition: "fair", selectedStore: "best-buy", preferences: { mode: "cross-brand" }, resultSnapshot: "Best Buy store credit ranked above Samsung once the target phone changed to iPhone." },
];

export const watchedItems: WatchedItem[] = [
  { id: "watch_1", userId: "demo_user", type: "device", referenceSlug: "iphone-13-128", note: "Watch for Apple value moving back above $450.", lastChangeSummary: "Best Buy store-credit estimate improved by $15 this week." },
  { id: "watch_2", userId: "demo_user", type: "store", referenceSlug: "best-buy", note: "Watch unlocked iPhone launch credits.", lastChangeSummary: "Modeled launch-credit path expires on March 18, 2026." },
  { id: "watch_3", userId: "demo_user", type: "offer", referenceSlug: "amazon-trade-in-gift-card", note: "Watch Amazon gift-card values on older iPhones.", lastChangeSummary: "Amazon estimate drifted lower on iPhone 12 comps." },
];

export const alertSubscriptions: AlertSubscription[] = [
  { id: "alert_1", email: "signals@tradeinfinder.example", type: "device_value", referenceSlug: "iphone-13-128", status: "active" },
  { id: "alert_2", email: "signals@tradeinfinder.example", type: "store_offer", referenceSlug: "best-buy", status: "active" },
  { id: "alert_3", email: "signals@tradeinfinder.example", type: "expiring_offer", referenceSlug: "best-buy-upgrade-credit", status: "paused" },
];

export const rawIngestRecords: RawIngestRecord[] = [
  { id: "raw_1", sourceName: "Apple Trade In", sourceUrl: "https://www.apple.com/shop/trade-in", payload: '{"iphone13":470}', parsedAt: "2026-03-05T10:30:00.000Z", status: "parsed", errors: "" },
  { id: "raw_2", sourceName: "Best Buy trade-in grid", sourceUrl: "https://www.bestbuy.com/site/mobile-cell-phones/trade-in/pcmcat1563302948687.c", payload: '{"grid":"manual import"}', parsedAt: "2026-03-02T14:12:00.000Z", status: "pending", errors: "" },
  { id: "raw_3", sourceName: "Google Store trade-in export", sourceUrl: "https://store.google.com/tradein", payload: '{"pixel9":480}', parsedAt: "2026-03-05T06:45:00.000Z", status: "parsed", errors: "" },
];

export const topUpgradeComparisons = [
  { slug: "iphone-13-to-iphone-16-pro", oldDeviceSlug: "iphone-13-128", newDeviceSlug: "iphone-16-pro-256" },
  { slug: "iphone-12-to-galaxy-s24-ultra", oldDeviceSlug: "iphone-12-128", newDeviceSlug: "galaxy-s24-ultra-256" },
  { slug: "pixel-7-to-pixel-9-pro", oldDeviceSlug: "pixel-7-128", newDeviceSlug: "pixel-9-pro-256" },
  { slug: "galaxy-s23-to-iphone-16", oldDeviceSlug: "galaxy-s23-128", newDeviceSlug: "iphone-16-128" },
  { slug: "galaxy-s22-to-galaxy-s24-ultra", oldDeviceSlug: "galaxy-s22-128", newDeviceSlug: "galaxy-s24-ultra-256" },
] as const;
