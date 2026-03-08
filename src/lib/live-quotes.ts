import { env } from "@/lib/env";
import { devices, merchants, quoteArtifacts, quoteJobs, quoteRuns, rawIngestRecords, valueRecords } from "@/lib/seed-data";
import type { Condition, QuoteArtifact, QuoteRun, Store, ValueRecord } from "@/lib/schema";

export type QuoteCollectorId = "apple" | "samsung" | "best-buy" | "amazon" | "google-store";

export type QuoteCollectorPlan = {
  merchant: Store;
  collectorId: QuoteCollectorId;
  strategy: "browser_flow" | "fetch_json" | "html_snapshot";
  quoteUrl: string;
  supportsTargetDevice: boolean;
  notes: string[];
};

export type QuoteRequestInput = {
  merchantSlug: string;
  deviceSlug: string;
  condition: Condition;
  targetDeviceSlug?: string | null;
};

export type QuoteRequestPlan = {
  supported: boolean;
  mode: "worker" | "local_stub";
  request: QuoteRequestInput & {
    workerUrl?: string;
    runnerKey: string;
  };
  collector?: QuoteCollectorPlan;
  reason?: string;
};

const COLLECTOR_PLANS: Record<QuoteCollectorId, Omit<QuoteCollectorPlan, "merchant">> = {
  apple: {
    collectorId: "apple",
    strategy: "browser_flow",
    quoteUrl: "https://www.apple.com/shop/trade-in",
    supportsTargetDevice: true,
    notes: [
      "Apple values should come from the public Apple Trade In flow or checkout trade-in flow.",
      "Capture returned quote text plus a raw HTML snapshot before normalizing.",
    ],
  },
  samsung: {
    collectorId: "samsung",
    strategy: "browser_flow",
    quoteUrl: "https://www.samsung.com/us/trade-in/",
    supportsTargetDevice: true,
    notes: [
      "Samsung values belong to the trade-in or checkout flow, not a seeded grid.",
      "Collector should preserve the exact target-device context when present.",
    ],
  },
  "best-buy": {
    collectorId: "best-buy",
    strategy: "browser_flow",
    quoteUrl: "https://www.bestbuy.com/trade-in",
    supportsTargetDevice: false,
    notes: [
      "Best Buy does not expose a public trade-in API in this project.",
      "Collector should automate the live estimator flow and store the returned quote evidence.",
    ],
  },
  amazon: {
    collectorId: "amazon",
    strategy: "html_snapshot",
    quoteUrl: "https://www.amazon.com/b?node=tradein",
    supportsTargetDevice: false,
    notes: [
      "Amazon Trade-In should be treated as a gift-card quote flow.",
      "If no reliable quote can be captured, keep it out of public ranking.",
    ],
  },
  "google-store": {
    collectorId: "google-store",
    strategy: "browser_flow",
    quoteUrl: "https://store.google.com/us/magazine/trade_in",
    supportsTargetDevice: true,
    notes: [
      "Google Store trade-in value depends on the trade-in flow and often the target device.",
      "Capture the flow output and artifact before promoting any quote publicly.",
    ],
  },
};

function getMerchant(slug: string) {
  return merchants.find((merchant) => merchant.slug === slug);
}

function getDevice(slug: string) {
  return devices.find((device) => device.slug === slug);
}

export function getCollectorPlan(merchantSlug: string): QuoteCollectorPlan | null {
  const merchant = getMerchant(merchantSlug);
  if (!merchant) return null;

  const plan = COLLECTOR_PLANS[merchantSlug as QuoteCollectorId];
  if (!plan) return null;

  return {
    merchant,
    ...plan,
  };
}

export function buildQuoteRequestPlan(input: QuoteRequestInput): QuoteRequestPlan {
  const merchant = getMerchant(input.merchantSlug);
  const device = getDevice(input.deviceSlug);
  if (!merchant || !device) {
    return {
      supported: false,
      mode: "local_stub",
      request: {
        ...input,
        runnerKey: `${input.merchantSlug}:${input.deviceSlug}:${input.condition}:${input.targetDeviceSlug ?? "none"}`,
      },
      reason: "Unknown merchant or device slug.",
    };
  }

  const collector = getCollectorPlan(input.merchantSlug);
  if (!collector) {
    return {
      supported: false,
      mode: "local_stub",
      request: {
        ...input,
        runnerKey: `${merchant.slug}:${device.slug}:${input.condition}:${input.targetDeviceSlug ?? "none"}`,
      },
      reason: "No collector has been defined for this merchant yet.",
    };
  }

  if (input.targetDeviceSlug && !collector.supportsTargetDevice) {
    return {
      supported: false,
      mode: "local_stub",
      request: {
        ...input,
        runnerKey: `${merchant.slug}:${device.slug}:${input.condition}:${input.targetDeviceSlug ?? "none"}`,
      },
      collector,
      reason: `${merchant.name} collector does not use target-device context yet.`,
    };
  }

  return {
    supported: true,
    mode: env.ENABLE_LIVE_QUOTES && env.QUOTE_WORKER_URL ? "worker" : "local_stub",
    request: {
      ...input,
      workerUrl: env.QUOTE_WORKER_URL,
      runnerKey: `${merchant.slug}:${device.slug}:${input.condition}:${input.targetDeviceSlug ?? "none"}`,
    },
    collector,
    reason: env.ENABLE_LIVE_QUOTES && env.QUOTE_WORKER_URL ? undefined : "Quote worker is not configured yet.",
  };
}

export function getLiveQuoteAdminSnapshot() {
  const publicQuotes = valueRecords.filter((value) => value.publicVisible);
  const seededResearch = valueRecords.filter((value) => !value.publicVisible && value.valueType !== "resale_estimate");

  return {
    workerEnabled: Boolean(env.ENABLE_LIVE_QUOTES && env.QUOTE_WORKER_URL),
    workerUrl: env.QUOTE_WORKER_URL ?? null,
    publicQuoteCount: publicQuotes.length,
    seededResearchCount: seededResearch.length,
    quoteJobs,
    quoteRuns,
    quoteArtifacts,
    rawSnapshots: rawIngestRecords.length,
  };
}

export function listCollectorPlans() {
  return merchants
    .map((merchant) => getCollectorPlan(merchant.slug))
    .filter((plan): plan is QuoteCollectorPlan => Boolean(plan));
}

export function findLatestRun(runnerKey: string): QuoteRun | null {
  const [merchantId, deviceSlug, condition, targetDeviceSlug] = runnerKey.split(":");
  return (
    [...quoteRuns]
      .filter(
        (run) =>
          run.merchantId === merchantId &&
          run.deviceSlug === deviceSlug &&
          run.condition === condition &&
          (run.targetDeviceSlug ?? "none") === (targetDeviceSlug ?? "none"),
      )
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0] ?? null
  );
}

export function findArtifactsForRun(run: QuoteRun): QuoteArtifact[] {
  if (!run.artifactId) return [];
  return quoteArtifacts.filter((artifact) => artifact.id === run.artifactId);
}

export function getPublicQuoteRecordsForMerchant(merchantSlug: string): ValueRecord[] {
  const merchant = getMerchant(merchantSlug);
  if (!merchant) return [];
  return valueRecords.filter((value) => value.merchantId === merchant.id && value.publicVisible);
}

export function getQuoteWorkerHeaders() {
  return env.QUOTE_WORKER_TOKEN ? { Authorization: `Bearer ${env.QUOTE_WORKER_TOKEN}` } : {};
}