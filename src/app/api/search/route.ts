import { NextResponse } from "next/server";

import { getSearchSuggestions } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  return NextResponse.json({
    query,
    suggestions: getSearchSuggestions(query),
    generatedAt: new Date().toISOString(),
  });
}
