import { NextResponse } from "next/server";

import { buildTradeInFinder } from "@/lib/engine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return NextResponse.json(
    buildTradeInFinder({
      currentDeviceSlug: searchParams.get("currentDevice") ?? "iphone-13-128",
      targetDeviceSlug: searchParams.get("targetDevice") ?? "iphone-16-pro-256",
      condition: searchParams.get("condition") ?? "good",
      merchantSlug: searchParams.get("merchant") ?? undefined,
    }),
  );
}
