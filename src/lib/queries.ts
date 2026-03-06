import { devices, merchants, offers } from "@/lib/seed-data";

export function getSearchSuggestions(query: string) {
  const needle = query.toLowerCase().trim();

  if (!needle) {
    return {
      devices: devices.slice(0, 6),
      merchants: merchants.slice(0, 6),
      offers: offers.slice(0, 6),
    };
  }

  return {
    devices: devices.filter((device) =>
      `${device.brand} ${device.model}`.toLowerCase().includes(needle),
    ),
    merchants: merchants.filter((merchant) =>
      merchant.name.toLowerCase().includes(needle),
    ),
    offers: offers.filter((offer) =>
      `${offer.targetDevice} ${offer.slug}`.toLowerCase().includes(needle),
    ),
  };
}
