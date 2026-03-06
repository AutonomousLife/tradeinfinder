import type { AcquisitionSource, Merchant, RankedPath } from "@/lib/schema";

export function buildPathLinks(args: {
  acquisition: AcquisitionSource | null;
  merchant: Merchant;
  deviceSlug: string;
  targetDeviceSlug?: string;
}): RankedPath["links"] {
  const acquisitionLabel = args.acquisition ? `Buy on ${sourceLabel(args.acquisition.sourceType)}` : undefined;
  const redemptionHref = internalRedemptionLink(args.deviceSlug, args.merchant.slug, args.targetDeviceSlug);

  return {
    acquisitionLink: args.acquisition ? args.acquisition.affiliateUrl ?? args.acquisition.url : undefined,
    acquisitionAffiliateLink: args.acquisition?.affiliateUrl ?? undefined,
    acquisitionLabel,
    redemptionLink: redemptionHref,
    redemptionAffiliateLink: undefined,
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
