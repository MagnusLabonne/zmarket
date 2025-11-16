import { NextRequest, NextResponse } from "next/server";
import { syncCustodyBalance } from "@/lib/amplify-client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  const balance = await syncCustodyBalance(body.wallet);
  return NextResponse.json(balance);
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }
  const balance = await syncCustodyBalance(wallet);
  return NextResponse.json(balance);
}

