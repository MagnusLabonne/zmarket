import { NextResponse } from "next/server";
import { simulateOrderBook } from "@/lib/custody-sim";

export async function GET() {
  const book = await simulateOrderBook();
  return NextResponse.json(book);
}

