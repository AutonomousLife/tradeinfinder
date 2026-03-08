import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { getTopQuoteRefreshTargets } from "@/lib/live-quotes";
import { persistCollectorResult } from "@/lib/quote-persistence";
import { buildCollectorInput, runCollector } from "@/lib/quote-collectors";

const refreshSchema = z.object({
  merchantSlug: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(20).optional(),
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

  const body = await request.json().catch(() => ({}));
  const parsed = refreshSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid refresh payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  const limit = parsed.data.limit ?? 6;
  const targets = getTopQuoteRefreshTargets(limit).filter((target) => !parsed.data.merchantSlug || target.merchantSlug === parsed.data.merchantSlug);

  const results = [] as Array<{ target: (typeof targets)[number]; status: string; persisted: boolean; error?: string | null }>;

  for (const target of targets) {
    const result = await runCollector(
      buildCollectorInput({
        merchantSlug: target.merchantSlug,
        deviceSlug: target.deviceSlug,
        condition: target.condition,
        targetDeviceSlug: target.targetDeviceSlug,
      }),
    );

    const persistence = await persistCollectorResult(result).catch((error) => ({
      persisted: false,
      reason: error instanceof Error ? error.message : "Unknown persistence failure",
    }));

    results.push({
      target,
      status: result.status,
      persisted: Boolean((persistence as { persisted?: boolean }).persisted),
      error: result.error ?? ("reason" in persistence ? persistence.reason : null),
    });
  }

  return NextResponse.json({
    refreshedAt: new Date().toISOString(),
    count: results.length,
    results,
  });
}