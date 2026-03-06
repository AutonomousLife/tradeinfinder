export const siteConfig = {
  name: "TradeInFinder",
  description:
    "A phone trade-in and upgrade optimization platform for direct value, true upgrade cost, arbitrage spreads, and transparent promo caveats.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path}`;
}
