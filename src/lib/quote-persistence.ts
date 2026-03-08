import { verificationStatusFor } from "@/lib/accuracy";
import { devices, merchants } from "@/lib/seed-data";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { QuoteArtifact, QuoteRun, RawIngestRecord, ValueRecord } from "@/lib/schema";
import type { CollectorExecutionResult, QuotePreview } from "@/lib/quote-collectors/types";

function bestPreview(previews: QuotePreview[]) {
  return [...previews].sort((a, b) => b.confidence - a.confidence || (b.valueAmount ?? 0) - (a.valueAmount ?? 0))[0] ?? null;
}

function safeId(prefix: string, ...parts: Array<string | null | undefined>) {
  return `${prefix}_${parts.filter(Boolean).join("_").replace(/[^a-z0-9_\-]+/gi, "_")}`.toLowerCase();
}

function buildRawIngestRecord(result: CollectorExecutionResult): RawIngestRecord {
  return {
    id: safeId("raw", result.merchantSlug, result.deviceSlug, result.condition, result.finishedAt),
    merchantId: result.merchantSlug,
    sourceName: `${result.merchantSlug} live quote capture`,
    fetchUrl: result.sourceUrl,
    sourceUrl: result.sourceUrl,
    payload: JSON.stringify({ previews: result.previews, logs: result.logs }),
    retrievedAt: result.finishedAt,
    parseStatus: result.status === "captured" ? "parsed" : "failed",
    parseErrors: result.error ? [result.error] : [],
    merchantParserVersion: result.artifacts[0]?.parserVersion ?? "live-capture-v1",
    captureMode: "live_quote_capture",
  };
}

function buildQuoteRunRecord(result: CollectorExecutionResult, artifactId: string | null, valueRecordId: string | null): QuoteRun {
  return {
    id: safeId("run", result.merchantSlug, result.deviceSlug, result.condition, result.startedAt),
    merchantId: result.merchantSlug,
    deviceSlug: result.deviceSlug,
    targetDeviceSlug: result.targetDeviceSlug ?? null,
    condition: result.condition,
    status: result.status,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    error: result.error ?? null,
    artifactId,
    valueRecordId,
  };
}

function buildArtifactRecords(result: CollectorExecutionResult): QuoteArtifact[] {
  return result.artifacts.map((artifact) => ({
    id: artifact.id,
    merchantId: result.merchantSlug,
    deviceSlug: result.deviceSlug,
    targetDeviceSlug: result.targetDeviceSlug ?? null,
    condition: result.condition,
    sourceUrl: artifact.sourceUrl,
    artifactType: artifact.artifactType,
    payload: artifact.payload,
    capturedAt: artifact.capturedAt,
    parserVersion: artifact.parserVersion,
  }));
}

function buildValueRecord(result: CollectorExecutionResult, rawSourceId: string, preview: QuotePreview): ValueRecord | null {
  const device = devices.find((entry) => entry.slug === result.deviceSlug);
  const merchant = merchants.find((entry) => entry.slug === result.merchantSlug);
  if (!device || !merchant || preview.valueAmount == null || !preview.valueType) return null;

  const confidenceScore = Number(preview.confidence.toFixed(2));
  const verificationStatus = verificationStatusFor({
    confidence: confidenceScore,
    stale: false,
    manualOverride: false,
    exactMatch: confidenceScore >= 0.66,
  });

  return {
    id: safeId("value", result.merchantSlug, result.deviceSlug, result.condition, preview.valueType, result.finishedAt),
    slug: `${result.merchantSlug}-${result.deviceSlug}-${preview.valueType}-live`,
    deviceId: device.id,
    merchantId: merchant.id,
    storageVariant: device.storageVariants[0] ?? "Unknown",
    condition: result.condition,
    valueAmount: preview.valueAmount,
    currency: "USD",
    valueType: preview.valueType,
    sourceName: `${merchant.name} live quote`,
    sourceUrl: result.sourceUrl,
    rawSourceId,
    retrievedAt: result.finishedAt,
    staleAfterHours: 8,
    verificationStatus,
    confidenceScore,
    notes: preview.explanation,
    manualOverride: false,
    active: result.status === "captured",
    targetDeviceSlug: result.targetDeviceSlug ?? null,
    conditionNotes: preview.matchedText ?? preview.label,
    exactStorageMatch: confidenceScore >= 0.66,
    origin: "live_quote",
    publicVisible: confidenceScore >= 0.6,
    quoteCapturedAt: result.finishedAt,
  };
}

export async function persistCollectorResult(result: CollectorExecutionResult) {
  const supabase = getSupabaseAdminClient();
  const rawRecord = buildRawIngestRecord(result);
  const artifacts = buildArtifactRecords(result);
  const preview = bestPreview(result.previews);
  const valueRecord = preview ? buildValueRecord(result, rawRecord.id, preview) : null;
  const runRecord = buildQuoteRunRecord(result, artifacts[0]?.id ?? null, valueRecord?.id ?? null);

  if (!supabase) {
    return {
      persisted: false,
      reason: "Supabase admin client is not configured.",
      rawRecord,
      artifacts,
      valueRecord,
      runRecord,
    };
  }

  const rawPayload = {
    id: rawRecord.id,
    merchant_id: rawRecord.merchantId,
    source_name: rawRecord.sourceName,
    fetch_url: rawRecord.fetchUrl,
    source_url: rawRecord.sourceUrl,
    payload: JSON.parse(rawRecord.payload),
    retrieved_at: rawRecord.retrievedAt,
    parse_status: rawRecord.parseStatus,
    parse_errors: rawRecord.parseErrors,
    merchant_parser_version: rawRecord.merchantParserVersion,
    capture_mode: rawRecord.captureMode,
  };

  const artifactPayload = artifacts.map((artifact) => ({
    id: artifact.id,
    merchant_id: artifact.merchantId,
    device_slug: artifact.deviceSlug,
    target_device_slug: artifact.targetDeviceSlug,
    condition: artifact.condition,
    source_url: artifact.sourceUrl,
    artifact_type: artifact.artifactType,
    payload: artifact.payload,
    captured_at: artifact.capturedAt,
    parser_version: artifact.parserVersion,
  }));

  const valuePayload = valueRecord
    ? {
        id: valueRecord.id,
        slug: valueRecord.slug,
        device_id: valueRecord.deviceId,
        merchant_id: valueRecord.merchantId,
        storage_variant: valueRecord.storageVariant,
        condition: valueRecord.condition,
        value_amount: valueRecord.valueAmount,
        currency: valueRecord.currency,
        value_type: valueRecord.valueType,
        source_name: valueRecord.sourceName,
        source_url: valueRecord.sourceUrl,
        raw_source_id: valueRecord.rawSourceId,
        retrieved_at: valueRecord.retrievedAt,
        stale_after_hours: valueRecord.staleAfterHours,
        verification_status: valueRecord.verificationStatus,
        confidence_score: valueRecord.confidenceScore,
        notes: valueRecord.notes,
        manual_override: valueRecord.manualOverride,
        active: valueRecord.active,
        target_device_slug: valueRecord.targetDeviceSlug,
        condition_notes: valueRecord.conditionNotes,
        exact_storage_match: valueRecord.exactStorageMatch,
        origin: valueRecord.origin,
        public_visible: valueRecord.publicVisible,
        quote_captured_at: valueRecord.quoteCapturedAt,
      }
    : null;

  const runPayload = {
    id: runRecord.id,
    merchant_id: runRecord.merchantId,
    device_slug: runRecord.deviceSlug,
    target_device_slug: runRecord.targetDeviceSlug,
    condition: runRecord.condition,
    status: runRecord.status,
    started_at: runRecord.startedAt,
    finished_at: runRecord.finishedAt,
    error: runRecord.error,
    artifact_id: runRecord.artifactId,
    value_record_id: runRecord.valueRecordId,
  };

  const rawInsert = await supabase.from("raw_ingest").upsert(rawPayload);
  if (rawInsert.error) throw rawInsert.error;

  if (artifactPayload.length) {
    const artifactInsert = await supabase.from("quote_artifacts").upsert(artifactPayload);
    if (artifactInsert.error) throw artifactInsert.error;
  }

  if (valuePayload) {
    const valueInsert = await supabase.from("value_records").upsert(valuePayload);
    if (valueInsert.error) throw valueInsert.error;
  }

  const runInsert = await supabase.from("quote_runs").upsert(runPayload);
  if (runInsert.error) throw runInsert.error;

  return {
    persisted: true,
    rawRecord,
    artifacts,
    valueRecord,
    runRecord,
  };
}