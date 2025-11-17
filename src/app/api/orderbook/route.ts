import { NextRequest, NextResponse } from "next/server";
import { simulateOrderBook } from "@/lib/custody-sim";

export async function GET(request: NextRequest) {
  const market = request.nextUrl.searchParams.get("market") ?? undefined;
  const book = await simulateOrderBook(market);
  return NextResponse.json(book);
}

