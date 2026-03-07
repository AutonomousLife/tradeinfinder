import type { AcquisitionSource, Merchant, RankedPath } from "@/lib/schema";

export function buildPathLinks(args: {
  acquisition: AcquisitionSource | null;
  merchant: Merchant;
  deviceSlug: string;
  targetDeviceSlug?: string;
  deviceLabel: string;
  targetDeviceLabel?: string;
  sourceUrl?: string;
}): RankedPath["links"] {
  const acquisitionLabel = args.acquisition ? `Buy on ${sourceLabel(args.acquisition.sourceType)}` : undefined;
  const redemptionHref = internalRedemptionLink(args.deviceSlug, args.merchant.slug, args.targetDeviceSlug);

  return {
    acquisitionLink: args.acquisition ? args.acquisition.affiliateUrl ?? args.acquisition.url : undefined,
    acquisitionAffiliateLink: args.acquisition?.affiliateUrl ?? undefined,
    acquisitionLabel,
    redemptionLink: redemptionHref,
    redemptionAffiliateLink: buildMerchantExternalLink(args),
    redemptionLabel: redemptionLabel(args.merchant.name, args.deviceSlug, args.targetDeviceSlug),
  };
}

function sourceLabel(sourceType: AcquisitionSource["sourceType"]) {
  if (sourceType === "ebay") return "eBay";
  if (sourceType === "amazon") return "Amazon";
  if (sourceType === "bestbuy") return "Best Buy";
  if (sourceType === "marketplace") return "Marketplace";
  return "seller";
}

function redemptionLabel(merchantName: string, deviceSlug: string, targetDeviceSlug?: string) {
  if (targetDeviceSlug && targetDeviceSlug !== deviceSlug) {
    return `View ${merchantName} path`;
  }

  return `View ${merchantName} trade-in`;
}

function internalRedemptionLink(deviceSlug: string, merchantSlug: string, targetDeviceSlug?: string) {
  if (targetDeviceSlug && targetDeviceSlug !== deviceSlug) {
    return `/upgrade-path/${deviceSlug}/${targetDeviceSlug}`;
  }

  return `/trade-in/${deviceSlug}/${merchantSlug}`;
}

function buildMerchantExternalLink(args: {
  merchant: Merchant;
  sourceUrl?: string;
  deviceLabel: string;
  targetDeviceLabel?: string;
}) {
  const query = encodeURIComponent((args.targetDeviceLabel ?? args.deviceLabel).replace(/\s+/g, " ").trim());
  const fallback = args.sourceUrl ?? args.merchant.siteUrl;

  if (args.merchant.slug === "apple") {
    return args.targetDeviceLabel ? `https://www.apple.com/us/search/${query}?src=serp` : "https://www.apple.com/shop/trade-in";
  }

  if (args.merchant.slug === "samsung") {
    return `https://www.samsung.com/us/search/searchMain/?listType=g&searchTerm=${query}`;
  }

  if (args.merchant.slug === "best-buy") {
    return `https://www.bestbuy.com/site/searchpage.jsp?st=${query}`;
  }

  if (args.merchant.slug === "amazon") {
    return args.targetDeviceLabel ? `https://www.amazon.com/s?k=${query}` : "https://www.amazon.com/b?node=9187220011";
  }

  if (args.merchant.slug === "google-store") {
    return `https://store.google.com/us/search?q=${query}`;
  }

  if (args.merchant.slug === "ebay") {
    return `https://www.ebay.com/sch/i.html?_nkw=${query}`;
  }

  return fallback;
}
