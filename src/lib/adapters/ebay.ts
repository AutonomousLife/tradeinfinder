import type { MerchantAdapter } from "@/lib/adapters/base";
import { compactPayload, createValueRecord } from "@/lib/adapters/base";

export const ebayAdapter: MerchantAdapter = {
  merchantId: "ebay",
  parserVersion: "ebay-v1",
  parse(raw, context) {
    return compactPayload(raw).entries
      .map((entry) =>
        createValueRecord({
          raw,
          context,
          deviceSlug: entry.deviceSlug,
          storageVariant: entry.storageVariant,
          rawCondition: entry.condition,
          valueAmount: entry.valueAmount,
          valueType: entry.valueType,
          notes: entry.notes,
          exactMatch: entry.exactMatch,
          exactStorageMatch: entry.exactStorageMatch,
          parserQuality: entry.parserQuality ?? 0.7,
          staleAfterHours: entry.staleAfterHours ?? 12,
        }),
      )
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
  },
};
