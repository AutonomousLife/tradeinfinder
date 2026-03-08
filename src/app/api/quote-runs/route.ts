import { NextResponse } from "next/server";
import { z } from "zod";

import { buildQuoteRequestPlan, findLatestRun, getLiveQuoteAdminSnapshot, listCollectorPlans } from "@/lib/live-quotes";

const requestSchema = z.object({
  merchantSlug: z.string().min(1),
  deviceSlug: z.string().min(1),
  condition: z.enum(["good", "damaged", "poor"]),
  targetDeviceSlug: z.string().min(1).optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runnerKey = searchParams.get("runnerKey");

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    snapshot: getLiveQuoteAdminSnapshot(),
    collectors: listCollectorPlans(),
    latestRun: runnerKey ? findLatestRun(runnerKey) : null,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote run request", issues: parsed.error.flatten() }, { status: 400 });
  }

  const plan = buildQuoteRequestPlan(parsed.data);
  return NextResponse.json(
    {
      accepted: plan.supported,
      plan,
      latestRun: findLatestRun(plan.request.runnerKey),
      message: plan.supported
        ? plan.mode === "worker"
          ? "Quote request is ready to send to the worker."
          : "Quote collector exists, but the worker is not configured yet."
        : plan.reason,
    },
    { status: plan.supported ? 200 : 422 },
  );
}