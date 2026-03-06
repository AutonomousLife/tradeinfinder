import type { MetadataRoute } from "next";

import {
  devices,
  merchants,
  offers,
  topUpgradeComparisons,
} from "@/lib/seed-data";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/search",
    "/upgrade",
    "/arbitrage",
    "/deals",
    "/dashboard",
    "/methodology",
    "/admin",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "/" ? 1 : 0.8,
    })),
    ...devices.flatMap((device) => [
      {
        url: absoluteUrl(`/device/${device.slug}`),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.75,
      },
      {
        url: absoluteUrl(`/best-trade-in/${device.slug}`),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.72,
      },
      {
        url: absoluteUrl(`/best-upgrade/${device.slug}`),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.72,
      },
    ]),
    ...merchants.map((merchant) => ({
      url: absoluteUrl(`/merchant/${merchant.slug}`),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...offers.map((offer) => ({
      url: absoluteUrl(`/offer/${offer.slug}`),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.68,
    })),
    ...offers.flatMap((offer) =>
      offer.acceptedTradeInDevices.map((deviceSlug) => ({
        url: absoluteUrl(`/trade-in/${deviceSlug}/${offer.merchantId}`),
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.66,
      })),
    ),
    ...topUpgradeComparisons.map((comparison) => ({
      url: absoluteUrl(
        `/upgrade-path/${comparison.oldDeviceSlug}/${comparison.newDeviceSlug}`,
      ),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.67,
    })),
    ...topUpgradeComparisons.map((comparison) => ({
      url: absoluteUrl(`/compare/${comparison.slug}`),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.67,
    })),
  ];
}
