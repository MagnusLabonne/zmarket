import { NextRequest, NextResponse } from "next/server";
import { simulateWithdraw } from "@/lib/custody-sim";

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body?.wallet || !body?.chain || !body?.amount) {
    return NextResponse.json({ error: "wallet, chain and amount required" }, { status: 400 });
  }

  const balance = await simulateWithdraw(body.wallet, body.chain, Number(body.amount));
  return NextResponse.json(balance);
}

