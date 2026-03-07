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
    return `/upgrade-path/${deviceSlug}/${targetDeviceSlug}?merchant=${encodeURIComponent(merchantSlug)}`;
  }

  return `/trade-in/${deviceSlug}/${merchantSlug}`;
}

function buildMerchantExternalLink(args: {
  merchant: Merchant;
  sourceUrl?: string;
  deviceSlug: string;
  targetDeviceSlug?: string;
  deviceLabel: string;
  targetDeviceLabel?: string;
}) {
  const productQuery = encodeURIComponent((args.targetDeviceLabel ?? args.deviceLabel).replace(/\s+/g, " ").trim());
  const deviceQuery = encodeURIComponent(args.deviceLabel.replace(/\s+/g, " ").trim());
  const fallback = args.sourceUrl ?? args.merchant.siteUrl;

  if (args.merchant.slug === "apple") {
    if (args.targetDeviceSlug) {
      return appleProductUrl(args.targetDeviceSlug) ?? `https://www.apple.com/us/search/${productQuery}?src=serp`;
    }
    return "https://www.apple.com/shop/trade-in";
  }

  if (args.merchant.slug === "samsung") {
    if (args.targetDeviceSlug) {
      return samsungProductUrl(args.targetDeviceSlug) ?? `https://www.samsung.com/us/search/searchMain/?listType=g&searchTerm=${productQuery}`;
    }
    return "https://www.samsung.com/us/trade-in/";
  }

  if (args.merchant.slug === "best-buy") {
    return args.targetDeviceSlug
      ? `https://www.bestbuy.com/site/searchpage.jsp?st=${productQuery}`
      : `https://www.bestbuy.com/site/searchpage.jsp?st=${deviceQuery}`;
  }

  if (args.merchant.slug === "amazon") {
    return args.targetDeviceLabel ? `https://www.amazon.com/s?k=${productQuery}` : "https://www.amazon.com/b?node=9187220011";
  }

  if (args.merchant.slug === "google-store") {
    if (args.targetDeviceSlug) {
      return googleProductUrl(args.targetDeviceSlug) ?? `https://store.google.com/us/search?q=${productQuery}`;
    }
    return "https://store.google.com/us/magazine/trade_in";
  }

  if (args.merchant.slug === "ebay") {
    return `https://www.ebay.com/sch/i.html?_nkw=${productQuery}`;
  }

  return fallback;
}

function appleProductUrl(targetDeviceSlug: string) {
  const match = /^iphone-(.+)-\d+$/.exec(targetDeviceSlug);
  if (!match) return undefined;

  return `https://www.apple.com/shop/buy-iphone/iphone-${match[1]}`;
}

function samsungProductUrl(targetDeviceSlug: string) {
  const map: Record<string, string> = {
    "galaxy-s24-128": "https://www.samsung.com/us/smartphones/galaxy-s24/",
    "galaxy-s24-ultra-256": "https://www.samsung.com/us/smartphones/galaxy-s24-ultra/",
    "galaxy-s23-128": "https://www.samsung.com/us/smartphones/galaxy-s23/",
    "galaxy-s23-ultra-256": "https://www.samsung.com/us/smartphones/galaxy-s23-ultra/",
  };

  return map[targetDeviceSlug];
}

function googleProductUrl(targetDeviceSlug: string) {
  const map: Record<string, string> = {
    "pixel-9-pro-256": "https://store.google.com/us/product/pixel_9_pro",
    "pixel-8-128": "https://store.google.com/us/product/pixel_8",
    "pixel-8-pro-256": "https://store.google.com/us/product/pixel_8_pro",
  };

  return map[targetDeviceSlug];
}
