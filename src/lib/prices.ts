import { getRedis } from "./upstash";
import type { PriceTick } from "./types";
import { publishRealtimeEvent } from "./realtime-bus";

const PRICE_KEY = "price:ZRC-SOL";

export const fetchRecentTicks = async (limit = 200): Promise<PriceTick[]> => {
  const redis = getRedis();
  const entries = await redis.lrange<string>(PRICE_KEY, -limit, -1);
  if (!entries.length) {
    return seedTicks();
  }
  return entries.map((entry) => JSON.parse(entry) as PriceTick);
};

export const pushTick = async (tick: PriceTick) => {
  const redis = getRedis();
  await redis.rpush(PRICE_KEY, JSON.stringify(tick));
  await redis.ltrim(PRICE_KEY, -500, -1);
  publishRealtimeEvent({ type: "price", payload: tick });
};

const seedTicks = () => {
  const now = Date.now();
  return Array.from({ length: 60 }).map((_, idx) => {
    const base = 130 + Math.sin(idx / 3) * 5;
    return {
      id: crypto.randomUUID(),
      open: base - 0.5,
      high: base + 1,
      low: base - 1,
      close: base + 0.25,
      volume: 100 + idx * 2,
      timestamp: now - (60 - idx) * 60 * 1000,
    };
  });
};

