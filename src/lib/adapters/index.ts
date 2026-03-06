import { amazonAdapter } from "@/lib/adapters/amazon";
import { appleAdapter } from "@/lib/adapters/apple";
import { bestBuyAdapter } from "@/lib/adapters/best-buy";
import { ebayAdapter } from "@/lib/adapters/ebay";
import { samsungAdapter } from "@/lib/adapters/samsung";

export const merchantAdapters = [
  appleAdapter,
  samsungAdapter,
  bestBuyAdapter,
  amazonAdapter,
  ebayAdapter,
];
