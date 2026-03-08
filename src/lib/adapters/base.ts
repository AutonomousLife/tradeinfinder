import type { Device, RawIngestRecord, Store, ValueOrigin, ValueRecord, ValueType } from "@/lib/schema";
import { buildResolvedValue, computeConfidence, normalizeCondition, verificationStatusFor } from "@/lib/accuracy";

export type AdapterContext = {
  devicesBySlug: Map<string, Device>;
  merchantsById: Map<string, Store>;
  now?: Date;
};

export type MerchantAdapter = {
  merchantId: string;
  parserVersion: string;
  parse: (raw: RawIngestRecord, context: AdapterContext) => ValueRecord[];
};

export function createValueRecord(args: {
  raw: RawIngestRecord;
  context: AdapterContext;
  deviceSlug: string;
  storageVariant: string;
  rawCondition: string;
  valueAmount: number;
  valueType: ValueType;
  staleAfterHours: number;
  targetDeviceSlug?: string | null;
  notes?: string;
  exactStorageMatch?: boolean;
  exactMatch?: boolean;
  manualOverride?: boolean;
  parserQuality?: number;
}) {
  const device = args.context.devicesBySlug.get(args.deviceSlug);
  const merchant = args.context.merchantsById.get(args.raw.merchantId);
  if (!device || !merchant) return null;

  const normalized = normalizeCondition(args.rawCondition);
  if (!normalized.condition) return null;

  const confidenceScore = computeConfidence({
    merchant,
    raw: args.raw,
    exactMatch: args.exactMatch ?? true,
    exactStorageMatch: args.exactStorageMatch ?? true,
    parserQuality: args.parserQuality ?? 0.9,
    manualOverride: args.manualOverride ?? false,
    now: args.context.now,
  });

  const verificationStatus = verificationStatusFor({
    confidence: confidenceScore,
    stale: false,
    manualOverride: args.manualOverride ?? false,
    exactMatch: args.exactMatch ?? true,
  });

  let origin: ValueOrigin = "modeled_estimate";
  let publicVisible = false;
  let quoteCapturedAt: string | null = null;

  if (args.valueType === "resale_estimate") {
    origin = "resale_estimate";
    publicVisible = true;
  } else if (args.raw.captureMode === "live_quote_capture") {
    origin = "live_quote";
    publicVisible = true;
    quoteCapturedAt = args.raw.retrievedAt;
  } else if (args.raw.captureMode === "manual_snapshot") {
    origin = "manual_review";
    quoteCapturedAt = args.raw.retrievedAt;
  } else if (args.raw.captureMode === "seeded_import") {
    origin = "seeded_snapshot";
  }

  return {
    id: `value_${args.raw.merchantId}_${args.deviceSlug}_${normalized.condition}_${args.valueType}_${Math.round(args.valueAmount)}`,
    slug: `${args.raw.merchantId}-${args.deviceSlug}-${args.valueType}`,
    deviceId: device.id,
    merchantId: args.raw.merchantId,
    storageVariant: args.storageVariant,
    condition: normalized.condition,
    valueAmount: Math.round(args.valueAmount),
    currency: "USD",
    valueType: args.valueType,
    sourceName: args.raw.sourceName,
    sourceUrl: args.raw.sourceUrl,
    rawSourceId: args.raw.id,
    retrievedAt: args.raw.retrievedAt,
    staleAfterHours: args.staleAfterHours,
    verificationStatus,
    confidenceScore,
    notes: args.notes ?? normalized.note,
    manualOverride: args.manualOverride ?? false,
    active: true,
    targetDeviceSlug: args.targetDeviceSlug ?? null,
    conditionNotes: normalized.note,
    exactStorageMatch: args.exactStorageMatch ?? true,
    origin,
    publicVisible,
    quoteCapturedAt,
  } satisfies ValueRecord;
}

export function compactPayload(raw: RawIngestRecord) {
  return JSON.parse(raw.payload) as {
    entries: Array<{
      deviceSlug: string;
      storageVariant: string;
      condition: string;
      valueAmount: number;
      valueType: ValueType;
      targetDeviceSlug?: string | null;
      notes?: string;
      exactStorageMatch?: boolean;
      exactMatch?: boolean;
      parserQuality?: number;
      staleAfterHours?: number;
    }>;
  };
}

export function resolvedInspector(record: ValueRecord) {
  return buildResolvedValue(
    record,
    record.confidenceScore >= 0.84 ? "exact_verified" : record.exactStorageMatch ? "exact_estimated" : "storage_adjusted",
    record.notes,
    [
      { label: "Parser", impact: record.sourceName },
      { label: "Confidence", impact: String(record.confidenceScore) },
    ],
  );
}