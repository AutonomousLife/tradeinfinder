import { z } from "zod";

export const conditionSchema = z.enum(["mint", "good", "fair", "cracked"]);
export type Condition = z.infer<typeof conditionSchema>;

export const valueTypeSchema = z.enum([
  "instant_credit",
  "store_credit",
  "gift_card",
  "purchase_credit",
]);
export type ValueType = z.infer<typeof valueTypeSchema>;

export const deviceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  storageVariants: z.array(z.string()),
  msrp: z.number(),
  imageUrl: z.string(),
  releaseDate: z.string(),
  category: z.string(),
  supportedConditions: z.array(conditionSchema),
  deprecated: z.boolean(),
  notes: z.string(),
  searchVolume: z.number().default(0),
  trendScore: z.number().default(0),
  preferredStoreSlugs: z.array(z.string()).default([]),
});
export type Device = z.infer<typeof deviceSchema>;

export const storeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.enum(["manufacturer", "retailer", "marketplace", "trade_in_platform"]),
  logoUrl: z.string(),
  siteUrl: z.string(),
  affiliateCapable: z.boolean(),
  trustScore: z.number(),
  notes: z.string(),
});
export type Store = z.infer<typeof storeSchema>;
export type Merchant = Store;

export const tradeInOfferSchema = z.object({
  id: z.string(),
  slug: z.string(),
  storeId: z.string(),
  targetDeviceOptional: z.string().nullable(),
  purchaseCreditTargetOptional: z.string().nullable(),
  acceptedTradeInDevices: z.array(z.string()),
  acceptedConditions: z.array(conditionSchema),
  valueType: valueTypeSchema,
  tradeInValue: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  sourceUrl: z.string(),
  sourceType: z.enum(["verified", "estimated", "manual"]),
  confidenceScore: z.number(),
  lastVerifiedAt: z.string(),
  notes: z.string(),
  finePrintSummary: z.string(),
});
export type TradeInOffer = z.infer<typeof tradeInOfferSchema>;
export type Offer = TradeInOffer;

export const resaleEstimateSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  sourceType: z.enum(["ebay", "marketplace", "manual"]),
  condition: conditionSchema,
  estimatedSalePrice: z.number(),
  estimatedFees: z.number(),
  netEstimatedValue: z.number(),
  confidenceScore: z.number(),
  lastCheckedAt: z.string(),
  notes: z.string(),
});
export type ResaleEstimate = z.infer<typeof resaleEstimateSchema>;

export const acquisitionSourceSchema = z.object({
  id: z.string(),
  deviceId: z.string(),
  merchantId: z.string(),
  sourceType: z.enum(["ebay", "amazon", "bestbuy", "direct", "marketplace", "manual"]),
  title: z.string(),
  url: z.string(),
  affiliateUrl: z.string().nullable(),
  estimatedPrice: z.number(),
  condition: conditionSchema,
  sellerRatingOrConfidence: z.number(),
  lastCheckedAt: z.string(),
});
export type AcquisitionSource = z.infer<typeof acquisitionSourceSchema>;

export const savedScenarioSchema = z.object({
  id: z.string(),
  userId: z.string(),
  currentDevice: z.string(),
  targetDevice: z.string(),
  condition: conditionSchema,
  selectedStore: z.string().nullable(),
  preferences: z.record(z.string(), z.string()),
  resultSnapshot: z.string(),
});
export type SavedScenario = z.infer<typeof savedScenarioSchema>;

export const watchedItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["device", "store", "offer", "upgrade_path"]),
  referenceSlug: z.string(),
  note: z.string(),
  lastChangeSummary: z.string(),
});
export type WatchedItem = z.infer<typeof watchedItemSchema>;

export const alertSubscriptionSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  type: z.enum(["device_value", "store_offer", "expiring_offer", "newsletter"]),
  referenceSlug: z.string(),
  status: z.enum(["active", "paused"]),
});
export type AlertSubscription = z.infer<typeof alertSubscriptionSchema>;

export const rawIngestSchema = z.object({
  id: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string(),
  payload: z.string(),
  parsedAt: z.string(),
  status: z.enum(["parsed", "failed", "pending"]),
  errors: z.string(),
});
export type RawIngestRecord = z.infer<typeof rawIngestSchema>;

export type RankedPath = {
  slug: string;
  label: string;
  summary: string;
  reasonBadge: string;
  device: Device;
  merchant: Store;
  offer: TradeInOffer;
  acquisition: AcquisitionSource | null;
  netValue: number;
  effectiveUpgradeCost: number;
  instantValue: number;
  confidence: number;
  trustAdjustedScore: number;
  biggestCaveat: string;
  explanation: string;
  tags: string[];
  riskLevel?: "low" | "medium" | "high";
  valueTimelineLabel?: string;
  resaleNetValue?: number;
  resaleDelta?: number;
  effortLabel?: "easy" | "moderate" | "higher effort";
  links: {
    acquisitionLink?: string;
    acquisitionAffiliateLink?: string;
    acquisitionLabel?: string;
    redemptionLink: string;
    redemptionAffiliateLink?: string;
    redemptionLabel: string;
  };
};

export type SellVsTradeOption = {
  slug: string;
  type: "trade_in" | "resale" | "upgrade";
  title: string;
  subtitle: string;
  value: number;
  confidence: number;
  speed: string;
  effort: string;
  risk: string;
  caveat: string;
  label: string;
  href: string;
};

export type UpgradeBoard = {
  kicker: string;
  title: string;
  description: string;
  paths: RankedPath[];
};

export type TradeInFinderModel = {
  inputs: {
    currentDevice: Device;
    targetDevice?: Device;
    merchant?: Store;
    condition: Condition;
  };
  summary: {
    bestTradeInValue: number;
    bestTradeInLabel: string;
    bestResaleValue: number;
    bestResaleLabel: string;
    bestUpgradeValue: number;
    bestUpgradeLabel: string;
    avgConfidence: number;
  };
  whyTopResult: { label: string; copy: string }[];
  paths: RankedPath[];
  sellVsTrade: SellVsTradeOption[];
  chart: { label: string; instant: number; delayed: number }[];
};

export type SellVsTradeModel = {
  device: Device;
  condition: Condition;
  summary: { label: string; value: string; copy: string }[];
  options: SellVsTradeOption[];
  recommendation: {
    title: string;
    copy: string;
  };
  chart: { label: string; tradeIn: number; resale: number }[];
};

export type ArbitrageExplorerModel = {
  summary: { label: string; value: string; copy: string }[];
  paths: RankedPath[];
};

export type DealsHubModel = {
  sections: {
    eyebrow: string;
    title: string;
    description: string;
    paths: RankedPath[];
  }[];
};

export type DashboardModel = {
  summary: { label: string; value: string; copy: string }[];
  savedScenarios: {
    id: string;
    title: string;
    subtitle: string;
    summary: string;
    status: string;
  }[];
  watchedItems: {
    id: string;
    title: string;
    note: string;
    change: string;
  }[];
  notificationHooks: { title: string; copy: string }[];
  alertSubscriptions: { label: string; status: string; scope: string }[];
};

export type MethodologyModel = {
  sections: { title: string; copy: string; points: string[] }[];
};

export type AdminModel = {
  summary: { label: string; value: string; copy: string }[];
  collections: { title: string; copy: string; count: string }[];
  actions: { title: string; copy: string }[];
};

export type DevicePageModel = {
  device: Device;
  chart: { label: string; instant: number; delayed: number }[];
  paths: RankedPath[];
  sellVsTrade: SellVsTradeModel;
  relatedLinks: { label: string; href: string }[];
};

export type MerchantPageModel = {
  merchant: Store;
  tags: string[];
  paths: RankedPath[];
  rules: string[];
  relatedLinks: { label: string; href: string }[];
};

export type OfferPageModel = {
  offer: TradeInOffer & {
    merchant: Store;
    confidenceLabel: string;
  };
  tags: string[];
  creditTimeline: string;
  acceptedDevices: string;
  acquisitionSummary: string;
  primaryPath: RankedPath;
};

export type ComparePageModel = {
  title: string;
  description: string;
  boards: UpgradeBoard[];
};

export type HomepageSnapshot = {
  freshness: string;
  devices: Device[];
  merchants: Store[];
  examplePath: RankedPath;
  heroStats: {
    bestDirectValue: number;
    bestResaleValue: number;
    offerCount: number;
    deviceCoverage: number;
    avgConfidence: number;
  };
  merchantStrip: string[];
  trustItems: { label: string; value: string; copy: string }[];
  methodologySteps: { kicker: string; title: string; copy: string }[];
  instantVsDelayedChart: { label: string; instant: number; delayed: number }[];
  bestDeals: RankedPath[];
  arbitrage: RankedPath[];
  trendingDevices: Device[];
  differentiators: string[];
  sellVsTradeHighlights: SellVsTradeOption[];
  popularTargets: Device[];
  upgradeBoards: UpgradeBoard[];
  expiringOffers: { slug: string; merchant: string; target: string; ends: string; value: number }[];
  linkSystem: { title: string; copy: string }[];
};
