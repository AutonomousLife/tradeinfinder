import type { Condition, ValueType } from "@/lib/schema";

export type QuotePreview = {
  merchantSlug: string;
  deviceSlug: string;
  condition: Condition;
  targetDeviceSlug?: string | null;
  valueAmount: number | null;
  valueType: ValueType | null;
  confidence: number;
  label: string;
  explanation: string;
  matchedText?: string;
};

export type QuoteArtifactCapture = {
  id: string;
  artifactType: "html" | "json" | "screenshot" | "manual_note";
  sourceUrl: string;
  payload: string;
  capturedAt: string;
  parserVersion: string;
};

export type CollectorExecutionInput = {
  merchantSlug: string;
  deviceSlug: string;
  deviceLabel: string;
  condition: Condition;
  targetDeviceSlug?: string | null;
  targetDeviceLabel?: string | null;
  userAgent?: string;
};

export type CollectorExecutionResult = {
  merchantSlug: string;
  deviceSlug: string;
  condition: Condition;
  targetDeviceSlug?: string | null;
  status: "captured" | "failed";
  startedAt: string;
  finishedAt: string;
  sourceUrl: string;
  logs: string[];
  previews: QuotePreview[];
  artifacts: QuoteArtifactCapture[];
  error?: string;
};

export type QuoteCollector = {
  merchantSlug: string;
  run: (input: CollectorExecutionInput) => Promise<CollectorExecutionResult>;
};