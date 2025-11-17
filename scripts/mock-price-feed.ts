#!/usr/bin/env tsx
import { randomUUID } from "node:crypto";
import { recordTradeAndBroadcast } from "../src/lib/trades";
import { normalizeMarket } from "../src/lib/market";

const MARKET = normalizeMarket(process.argv[2]);

const loop = async () => {
  const base = 135 + Math.random() * 4;
  await recordTradeAndBroadcast({
    id: randomUUID(),
    taker: "mock-wallet",
    maker: "internal",
    price: base + (Math.random() - 0.5),
    size: 1 + Math.random(),
    side: Math.random() > 0.5 ? "buy" : "sell",
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
    market: MARKET,
  });
  console.log("trade stored");
};

loop()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));

