import { NextResponse } from "next/server";

import { buildTradeInFinder } from "@/lib/engine";

function parseCondition(value: string | null): "good" | "damaged" | "poor" {
  return value === "damaged" || value === "poor" ? value : "good";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return NextResponse.json(
    buildTradeInFinder({
      currentDeviceSlug: searchParams.get("currentDevice") ?? "iphone-13-128",
      targetDeviceSlug: searchParams.get("targetDevice") ?? undefined,
      condition: parseCondition(searchParams.get("condition")),
      merchantSlug: searchParams.get("merchant") ?? undefined,
      valueType: (searchParams.get("valueType") as "all" | "instant_credit" | "purchase_credit" | "store_credit" | "gift_card" | null) ?? "all",
      sortBy: (searchParams.get("sortBy") as "highest-value" | "easiest" | "best-upgrade" | "highest-confidence" | "newest" | null) ?? "highest-value",
    }),
  );
}

