import { z } from "zod";
import { getRedis, orderBookKey, balanceKey } from "./upstash";
import { OrderRequest, OrderSnapshot, OrderBookLevel, TradeFill } from "./types";
import { publishRealtimeEvent } from "./realtime-bus";

const orderSchema = z.object({
  wallet: z.string().min(1),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["limit", "market"]),
  price: z.number().positive(),
  size: z.number().positive(),
});

const MARKET_ID = "ZRC-SOL";
const orderKey = (id: string) => `order:${id}`;
const walletOrdersKey = (wallet: string) => `wallet-orders:${wallet}`;

export const getOrderBook = async () => {
  const redis = getRedis();
  const [bids, asks] = await Promise.all([
    redis.zrange(orderBookKey(MARKET_ID, "buy"), 0, 49, { rev: true, withScores: true }),
    redis.zrange(orderBookKey(MARKET_ID, "sell"), 0, 49, { withScores: true }),
  ]);

  return {
    bids: await normalizeDepth(bids),
    asks: await normalizeDepth(asks),
  };
};

const normalizeDepth = async (entries: (string | number)[]): Promise<OrderBookLevel[]> => {
  const redis = getRedis();
  const rows: { id: string; price: number }[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    rows.push({ id: String(entries[i]), price: Number(entries[i + 1]) });
  }

  const orders = await Promise.all(
    rows.map(async (row) => {
      const payload = await redis.get<string>(orderKey(row.id));
      if (!payload) return null;
      const parsed = JSON.parse(payload) as OrderSnapshot;
      const remaining = Math.max(parsed.size - parsed.filledSize, 0);
      return { price: row.price, size: remaining };
    }),
  );

  const levels: Record<number, number> = {};
  for (const order of orders) {
    if (!order) continue;
    if (!levels[order.price]) levels[order.price] = 0;
    levels[order.price] += order.size;
  }

  const list = Object.entries(levels)
    .map(([price, size]) => ({ price: Number(price), size, total: size }))
    .sort((a, b) => b.price - a.price);

  let running = 0;
  return list.map((level) => {
    running += level.size;
    return { ...level, total: running };
  });
};

export const placeOrder = async (input: OrderRequest): Promise<OrderSnapshot> => {
  const data = orderSchema.parse(input);
  const redis = getRedis();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  await redis.zadd(orderBookKey(MARKET_ID, data.side), {
    score: data.price,
    member: id,
  });

  const balance = await redis.hget<string>(balanceKey(data.wallet), "payload");
  if (!balance) {
    await redis.hset(balanceKey(data.wallet), { payload: JSON.stringify(createDefaultBalance(data.wallet)) });
  }

  const snapshot: OrderSnapshot = {
    ...data,
    id,
    status: "open",
    filledSize: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await redis.set(orderKey(id), JSON.stringify(snapshot));
  await redis.sadd(walletOrdersKey(data.wallet), id);
  publishRealtimeEvent({ type: "orderbook", payload: await getOrderBook() });
  return snapshot;
};

export const cancelOrder = async (orderId: string, side: "buy" | "sell") => {
  const redis = getRedis();
  const payload = await redis.get<string>(orderKey(orderId));
  if (payload) {
    const order = JSON.parse(payload) as OrderSnapshot;
    await redis.srem(walletOrdersKey(order.wallet), orderId);
  }
  await redis.del(orderKey(orderId));
  await redis.zrem(orderBookKey(MARKET_ID, side), orderId);
};

export const simulateMatch = async (): Promise<TradeFill | null> => {
  const redis = getRedis();
  const [bids, asks] = await Promise.all([
    redis.zrange(orderBookKey(MARKET_ID, "buy"), 0, 0, { rev: true, withScores: true }),
    redis.zrange(orderBookKey(MARKET_ID, "sell"), 0, 0, { withScores: true }),
  ]);

  if (!bids.length || !asks.length) return null;
  const bestBid = { id: String(bids[0]), price: Number(bids[1]) };
  const bestAsk = { id: String(asks[0]), price: Number(asks[1]) };

  if (bestBid.price < bestAsk.price) return null;

  const [bidPayload, askPayload] = await Promise.all([
    redis.get<string>(orderKey(bestBid.id)),
    redis.get<string>(orderKey(bestAsk.id)),
  ]);
  if (!bidPayload || !askPayload) return null;

  const bidOrder = JSON.parse(bidPayload) as OrderSnapshot;
  const askOrder = JSON.parse(askPayload) as OrderSnapshot;

  const bidRemaining = Math.max(bidOrder.size - bidOrder.filledSize, 0);
  const askRemaining = Math.max(askOrder.size - askOrder.filledSize, 0);
  const size = Math.min(bidRemaining, askRemaining);
  if (size <= 0) return null;

  const price = (bestBid.price + bestAsk.price) / 2;
  bidOrder.filledSize += size;
  askOrder.filledSize += size;

  bidOrder.status = bidOrder.filledSize >= bidOrder.size ? "filled" : "partial";
  askOrder.status = askOrder.filledSize >= askOrder.size ? "filled" : "partial";
  bidOrder.updatedAt = new Date().toISOString();
  askOrder.updatedAt = bidOrder.updatedAt;

  await Promise.all([
    redis.set(orderKey(bidOrder.id), JSON.stringify(bidOrder)),
    redis.set(orderKey(askOrder.id), JSON.stringify(askOrder)),
  ]);

  if (bidOrder.status === "filled") {
    await redis.zrem(orderBookKey(MARKET_ID, "buy"), bidOrder.id);
    await redis.srem(walletOrdersKey(bidOrder.wallet), bidOrder.id);
  }
  if (askOrder.status === "filled") {
    await redis.zrem(orderBookKey(MARKET_ID, "sell"), askOrder.id);
    await redis.srem(walletOrdersKey(askOrder.wallet), askOrder.id);
  }

  publishRealtimeEvent({ type: "orderbook", payload: await getOrderBook() });

  const trade: TradeFill = {
    id: crypto.randomUUID(),
    taker: bidOrder.wallet,
    maker: askOrder.wallet,
    price,
    size,
    side: "buy",
    createdAt: new Date().toISOString(),
  };
  return trade;
};

const createDefaultBalance = (wallet: string) => ({
  wallet,
  usdc: 0,
  zrc: 0,
  updatedAt: new Date().toISOString(),
});

