import { getRedis } from "./upstash";
import { publishRealtimeEvent } from "./realtime-bus";
import type { PriceTick, TradeFill } from "./types";
import { normalizeMarket } from "./market";

const tradesKey = (market: string) => `trades:${market}`;
const MAX_TRADES = 500;
const BUCKET_MS = 15 * 60 * 1000;

export const recordTrade = async (trade: TradeFill) => {
  const redis = getRedis();
  const key = tradesKey(trade.market);
  await redis.rpush(key, JSON.stringify(trade));
  await redis.ltrim(key, -MAX_TRADES, -1);
};

export const fetchRecentTrades = async (market?: string, limit = 200): Promise<TradeFill[]> => {
  const redis = getRedis();
  const key = tradesKey(normalizeMarket(market));
  const rows = await redis.lrange<string>(key, -limit, -1);
  return rows.map((row) => JSON.parse(row) as TradeFill);
};

export const buildCandlesFromTrades = (trades: TradeFill[]): PriceTick[] => {
  const buckets = new Map<number, TradeFill[]>();
  trades.forEach((trade) => {
    const bucket = Math.floor(trade.timestamp / BUCKET_MS) * BUCKET_MS;
    const list = buckets.get(bucket) ?? [];
    list.push(trade);
    buckets.set(bucket, list);
  });

  const candles: PriceTick[] = [];
  Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([timestamp, bucketTrades]) => {
      const sorted = bucketTrades.sort((a, b) => a.timestamp - b.timestamp);
      candles.push({
        id: `candle-${timestamp}`,
        open: sorted[0].price,
        close: sorted[sorted.length - 1].price,
        high: Math.max(...sorted.map((t) => t.price)),
        low: Math.min(...sorted.map((t) => t.price)),
        volume: sorted.reduce((acc, cur) => acc + cur.size, 0),
        timestamp,
      });
    });

  return candles;
};

export const recordTradeAndBroadcast = async (trade: TradeFill) => {
  await recordTrade(trade);
  const candles = buildCandlesFromTrades(await fetchRecentTrades(trade.market));
  const latest = candles.at(-1);
  if (latest) {
    publishRealtimeEvent({ type: "price", payload: { market: trade.market, tick: latest } });
  }
};

