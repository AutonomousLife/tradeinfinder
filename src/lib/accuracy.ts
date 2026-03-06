import type {
  Condition,
  FallbackLevel,
  RawIngestRecord,
  ResolvedValue,
  Store,
  ValueRecord,
  VerificationStatus,
} from "@/lib/schema";

const HOUR_MS = 1000 * 60 * 60;

export function isStale(record: ValueRecord, now = new Date()) {
  const ageHours = (now.getTime() - new Date(record.retrievedAt).getTime()) / HOUR_MS;
  return ageHours > record.staleAfterHours;
}

export function freshnessLabel(record: ValueRecord, now = new Date()) {
  const ageHours = (now.getTime() - new Date(record.retrievedAt).getTime()) / HOUR_MS;
  if (ageHours < 1) return "Verified within the last hour";
  if (ageHours < 24) return `Checked ${Math.round(ageHours)} hours ago`;
  return `Checked ${Math.round(ageHours / 24)} days ago`;
}

export function confidenceLabel(score: number, status: VerificationStatus) {
  if (status === "stale") return "Stale";
  if (status === "manual") return "Manual review";
  if (status === "low_confidence") return "Low confidence";
  if (status === "verified" && score >= 0.88) return "Verified";
  if (score >= 0.8) return "High confidence";
  return "Estimated";
}

export function valueDisplay(record: ValueRecord, fallbackLevel: FallbackLevel, confidence: number) {
  if (confidence < 0.62 || fallbackLevel === "family_estimate") {
    const spread = Math.max(20, Math.round(record.valueAmount * 0.08));
    return {
      displayValue: `$${record.valueAmount - spread}-$${record.valueAmount + spread}`,
      rangeLow: record.valueAmount - spread,
      rangeHigh: record.valueAmount + spread,
    };
  }

  return {
    displayValue: `$${record.valueAmount}`,
  };
}

export function verificationStatusFor(args: {
  confidence: number;
  stale: boolean;
  manualOverride: boolean;
  exactMatch: boolean;
}) : VerificationStatus {
  if (args.stale) return "stale";
  if (args.manualOverride) return "manual";
  if (args.confidence < 0.55 || !args.exactMatch) return "low_confidence";
  if (args.confidence >= 0.84) return "verified";
  return "estimated";
}

export function computeConfidence(args: {
  merchant: Store;
  raw: RawIngestRecord;
  exactMatch: boolean;
  exactStorageMatch: boolean;
  parserQuality: number;
  manualOverride: boolean;
  now?: Date;
}) {
  const now = args.now ?? new Date();
  const ageHours = (now.getTime() - new Date(args.raw.retrievedAt).getTime()) / HOUR_MS;
  const freshness = Math.max(0.2, 1 - ageHours / 120);
  const exactness = args.exactMatch ? 1 : args.exactStorageMatch ? 0.88 : 0.72;
  const parseSuccess = args.raw.parseStatus === "parsed" ? 1 : args.raw.parseStatus === "pending" ? 0.65 : 0.35;
  const manualBoost = args.manualOverride ? 0.08 : 0;
  const score = Math.min(0.99, Math.max(0.25, args.merchant.trustScore * 0.3 + freshness * 0.22 + exactness * 0.2 + args.parserQuality * 0.18 + parseSuccess * 0.1 + manualBoost));
  return Number(score.toFixed(2));
}

export function normalizeCondition(raw: string): { condition: Condition | null; note: string } {
  const value = raw.toLowerCase();
  if (["good", "mint", "excellent", "working", "minor wear"].some((entry) => value.includes(entry))) {
    return { condition: "good", note: "Mapped from merchant good or excellent condition." };
  }
  if (["damaged", "fair", "cracked", "screen damage", "heavy wear"].some((entry) => value.includes(entry))) {
    return { condition: "damaged", note: "Mapped from merchant damaged or fair condition bucket." };
  }
  if (["poor", "not accepted", "dead", "broken", "no value"].some((entry) => value.includes(entry))) {
    return { condition: "poor", note: "Mapped from merchant non-accepted or poor condition bucket." };
  }
  return { condition: null, note: "Condition could not be normalized." };
}

export function fallbackLabel(level: FallbackLevel) {
  if (level === "exact_verified") return "Exact verified match";
  if (level === "exact_estimated") return "Exact estimated match";
  if (level === "storage_adjusted") return "Same model, different storage";
  if (level === "family_estimate") return "Similar family estimate";
  return "Unavailable";
}

export function buildResolvedValue(record: ValueRecord, fallbackLevel: FallbackLevel, whyValue: string, confidenceRationale: ResolvedValue["confidenceRationale"], now = new Date()): ResolvedValue {
  const stale = isStale(record, now);
  const status = stale ? "stale" : record.verificationStatus;
  const display = valueDisplay(record, fallbackLevel, record.confidenceScore);
  return {
    record: {
      ...record,
      verificationStatus: stale ? "stale" : record.verificationStatus,
    },
    stale,
    fallbackLevel,
    confidenceLabel: confidenceLabel(record.confidenceScore, status),
    freshnessLabel: freshnessLabel(record, now),
    whyValue,
    confidenceRationale,
    displayValue: display.displayValue,
    rangeLow: display.rangeLow,
    rangeHigh: display.rangeHigh,
    deprioritized: stale || record.confidenceScore < 0.62,
  };
}
