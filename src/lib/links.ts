import type { AcquisitionSource, Merchant, RankedPath } from "@/lib/schema";

export function buildPathLinks(args: {
  acquisition: AcquisitionSource | null;
  merchant: Merchant;
  targetDeviceSlug: string;
}): RankedPath["links"] {
  const acquisitionLabel = args.acquisition
    ? `Buy on ${sourceLabel(args.acquisition.sourceType)}`
    : undefined;
  const acquisitionLink = args.acquisition?.url;
  const acquisitionAffiliateLink = args.acquisition?.affiliateUrl ?? undefined;
  const redemptionLink = `${args.merchant.siteUrl}/`;

  return {
    acquisitionLink,
    acquisitionAffiliateLink,
    acquisitionLabel,
    redemptionLink,
    redemptionAffiliateLink: undefined,
    redemptionLabel: redemptionLabel(args.merchant.name, args.targetDeviceSlug),
  };
}

function sourceLabel(sourceType: AcquisitionSource["sourceType"]) {
  if (sourceType === "ebay") return "eBay";
  if (sourceType === "amazon") return "Amazon";
  if (sourceType === "bestbuy") return "Best Buy";
  return "seller";
}

function redemptionLabel(merchantName: string, targetDeviceSlug: string) {
  if (targetDeviceSlug.includes("iphone")) {
    return `Upgrade at ${merchantName}`;
  }

  return `Trade at ${merchantName}`;
}
