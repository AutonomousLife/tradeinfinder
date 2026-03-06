import type { AcquisitionSource, Merchant, RankedPath } from "@/lib/schema";

export function buildPathLinks(args: {
  acquisition: AcquisitionSource | null;
  merchant: Merchant;
  targetDeviceSlug: string;
}): RankedPath["links"] {
  const acquisitionLabel = args.acquisition ? `Buy on ${sourceLabel(args.acquisition.sourceType)}` : undefined;
  const acquisitionLink = args.acquisition?.affiliateUrl ?? args.acquisition?.url;

  return {
    acquisitionLink,
    acquisitionAffiliateLink: args.acquisition?.affiliateUrl ?? undefined,
    acquisitionLabel,
    redemptionLink: `${args.merchant.siteUrl}/`,
    redemptionAffiliateLink: undefined,
    redemptionLabel: redemptionLabel(args.merchant.name, args.targetDeviceSlug),
  };
}

function sourceLabel(sourceType: AcquisitionSource["sourceType"]) {
  if (sourceType === "ebay") return "eBay";
  if (sourceType === "amazon") return "Amazon";
  if (sourceType === "bestbuy") return "Best Buy";
  if (sourceType === "marketplace") return "Marketplace";
  return "seller";
}

function redemptionLabel(merchantName: string, targetDeviceSlug: string) {
  if (targetDeviceSlug.includes("iphone") || targetDeviceSlug.includes("pixel") || targetDeviceSlug.includes("galaxy")) {
    return `See ${merchantName} checkout`;
  }

  return `Trade in at ${merchantName}`;
}
