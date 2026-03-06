import { z } from "zod";

export const conditionSchema = z.enum(["mint", "good", "fair", "cracked"]);
export type Condition = z.infer<typeof conditionSchema>;

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
  carrierLockFriendly: z.boolean().default(true),
});
export type Device = z.infer<typeof deviceSchema>;

export const merchantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.enum(["carrier", "retailer", "manufacturer", "marketplace", "reseller"]),
  logoUrl: z.string(),
  siteUrl: z.string(),
  affiliateCapable: z.boolean(),
  defaultLinkType: z.enum(["direct", "affiliate", "referral"]),
  trustScore: z.number(),
  notes: z.string(),
});
export type Merchant = z.infer<typeof merchantSchema>;

export const offerSchema = z.object({
  id: z.string(),
  slug: z.string(),
  merchantId: z.string(),
  carrierName: z.string().nullable(),
  targetDevice: z.string(),
  targetDeviceSlug: z.string(),
  acceptedTradeInDevices: z.array(z.string()),
  acceptedConditions: z.array(conditionSchema),
  tradeInType: z.enum(["cash", "store_credit", "promo_credit", "bill_credit", "instant"]),
  tradeInValue: z.number(),
  monthlyCreditAmount: z.number().nullable(),
  months: z.number().nullable(),
  newLineRequired: z.boolean(),
  installmentRequired: z.boolean(),
  eligiblePlanRequired: z.boolean(),
  onlineOnly: z.boolean(),
  inStoreOnly: z.boolean(),
  unlockedRequired: z.boolean(),
  activationRequired: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
  sourceUrl: z.string(),
  sourceType: z.enum(["verified", "estimated", "manual"]),
  confidenceScore: z.number(),
  lastVerifiedAt: z.string(),
  finePrintSummary: z.string(),
  notes: z.string(),
});
export type Offer = z.infer<typeof offerSchema>;

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
  preferences: z.record(z.string(), z.string()),
  resultSnapshot: z.string(),
});
export type SavedScenario = z.infer<typeof savedScenarioSchema>;

export const watchedItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["device", "merchant", "offer", "path"]),
  referenceSlug: z.string(),
  note: z.string(),
  lastChangeSummary: z.string(),
});
export type WatchedItem = z.infer<typeof watchedItemSchema>;

export const alertSubscriptionSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  type: z.enum(["device_value", "merchant_offer", "expiring_offer", "arbitrage", "newsletter"]),
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
  merchant: Merchant;
  offer: Offer;
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
  links: {
    acquisitionLink?: string;
    acquisitionAffiliateLink?: string;
    acquisitionLabel?: string;
    redemptionLink: string;
    redemptionAffiliateLink?: string;
    redemptionLabel: string;
  };
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
    targetDevice: Device;
    merchant?: Merchant;
    condition: string;
  };
  summary: {
    bestNetValue: number;
    bestNetLabel: string;
    bestInstantValue: number;
    bestInstantLabel: string;
    bestPromoValue: number;
    bestPromoLabel: string;
    avgConfidence: number;
  };
  whyTopResult: { label: string; copy: string }[];
  paths: RankedPath[];
  chart: { label: string; instant: number; delayed: number }[];
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
  relatedLinks: { label: string; href: string }[];
};

export type MerchantPageModel = {
  merchant: Merchant;
  tags: string[];
  paths: RankedPath[];
  rules: string[];
  relatedLinks: { label: string; href: string }[];
};

export type OfferPageModel = {
  offer: Offer & {
    merchant: Merchant;
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

