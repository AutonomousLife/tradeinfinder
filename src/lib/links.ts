import type { AcquisitionSource, Merchant, RankedPath } from "@/lib/schema";

export function buildPathLinks(args: {
  acquisition: AcquisitionSource | null;
  merchant: Merchant;
  targetDeviceSlug: string;
}): RankedPath["links"] {
  const targetQuery = slugToQuery(args.targetDeviceSlug);
  const acquisitionQuery = args.acquisition ? sourceQuery(args.acquisition.title) : undefined;
  const acquisitionLabel = args.acquisition ? `Buy on ${sourceLabel(args.acquisition.sourceType)}` : undefined;

  return {
    acquisitionLink: args.acquisition ? acquisitionLinkForSource(args.acquisition.sourceType, acquisitionQuery ?? targetQuery) : undefined,
    acquisitionAffiliateLink: undefined,
    acquisitionLabel,
    redemptionLink: redemptionLinkForMerchant(args.merchant.slug, targetQuery),
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
    return `See ${merchantName} results`;
  }

  return `Trade in at ${merchantName}`;
}

function slugToQuery(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b(\d+)\b/g, "$1")
    .replace(/\bpro max\b/gi, "Pro Max")
    .replace(/\bpro\b/gi, "Pro")
    .replace(/\bultra\b/gi, "Ultra")
    .replace(/\bplus\b/gi, "Plus")
    .replace(/\bmini\b/gi, "mini")
    .replace(/\bse\b/gi, "SE")
    .replace(/\bpixel\b/gi, "Pixel")
    .replace(/\biphone\b/gi, "iPhone")
    .replace(/\bgalaxy\b/gi, "Galaxy")
    .trim();
}

function sourceQuery(title: string) {
  return title
    .replace(/\s+-\s+/g, " ")
    .replace(/\b(avg sold comps|sold-listing benchmark|renewed benchmark|marketplace benchmark)\b/gi, "")
    .trim();
}

function redemptionLinkForMerchant(merchantSlug: string, query: string) {
  const encoded = encodeURIComponent(query);

  if (merchantSlug === "apple") {
    return `https://www.apple.com/us/search/${encoded}?src=globalnav`;
  }
  if (merchantSlug === "samsung") {
    return `https://www.samsung.com/us/search/searchMain/?listType=g&searchTerm=${encoded}`;
  }
  if (merchantSlug === "best-buy") {
    return `https://www.bestbuy.com/site/searchpage.jsp?st=${encoded}`;
  }
  if (merchantSlug === "amazon") {
    return `https://www.amazon.com/s?k=${encoded}`;
  }
  if (merchantSlug === "google-store") {
    return `https://store.google.com/us/search?q=${encoded}`;
  }
  if (merchantSlug === "ebay") {
    return `https://www.ebay.com/sch/i.html?_nkw=${encoded}`;
  }

  return `https://www.google.com/search?q=${encoded}`;
}

function acquisitionLinkForSource(sourceType: AcquisitionSource["sourceType"], query: string) {
  const encoded = encodeURIComponent(query);

  if (sourceType === "ebay") {
    return `https://www.ebay.com/sch/i.html?_nkw=${encoded}`;
  }
  if (sourceType === "amazon") {
    return `https://www.amazon.com/s?k=${encoded}`;
  }
  if (sourceType === "bestbuy") {
    return `https://www.bestbuy.com/site/searchpage.jsp?st=${encoded}`;
  }
  if (sourceType === "marketplace") {
    return `https://www.google.com/search?q=${encoded}+marketplace`;
  }

  return `https://www.google.com/search?q=${encoded}`;
}
