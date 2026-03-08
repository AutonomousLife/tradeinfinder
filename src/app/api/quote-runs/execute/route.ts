import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { buildQuoteRequestPlan } from "@/lib/live-quotes";
import { persistCollectorResult } from "@/lib/quote-persistence";
import { buildCollectorInput, runCollector } from "@/lib/quote-collectors";

const executeSchema = z.object({
  merchantSlug: z.string().min(1),
  deviceSlug: z.string().min(1),
  condition: z.enum(["good", "damaged", "poor"]),
  targetDeviceSlug: z.string().min(1).optional().nullable(),
});

function isAuthorized(request: Request) {
  if (!env.CRON_SECRET) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${env.CRON_SECRET}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = executeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid execute payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const plan = buildQuoteRequestPlan(parsed.data);
  if (!plan.supported) {
    return NextResponse.json({ accepted: false, plan, error: plan.reason }, { status: 422 });
  }

  const result = await runCollector(
    buildCollectorInput({
      merchantSlug: parsed.data.merchantSlug,
      deviceSlug: parsed.data.deviceSlug,
      condition: parsed.data.condition,
      targetDeviceSlug: parsed.data.targetDeviceSlug ?? null,
    }),
  );

  const persistence = await persistCollectorResult(result).catch((error) => ({
    persisted: false,
    reason: error instanceof Error ? error.message : "Unknown persistence failure",
  }));

  return NextResponse.json({
    accepted: result.status === "captured",
    plan,
    result,
    persistence,
  });
}