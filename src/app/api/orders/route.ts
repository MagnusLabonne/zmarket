import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cancelCustodyOrder, submitCustodyOrder } from "@/lib/amplify-client";
import { simulateWalletOrders } from "@/lib/custody-sim";

const orderSchema = z.object({
  wallet: z.string().min(1),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["limit", "market"]),
  price: z.number().positive(),
  size: z.number().positive(),
  market: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const json = await request.json();
  const payload = orderSchema.safeParse(json);
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 422 });
  }
  const order = await submitCustodyOrder(payload.data);
  return NextResponse.json(order);
}

export async function DELETE(request: NextRequest) {
  const json = await request.json();
  if (!json?.orderId || !json?.side) {
    return NextResponse.json({ error: "orderId and side required" }, { status: 400 });
  }
  const result = await cancelCustodyOrder(json.orderId, json.side, json.market);
  return NextResponse.json(result);
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  const market = request.nextUrl.searchParams.get("market") ?? undefined;
  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }
  const orders = await simulateWalletOrders(wallet, market);
  return NextResponse.json(orders);
}

