import { NextResponse } from "next/server";
import { fetchRecentTicks } from "@/lib/prices";

export async function GET() {
  const ticks = await fetchRecentTicks();
  return NextResponse.json(ticks);
}

