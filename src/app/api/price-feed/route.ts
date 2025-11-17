import { NextRequest, NextResponse } from "next/server";
import { fetchRecentTicks } from "@/lib/prices";

export async function GET(request: NextRequest) {
  const market = request.nextUrl.searchParams.get("market") ?? undefined;
  const ticks = await fetchRecentTicks(market);
  return NextResponse.json(ticks);
}

