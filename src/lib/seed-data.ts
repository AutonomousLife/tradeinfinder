import type {
  AcquisitionSource,
  AlertSubscription,
  Device,
  Merchant,
  Offer,
  RawIngestRecord,
  SavedScenario,
  WatchedItem,
} from "@/lib/schema";

const allConditions = ["mint", "good", "fair", "cracked"] as const;
const flagshipConditions = ["mint", "good", "fair"] as const;

function device(
  slug: string,
  brand: string,
  model: string,
  year: number,
  msrp: number,
  storageVariants: string[],
  searchVolume: number,
  trendScore: number,
  notes: string,
  supportedConditions: readonly ("mint" | "good" | "fair" | "cracked")[] = allConditions,
): Device {
  return {
    id: `dev_${slug.replace(/-/g, "_")}`,
    slug,
    brand,
    model,
    year,
    storageVariants,
    msrp,
    imageUrl: `/devices/${slug}.svg`,
    releaseDate: `${year}-09-15`,
    category: "smartphone",
    supportedConditions: [...supportedConditions],
    deprecated: false,
    notes,
    searchVolume,
    trendScore,
    carrierLockFriendly: true,
  };
}

const iphoneDevices: Device[] = [
  device("iphone-11-128", "Apple", "iPhone 11", 2019, 699, ["64GB", "128GB"], 74, 42, "Older iPhone still accepted in many promos."),
  device("iphone-11-pro-256", "Apple", "iPhone 11 Pro", 2019, 999, ["64GB", "256GB", "512GB"], 39, 28, "Legacy Pro model that still clears mid-tier trade-in values."),
  device("iphone-11-pro-max-256", "Apple", "iPhone 11 Pro Max", 2019, 1099, ["64GB", "256GB", "512GB"], 31, 24, "Large-screen legacy iPhone with strong remaining value."),
  device("iphone-se-2022-128", "Apple", "iPhone SE (2022)", 2022, 479, ["64GB", "128GB"], 22, 18, "Budget iPhone that occasionally qualifies for aggressive carrier promos."),
  device("iphone-12-128", "Apple", "iPhone 12", 2020, 799, ["64GB", "128GB", "256GB"], 61, 38, "Reliable mid-tier upgrade trigger for carrier deals."),
  device("iphone-12-mini-128", "Apple", "iPhone 12 mini", 2020, 729, ["64GB", "128GB", "256GB"], 18, 14, "Smaller iPhone with lower direct resale but still promo-eligible."),
  device("iphone-12-pro-256", "Apple", "iPhone 12 Pro", 2020, 999, ["128GB", "256GB", "512GB"], 36, 25, "Legacy Pro iPhone often close to top trade tiers."),
  device("iphone-12-pro-max-256", "Apple", "iPhone 12 Pro Max", 2020, 1099, ["128GB", "256GB", "512GB"], 32, 22, "Large Pro Max with strong trade appeal."),
  device("iphone-13-128", "Apple", "iPhone 13", 2021, 799, ["128GB", "256GB"], 87, 51, "Strong mid-cycle trade-in anchor with wide carrier acceptance."),
  device("iphone-13-mini-128", "Apple", "iPhone 13 mini", 2021, 699, ["128GB", "256GB"], 19, 17, "Niche but still accepted in direct trade-in programs."),
  device("iphone-13-pro-256", "Apple", "iPhone 13 Pro", 2021, 999, ["128GB", "256GB", "512GB"], 33, 29, "High-value Apple device for premium offer tiers."),
  device("iphone-13-pro-max-256", "Apple", "iPhone 13 Pro Max", 2021, 1099, ["128GB", "256GB", "512GB"], 28, 23, "Large Pro Max that frequently reaches top promo values."),
  device("iphone-14-128", "Apple", "iPhone 14", 2022, 799, ["128GB", "256GB"], 52, 33, "Still common in direct upgrade math."),
  device("iphone-14-plus-128", "Apple", "iPhone 14 Plus", 2022, 899, ["128GB", "256GB"], 16, 12, "Large-screen non-Pro iPhone with fair remaining value."),
  device("iphone-14-pro-256", "Apple", "iPhone 14 Pro", 2022, 1099, ["128GB", "256GB", "512GB"], 49, 39, "Higher-value Apple trade-in with premium promo eligibility.", flagshipConditions),
  device("iphone-14-pro-max-256", "Apple", "iPhone 14 Pro Max", 2022, 1199, ["128GB", "256GB", "512GB"], 41, 34, "Premium iPhone often topping direct trade-in values.", flagshipConditions),
  device("iphone-15-128", "Apple", "iPhone 15", 2023, 799, ["128GB", "256GB"], 44, 37, "Current-gen standard iPhone with high search intent."),
  device("iphone-15-plus-128", "Apple", "iPhone 15 Plus", 2023, 899, ["128GB", "256GB"], 14, 16, "Larger standard iPhone for lower-risk upgrades."),
  device("iphone-15-pro-256", "Apple", "iPhone 15 Pro", 2023, 999, ["128GB", "256GB", "512GB"], 46, 41, "Strong premium device for upgrade math.", flagshipConditions),
  device("iphone-15-pro-max-256", "Apple", "iPhone 15 Pro Max", 2023, 1199, ["256GB", "512GB"], 45, 44, "High confidence premium device for flagship promos.", flagshipConditions),
  device("iphone-16-pro-256", "Apple", "iPhone 16 Pro", 2025, 1099, ["128GB", "256GB", "512GB"], 65, 56, "Premium target device used across Apple upgrade comparisons.", flagshipConditions),
  device("iphone-16-pro-max-256", "Apple", "iPhone 16 Pro Max", 2025, 1299, ["256GB", "512GB", "1TB"], 53, 51, "Top-end target device for best-value upgrade paths.", flagshipConditions),
];

const pixelDevices: Device[] = [
  device("pixel-5-128", "Google", "Pixel 5", 2020, 699, ["128GB"], 12, 10, "Older Pixel that still appears in promo grids."),
  device("pixel-5a-128", "Google", "Pixel 5a", 2021, 449, ["128GB"], 8, 8, "Budget Pixel still occasionally accepted."),
  device("pixel-6-128", "Google", "Pixel 6", 2021, 599, ["128GB", "256GB"], 21, 15, "Common mid-tier Pixel trade-in device."),
  device("pixel-6-pro-128", "Google", "Pixel 6 Pro", 2021, 899, ["128GB", "256GB"], 10, 11, "Older premium Pixel with decent direct value."),
  device("pixel-6a-128", "Google", "Pixel 6a", 2022, 449, ["128GB"], 34, 31, "Classic arbitrage candidate due to low used-market acquisition cost."),
  device("pixel-7-128", "Google", "Pixel 7", 2022, 599, ["128GB", "256GB"], 58, 34, "Often undervalued directly but useful in certain promos."),
  device("pixel-7a-128", "Google", "Pixel 7a", 2023, 499, ["128GB"], 19, 17, "Budget-friendly Pixel that still works for store-credit paths."),
  device("pixel-7-pro-256", "Google", "Pixel 7 Pro", 2022, 899, ["128GB", "256GB", "512GB"], 15, 16, "Premium Pixel for better direct value tiers."),
  device("pixel-8-128", "Google", "Pixel 8", 2023, 699, ["128GB", "256GB"], 24, 28, "Current Pixel trade-in starting point for many users."),
  device("pixel-8a-128", "Google", "Pixel 8a", 2024, 499, ["128GB"], 14, 20, "Value Pixel with good search momentum."),
  device("pixel-8-pro-256", "Google", "Pixel 8 Pro", 2023, 999, ["128GB", "256GB", "512GB"], 18, 23, "High-end Pixel for flagship upgrade planning.", flagshipConditions),
  device("pixel-fold-256", "Google", "Pixel Fold", 2023, 1799, ["256GB"], 9, 14, "Foldable Pixel with niche but premium trade-in value.", flagshipConditions),
  device("pixel-9-pro-256", "Google", "Pixel 9 Pro", 2024, 1099, ["128GB", "256GB", "512GB"], 39, 47, "Pixel flagship target for Google Store and carrier deals.", flagshipConditions),
];

const samsungDevices: Device[] = [
  device("galaxy-s20-128", "Samsung", "Galaxy S20", 2020, 999, ["128GB"], 11, 9, "Still seen in older trade-in offer tables."),
  device("galaxy-s21-128", "Samsung", "Galaxy S21", 2021, 799, ["128GB", "256GB"], 17, 14, "Popular Samsung model for value-conscious upgrades."),
  device("galaxy-s21-ultra-256", "Samsung", "Galaxy S21 Ultra", 2021, 1199, ["128GB", "256GB", "512GB"], 14, 12, "Premium Samsung device with strong remaining promo value."),
  device("galaxy-s22-128", "Samsung", "Galaxy S22", 2022, 799, ["128GB", "256GB"], 19, 16, "Common carrier trade-in anchor."),
  device("galaxy-s22-ultra-256", "Samsung", "Galaxy S22 Ultra", 2022, 1199, ["128GB", "256GB", "512GB"], 16, 18, "Samsung flagship often close to top bill-credit tiers.", flagshipConditions),
  device("galaxy-s23-128", "Samsung", "Galaxy S23", 2023, 799, ["128GB", "256GB"], 57, 38, "Consistently promoted by carriers for flagship upgrades."),
  device("galaxy-s23-ultra-256", "Samsung", "Galaxy S23 Ultra", 2023, 1199, ["256GB", "512GB"], 29, 33, "High-end Samsung with strong direct and promo value.", flagshipConditions),
  device("galaxy-s24-128", "Samsung", "Galaxy S24", 2024, 799, ["128GB", "256GB"], 24, 31, "Newer Samsung base model with strong search demand."),
  device("galaxy-s24-ultra-256", "Samsung", "Galaxy S24 Ultra", 2024, 1299, ["256GB", "512GB"], 27, 39, "Current Samsung flagship in many trade-in offers.", flagshipConditions),
  device("galaxy-s25-ultra-256", "Samsung", "Galaxy S25 Ultra", 2025, 1299, ["256GB", "512GB"], 33, 52, "Primary Samsung flagship target in seeded data.", flagshipConditions),
  device("galaxy-note-20-ultra-256", "Samsung", "Galaxy Note 20 Ultra", 2020, 1299, ["128GB", "256GB"], 9, 8, "Older Note still relevant in promo acceptance lists."),
  device("galaxy-z-flip-5-256", "Samsung", "Galaxy Z Flip 5", 2023, 999, ["256GB", "512GB"], 13, 19, "Foldable Samsung with moderate resale and promo acceptance."),
  device("galaxy-z-fold-5-256", "Samsung", "Galaxy Z Fold 5", 2023, 1799, ["256GB", "512GB"], 8, 16, "Premium foldable that anchors high-value Samsung programs.", flagshipConditions),
];

const onePlusDevices: Device[] = [
  device("oneplus-10-pro-128", "OnePlus", "OnePlus 10 Pro", 2022, 899, ["128GB", "256GB"], 7, 7, "Niche Android flagship still relevant in some trade-in programs."),
  device("oneplus-11-256", "OnePlus", "OnePlus 11", 2023, 799, ["128GB", "256GB"], 8, 10, "Popular OnePlus flagship for Android trade-in paths."),
  device("oneplus-12-256", "OnePlus", "OnePlus 12", 2024, 799, ["256GB", "512GB"], 9, 13, "Current OnePlus flagship with improving merchant support."),
];

export const devices: Device[] = [
  ...iphoneDevices,
  ...pixelDevices,
  ...samsungDevices,
  ...onePlusDevices,
];

export const merchants: Merchant[] = [
  { id: "att", slug: "att", name: "AT&T", type: "carrier", logoUrl: "/merchants/att.svg", siteUrl: "https://www.att.com", affiliateCapable: false, defaultLinkType: "direct", trustScore: 0.72, notes: "Often strong headline values with installment and plan requirements." },
  { id: "verizon", slug: "verizon", name: "Verizon", type: "carrier", logoUrl: "/merchants/verizon.svg", siteUrl: "https://www.verizon.com", affiliateCapable: false, defaultLinkType: "direct", trustScore: 0.74, notes: "Broad flagship support, but frequent new-line gating." },
  { id: "tmobile", slug: "tmobile", name: "T-Mobile", type: "carrier", logoUrl: "/merchants/tmobile.svg", siteUrl: "https://www.t-mobile.com", affiliateCapable: false, defaultLinkType: "direct", trustScore: 0.76, notes: "Aggressive promo values with bill-credit structures." },
  { id: "apple", slug: "apple", name: "Apple", type: "manufacturer", logoUrl: "/merchants/apple.svg", siteUrl: "https://www.apple.com", affiliateCapable: false, defaultLinkType: "direct", trustScore: 0.92, notes: "Reliable direct trade-in values with straightforward checkout." },
  { id: "samsung", slug: "samsung", name: "Samsung", type: "manufacturer", logoUrl: "/merchants/samsung.svg", siteUrl: "https://www.samsung.com", affiliateCapable: false, defaultLinkType: "direct", trustScore: 0.9, notes: "Good mix of instant credits and launch promos for Galaxy upgrades." },
  { id: "best-buy", slug: "best-buy", name: "Best Buy", type: "retailer", logoUrl: "/merchants/bestbuy.svg", siteUrl: "https://www.bestbuy.com", affiliateCapable: true, defaultLinkType: "affiliate", trustScore: 0.86, notes: "Useful middle ground between carrier promos and direct trade-ins." },
  { id: "google-store", slug: "google-store", name: "Google Store", type: "manufacturer", logoUrl: "/merchants/google-store.svg", siteUrl: "https://store.google.com", affiliateCapable: false, defaultLinkType: "direct", trustScore: 0.89, notes: "Transparent Pixel upgrades, often with store credit." },
  { id: "amazon", slug: "amazon", name: "Amazon", type: "retailer", logoUrl: "/merchants/amazon.svg", siteUrl: "https://www.amazon.com", affiliateCapable: true, defaultLinkType: "affiliate", trustScore: 0.8, notes: "Useful acquisition source and occasional direct discount path." },
  { id: "walmart", slug: "walmart", name: "Walmart", type: "retailer", logoUrl: "/merchants/walmart.svg", siteUrl: "https://www.walmart.com", affiliateCapable: true, defaultLinkType: "affiliate", trustScore: 0.73, notes: "Useful for lower-cost unlocked acquisition inventory." },
  { id: "ebay", slug: "ebay", name: "eBay", type: "marketplace", logoUrl: "/merchants/ebay.svg", siteUrl: "https://www.ebay.com", affiliateCapable: true, defaultLinkType: "affiliate", trustScore: 0.68, notes: "Acquisition marketplace used for realistic buy-first arbitrage estimates." },
];

const appleTradeIns = [
  "iphone-11-128", "iphone-12-128", "iphone-12-pro-256", "iphone-13-128", "iphone-13-pro-256", "iphone-14-pro-256", "iphone-15-pro-256", "galaxy-s23-128", "pixel-7-128",
];
const samsungTradeIns = [
  "galaxy-s21-128", "galaxy-s22-128", "galaxy-s23-128", "galaxy-s23-ultra-256", "galaxy-s24-ultra-256", "iphone-13-128", "iphone-14-pro-256", "pixel-7-128", "pixel-8-pro-256",
];
const pixelTradeIns = [
  "pixel-6a-128", "pixel-7-128", "pixel-8-128", "pixel-8-pro-256", "iphone-13-128", "galaxy-s23-128", "iphone-14-pro-256",
];
const broadTradeIns = [
  ...new Set([...appleTradeIns, ...samsungTradeIns, ...pixelTradeIns, "iphone-11-pro-256", "galaxy-note-20-ultra-256"]),
];

export const offers: Offer[] = [
  { id: "offer_att_iphone16pro_1000", slug: "att-iphone-16-pro-up-to-1000", merchantId: "att", carrierName: "AT&T", targetDevice: "iPhone 16 Pro", targetDeviceSlug: "iphone-16-pro-256", acceptedTradeInDevices: broadTradeIns, acceptedConditions: ["good", "fair", "mint"], tradeInType: "bill_credit", tradeInValue: 1000, monthlyCreditAmount: 27.78, months: 36, newLineRequired: false, installmentRequired: true, eligiblePlanRequired: true, onlineOnly: false, inStoreOnly: false, unlockedRequired: false, activationRequired: true, startDate: "2026-02-15", endDate: "2026-03-31", sourceUrl: "https://www.att.com/deals/iphone", sourceType: "verified", confidenceScore: 0.82, lastVerifiedAt: "2026-03-05", finePrintSummary: "Requires qualifying unlimited plan, 36-month installment, and eligible trade-in in good condition.", notes: "High headline value but delayed realization." },
  { id: "offer_verizon_iphone16promax_1000", slug: "verizon-iphone-16-pro-max-1000", merchantId: "verizon", carrierName: "Verizon", targetDevice: "iPhone 16 Pro Max", targetDeviceSlug: "iphone-16-pro-max-256", acceptedTradeInDevices: appleTradeIns, acceptedConditions: ["good", "fair", "mint"], tradeInType: "bill_credit", tradeInValue: 1000, monthlyCreditAmount: 27.78, months: 36, newLineRequired: true, installmentRequired: true, eligiblePlanRequired: true, onlineOnly: true, inStoreOnly: false, unlockedRequired: false, activationRequired: true, startDate: "2026-02-20", endDate: "2026-03-22", sourceUrl: "https://www.verizon.com/deals/iphone", sourceType: "verified", confidenceScore: 0.79, lastVerifiedAt: "2026-03-04", finePrintSummary: "Top value requires a new line on premium unlimited with device payment agreement.", notes: "Good value but heavy new-line friction." },
  { id: "offer_tmo_galaxy_s25_1000", slug: "tmobile-galaxy-s25-ultra-1000", merchantId: "tmobile", carrierName: "T-Mobile", targetDevice: "Galaxy S25 Ultra", targetDeviceSlug: "galaxy-s25-ultra-256", acceptedTradeInDevices: samsungTradeIns, acceptedConditions: ["good", "fair", "mint"], tradeInType: "bill_credit", tradeInValue: 1000, monthlyCreditAmount: 27.78, months: 36, newLineRequired: false, installmentRequired: true, eligiblePlanRequired: true, onlineOnly: false, inStoreOnly: false, unlockedRequired: false, activationRequired: true, startDate: "2026-02-10", endDate: "2026-03-28", sourceUrl: "https://www.t-mobile.com/offers/samsung-phone-deals", sourceType: "verified", confidenceScore: 0.84, lastVerifiedAt: "2026-03-05", finePrintSummary: "Requires Go5G Plus or Next and 36 monthly bill credits after trade-in validation.", notes: "Strong for Samsung loyalists, delayed value over time." },
  { id: "offer_apple_iphone16pro_470", slug: "apple-iphone-16-pro-470", merchantId: "apple", carrierName: null, targetDevice: "iPhone 16 Pro", targetDeviceSlug: "iphone-16-pro-256", acceptedTradeInDevices: appleTradeIns, acceptedConditions: ["good", "fair", "mint", "cracked"], tradeInType: "instant", tradeInValue: 470, monthlyCreditAmount: null, months: null, newLineRequired: false, installmentRequired: false, eligiblePlanRequired: false, onlineOnly: false, inStoreOnly: false, unlockedRequired: false, activationRequired: false, startDate: "2026-01-10", endDate: "2026-04-15", sourceUrl: "https://www.apple.com/shop/trade-in", sourceType: "verified", confidenceScore: 0.94, lastVerifiedAt: "2026-03-05", finePrintSummary: "Straightforward Apple trade-in estimate applied instantly at checkout or as gift card.", notes: "Lower value but highest clarity and low lock-in risk." },
  { id: "offer_bestbuy_iphone16pro_540", slug: "best-buy-iphone-16-pro-540", merchantId: "best-buy", carrierName: null, targetDevice: "iPhone 16 Pro", targetDeviceSlug: "iphone-16-pro-256", acceptedTradeInDevices: broadTradeIns, acceptedConditions: ["mint", "good", "fair"], tradeInType: "store_credit", tradeInValue: 540, monthlyCreditAmount: null, months: null, newLineRequired: false, installmentRequired: false, eligiblePlanRequired: false, onlineOnly: true, inStoreOnly: false, unlockedRequired: false, activationRequired: false, startDate: "2026-02-01", endDate: "2026-03-18", sourceUrl: "https://www.bestbuy.com/site/mobile-cell-phones/trade-in/pcmcat1563302948687.c", sourceType: "verified", confidenceScore: 0.87, lastVerifiedAt: "2026-03-03", finePrintSummary: "Store credit applied instantly online, no line lock-in, limited to in-stock inventory.", notes: "Solid middle-ground offer for unlocked buyers." },
  { id: "offer_google_pixel9pro_470", slug: "google-store-pixel-9-pro-470", merchantId: "google-store", carrierName: null, targetDevice: "Pixel 9 Pro", targetDeviceSlug: "pixel-9-pro-256", acceptedTradeInDevices: pixelTradeIns, acceptedConditions: ["mint", "good", "fair"], tradeInType: "store_credit", tradeInValue: 470, monthlyCreditAmount: null, months: null, newLineRequired: false, installmentRequired: false, eligiblePlanRequired: false, onlineOnly: true, inStoreOnly: false, unlockedRequired: true, activationRequired: false, startDate: "2026-02-18", endDate: "2026-03-25", sourceUrl: "https://store.google.com/tradein", sourceType: "verified", confidenceScore: 0.9, lastVerifiedAt: "2026-03-05", finePrintSummary: "Google Store credit estimate for unlocked Pixel checkout with mail-in trade-in.", notes: "Very clean unlocked path for Pixel buyers." },
  { id: "offer_samsung_s25ultra_700", slug: "samsung-galaxy-s25-ultra-700", merchantId: "samsung", carrierName: null, targetDevice: "Galaxy S25 Ultra", targetDeviceSlug: "galaxy-s25-ultra-256", acceptedTradeInDevices: samsungTradeIns, acceptedConditions: ["good", "fair", "mint"], tradeInType: "instant", tradeInValue: 700, monthlyCreditAmount: null, months: null, newLineRequired: false, installmentRequired: false, eligiblePlanRequired: false, onlineOnly: true, inStoreOnly: false, unlockedRequired: false, activationRequired: false, startDate: "2026-02-12", endDate: "2026-03-26", sourceUrl: "https://www.samsung.com/us/trade-in/", sourceType: "verified", confidenceScore: 0.88, lastVerifiedAt: "2026-03-05", finePrintSummary: "Instant Samsung credit at checkout with selected unlocked Galaxy purchases.", notes: "Strong unlocked Samsung path with lower friction." },
  { id: "offer_bestbuy_s25_620", slug: "best-buy-galaxy-s25-ultra-620", merchantId: "best-buy", carrierName: null, targetDevice: "Galaxy S25 Ultra", targetDeviceSlug: "galaxy-s25-ultra-256", acceptedTradeInDevices: samsungTradeIns, acceptedConditions: ["good", "fair", "mint"], tradeInType: "store_credit", tradeInValue: 620, monthlyCreditAmount: null, months: null, newLineRequired: false, installmentRequired: false, eligiblePlanRequired: false, onlineOnly: true, inStoreOnly: false, unlockedRequired: false, activationRequired: false, startDate: "2026-02-14", endDate: "2026-03-19", sourceUrl: "https://www.bestbuy.com/site/samsung-cell-phones", sourceType: "manual", confidenceScore: 0.78, lastVerifiedAt: "2026-03-02", finePrintSummary: "Manual offer entry combining trade-in credit and retailer savings for unlocked checkout.", notes: "Good value, slightly lower confidence due to manual verification." },
  { id: "offer_att_pixel9pro_820", slug: "att-pixel-9-pro-820", merchantId: "att", carrierName: "AT&T", targetDevice: "Pixel 9 Pro", targetDeviceSlug: "pixel-9-pro-256", acceptedTradeInDevices: pixelTradeIns, acceptedConditions: ["good", "fair", "mint"], tradeInType: "bill_credit", tradeInValue: 820, monthlyCreditAmount: 22.78, months: 36, newLineRequired: false, installmentRequired: true, eligiblePlanRequired: true, onlineOnly: false, inStoreOnly: false, unlockedRequired: false, activationRequired: true, startDate: "2026-02-21", endDate: "2026-03-30", sourceUrl: "https://www.att.com/deals/google-pixel-phones", sourceType: "estimated", confidenceScore: 0.74, lastVerifiedAt: "2026-03-01", finePrintSummary: "Estimated value based on current promo terms; final tier may vary by trade-in assessment.", notes: "Good Pixel promo but estimated until manually re-verified." },
  { id: "offer_tmo_iphone16pro_850", slug: "tmobile-iphone-16-pro-850", merchantId: "tmobile", carrierName: "T-Mobile", targetDevice: "iPhone 16 Pro", targetDeviceSlug: "iphone-16-pro-256", acceptedTradeInDevices: appleTradeIns, acceptedConditions: ["good", "fair", "mint"], tradeInType: "bill_credit", tradeInValue: 850, monthlyCreditAmount: 23.61, months: 36, newLineRequired: false, installmentRequired: true, eligiblePlanRequired: true, onlineOnly: false, inStoreOnly: false, unlockedRequired: false, activationRequired: true, startDate: "2026-02-25", endDate: "2026-03-31", sourceUrl: "https://www.t-mobile.com/offers/apple-iphone-deals", sourceType: "verified", confidenceScore: 0.83, lastVerifiedAt: "2026-03-05", finePrintSummary: "Requires premium plan and 36-month financing; value credited over time.", notes: "Less restrictive than Verizon, still delayed." },
  { id: "offer_google_pixel9pro_320_cash", slug: "google-store-pixel-9-pro-320-instant", merchantId: "google-store", carrierName: null, targetDevice: "Pixel 9 Pro", targetDeviceSlug: "pixel-9-pro-256", acceptedTradeInDevices: ["pixel-6a-128", "pixel-7-128", "pixel-8-128"], acceptedConditions: ["good", "fair", "mint", "cracked"], tradeInType: "cash", tradeInValue: 320, monthlyCreditAmount: null, months: null, newLineRequired: false, installmentRequired: false, eligiblePlanRequired: false, onlineOnly: true, inStoreOnly: false, unlockedRequired: true, activationRequired: false, startDate: "2026-02-05", endDate: "2026-04-10", sourceUrl: "https://store.google.com/tradein", sourceType: "verified", confidenceScore: 0.91, lastVerifiedAt: "2026-03-05", finePrintSummary: "Straight cash-equivalent trade-in estimate for eligible Pixels on unlocked checkout.", notes: "Lower headline value, highest immediacy." },
  { id: "offer_amazon_iphone16pro_420", slug: "amazon-iphone-16-pro-420", merchantId: "amazon", carrierName: null, targetDevice: "iPhone 16 Pro", targetDeviceSlug: "iphone-16-pro-256", acceptedTradeInDevices: ["iphone-11-128", "iphone-12-128", "iphone-13-128", "iphone-14-128"], acceptedConditions: ["good", "fair", "mint"], tradeInType: "store_credit", tradeInValue: 420, monthlyCreditAmount: null, months: null, newLineRequired: false, installmentRequired: false, eligiblePlanRequired: false, onlineOnly: true, inStoreOnly: false, unlockedRequired: false, activationRequired: false, startDate: "2026-02-02", endDate: "2026-03-20", sourceUrl: "https://www.amazon.com/b?node=tradein", sourceType: "manual", confidenceScore: 0.7, lastVerifiedAt: "2026-03-01", finePrintSummary: "Amazon gift card style trade-in value, useful only for users comfortable with store-balance credit.", notes: "Store-credit-only path with moderate trust." },
  { id: "offer_walmart_pixel9pro_380", slug: "walmart-pixel-9-pro-380", merchantId: "walmart", carrierName: null, targetDevice: "Pixel 9 Pro", targetDeviceSlug: "pixel-9-pro-256", acceptedTradeInDevices: ["pixel-6a-128", "pixel-7-128", "pixel-8-128", "iphone-11-128"], acceptedConditions: ["good", "fair", "mint"], tradeInType: "store_credit", tradeInValue: 380, monthlyCreditAmount: null, months: null, newLineRequired: false, installmentRequired: false, eligiblePlanRequired: false, onlineOnly: true, inStoreOnly: false, unlockedRequired: false, activationRequired: false, startDate: "2026-02-11", endDate: "2026-03-24", sourceUrl: "https://www.walmart.com/cp/trade-in/123456", sourceType: "estimated", confidenceScore: 0.69, lastVerifiedAt: "2026-02-28", finePrintSummary: "Modeled retailer gift-card path used for conservative comparison.", notes: "Useful benchmark but lower confidence." },
];

function sourceFor(deviceSlug: string, merchantId: string, sourceType: AcquisitionSource["sourceType"], estimatedPrice: number, condition: AcquisitionSource["condition"], title?: string): AcquisitionSource {
  const device = devices.find((entry) => entry.slug === deviceSlug)!;
  return {
    id: `acq_${deviceSlug}_${merchantId}_${condition}`,
    deviceId: device.id,
    merchantId,
    sourceType,
    title: title ?? `${device.model} - ${condition} unlocked`,
    url: `https://example.com/${merchantId}/${deviceSlug}`,
    affiliateUrl: merchantId === "ebay" || merchantId === "amazon" || merchantId === "best-buy" ? `https://example.com/${merchantId}/${deviceSlug}?ref=tradeinfinder` : null,
    estimatedPrice,
    condition,
    sellerRatingOrConfidence: sourceType === "manual" ? 0.7 : 0.79,
    lastCheckedAt: "2026-03-05",
  };
}

export const acquisitionSources: AcquisitionSource[] = [
  sourceFor("pixel-6a-128", "ebay", "ebay", 148, "good", "Pixel 6a 128GB - Good unlocked (avg sold comps)"),
  sourceFor("pixel-6a-128", "ebay", "ebay", 126, "fair", "Pixel 6a 128GB - Fair unlocked (avg sold comps)"),
  sourceFor("pixel-7-128", "ebay", "ebay", 228, "good", "Pixel 7 128GB - Good unlocked (avg sold comps)"),
  sourceFor("pixel-8-128", "amazon", "amazon", 309, "good", "Pixel 8 128GB - Renewed unlocked"),
  sourceFor("iphone-11-128", "ebay", "ebay", 219, "good", "iPhone 11 128GB - Good unlocked (avg sold comps)"),
  sourceFor("iphone-12-128", "ebay", "ebay", 279, "good", "iPhone 12 128GB - Good unlocked (avg sold comps)"),
  sourceFor("iphone-13-128", "ebay", "ebay", 356, "good", "iPhone 13 128GB - Good unlocked (avg sold comps)"),
  sourceFor("iphone-14-128", "amazon", "amazon", 469, "good", "iPhone 14 128GB - Renewed premium"),
  sourceFor("galaxy-s21-128", "ebay", "ebay", 182, "good", "Galaxy S21 128GB - Good unlocked (avg sold comps)"),
  sourceFor("galaxy-s22-128", "ebay", "ebay", 248, "good", "Galaxy S22 128GB - Good unlocked (avg sold comps)"),
  sourceFor("galaxy-s23-128", "best-buy", "bestbuy", 334, "fair", "Galaxy S23 128GB - Fair open-box estimate"),
  sourceFor("galaxy-s23-ultra-256", "ebay", "ebay", 602, "good", "Galaxy S23 Ultra 256GB - Good unlocked (avg sold comps)"),
  sourceFor("iphone-15-pro-256", "amazon", "amazon", 802, "good", "iPhone 15 Pro 256GB - Renewed premium"),
  sourceFor("pixel-8-pro-256", "ebay", "ebay", 492, "good", "Pixel 8 Pro 256GB - Good unlocked (avg sold comps)"),
  sourceFor("oneplus-11-256", "walmart", "marketplace", 298, "good", "OnePlus 11 256GB - Marketplace estimate"),
];

export const savedScenarios: SavedScenario[] = [
  { id: "scenario_1", userId: "demo_user", currentDevice: "iphone-13-128", targetDevice: "iphone-16-pro-256", condition: "good", preferences: { merchant: "best-buy", unlocked: "true", sortBy: "lowest-risk" }, resultSnapshot: "Best Buy unlocked path with $540 store credit ranked top for low risk." },
  { id: "scenario_2", userId: "demo_user", currentDevice: "pixel-7-128", targetDevice: "galaxy-s25-ultra-256", condition: "good", preferences: { merchant: "tmobile", allowIntermediate: "true" }, resultSnapshot: "Pixel 6a buy-first trade into T-Mobile promo created the best spread." },
  { id: "scenario_3", userId: "demo_user", currentDevice: "galaxy-s23-128", targetDevice: "iphone-16-pro-max-256", condition: "fair", preferences: { merchant: "att", budget: "balanced" }, resultSnapshot: "AT&T bill-credit path won on net value, but the low-risk Samsung path stayed close." },
];

export const watchedItems: WatchedItem[] = [
  { id: "watch_1", userId: "demo_user", type: "device", referenceSlug: "iphone-13-128", note: "Watch if direct value clears $500 again.", lastChangeSummary: "Best Buy store credit moved up by $20 this week." },
  { id: "watch_2", userId: "demo_user", type: "merchant", referenceSlug: "att", note: "Watch iPhone flagship bill-credit promos.", lastChangeSummary: "AT&T Pixel promo confidence slipped from verified to estimated." },
  { id: "watch_3", userId: "demo_user", type: "offer", referenceSlug: "tmobile-galaxy-s25-ultra-1000", note: "Watch for expiry or plan change.", lastChangeSummary: "Offer expires within 3 weeks." },
];

export const alertSubscriptions: AlertSubscription[] = [
  { id: "alert_1", email: "signals@tradeinfinder.example", type: "device_value", referenceSlug: "iphone-13-128", status: "active" },
  { id: "alert_2", email: "signals@tradeinfinder.example", type: "merchant_offer", referenceSlug: "best-buy", status: "active" },
  { id: "alert_3", email: "signals@tradeinfinder.example", type: "arbitrage", referenceSlug: "pixel-6a-128", status: "paused" },
];

export const rawIngestRecords: RawIngestRecord[] = [
  { id: "raw_1", sourceName: "AT&T iPhone deals", sourceUrl: "https://www.att.com/deals/iphone", payload: "{\"promo\":\"up to 1000\"}", parsedAt: "2026-03-05T10:30:00.000Z", status: "parsed", errors: "" },
  { id: "raw_2", sourceName: "Best Buy trade-in grid", sourceUrl: "https://www.bestbuy.com/site/mobile-cell-phones/trade-in/pcmcat1563302948687.c", payload: "{\"grid\":\"manual import\"}", parsedAt: "2026-03-02T14:12:00.000Z", status: "pending", errors: "" },
  { id: "raw_3", sourceName: "Google Store trade-in export", sourceUrl: "https://store.google.com/tradein", payload: "{\"pixel9\":470}", parsedAt: "2026-03-05T06:45:00.000Z", status: "parsed", errors: "" },
];

export const topUpgradeComparisons = [
  { slug: "iphone-13-to-iphone-16-pro", oldDeviceSlug: "iphone-13-128", newDeviceSlug: "iphone-16-pro-256" },
  { slug: "pixel-7-to-pixel-9-pro", oldDeviceSlug: "pixel-7-128", newDeviceSlug: "pixel-9-pro-256" },
  { slug: "galaxy-s23-to-galaxy-s25-ultra", oldDeviceSlug: "galaxy-s23-128", newDeviceSlug: "galaxy-s25-ultra-256" },
  { slug: "iphone-12-to-iphone-16-pro-max", oldDeviceSlug: "iphone-12-128", newDeviceSlug: "iphone-16-pro-max-256" },
  { slug: "galaxy-s22-to-pixel-9-pro", oldDeviceSlug: "galaxy-s22-128", newDeviceSlug: "pixel-9-pro-256" },
] as const;


