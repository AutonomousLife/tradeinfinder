import { devices } from "@/lib/seed-data";
import { bestBuyCollector } from "@/lib/quote-collectors/best-buy";
import type { CollectorExecutionInput, CollectorExecutionResult, QuoteCollector } from "@/lib/quote-collectors/types";

const collectors: QuoteCollector[] = [bestBuyCollector];

function getCollector(merchantSlug: string) {
  return collectors.find((collector) => collector.merchantSlug === merchantSlug) ?? null;
}

export function listCollectors() {
  return collectors.map((collector) => collector.merchantSlug);
}

export async function runCollector(input: CollectorExecutionInput): Promise<CollectorExecutionResult> {
  const collector = getCollector(input.merchantSlug);
  if (!collector) {
    return {
      merchantSlug: input.merchantSlug,
      deviceSlug: input.deviceSlug,
      condition: input.condition,
      targetDeviceSlug: input.targetDeviceSlug ?? null,
      status: "failed",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      sourceUrl: "",
      logs: [],
      previews: [],
      artifacts: [],
      error: `No live collector is implemented for ${input.merchantSlug}.`,
    };
  }

  return collector.run(input);
}

export function buildCollectorInput(args: {
  merchantSlug: string;
  deviceSlug: string;
  condition: CollectorExecutionInput["condition"];
  targetDeviceSlug?: string | null;
}) {
  const device = devices.find((entry) => entry.slug === args.deviceSlug);
  const target = args.targetDeviceSlug ? devices.find((entry) => entry.slug === args.targetDeviceSlug) : null;

  return {
    merchantSlug: args.merchantSlug,
    deviceSlug: args.deviceSlug,
    deviceLabel: device?.model ?? args.deviceSlug,
    condition: args.condition,
    targetDeviceSlug: args.targetDeviceSlug ?? null,
    targetDeviceLabel: target?.model ?? null,
  } satisfies CollectorExecutionInput;
}