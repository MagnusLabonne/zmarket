import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const orderBookKey = (market: string, side: "buy" | "sell") => `orderbook:${market}:${side}`;
const orderKey = (id: string) => `order:${id}`;

export const handler = async () => {
  const [bid] = await redis.zrange(orderBookKey("ZRC-SOL", "buy"), 0, 0, {
    rev: true,
    withScores: true,
  });
  const [ask] = await redis.zrange(orderBookKey("ZRC-SOL", "sell"), 0, 0, {
    withScores: true,
  });

  if (!bid || !ask) {
    return { statusCode: 200, body: JSON.stringify({ matched: false }) };
  }

  const [bidId, bidPrice] = bid as [string, number];
  const [askId, askPrice] = ask as [string, number];
  if (Number(bidPrice) < Number(askPrice)) {
    return { statusCode: 200, body: JSON.stringify({ matched: false }) };
  }

  const [bidOrder, askOrder] = await Promise.all([
    redis.get<string>(orderKey(bidId)),
    redis.get<string>(orderKey(askId)),
  ]);
  if (!bidOrder || !askOrder) {
    return { statusCode: 200, body: JSON.stringify({ matched: false }) };
  }

  const bidParsed = JSON.parse(bidOrder);
  const askParsed = JSON.parse(askOrder);
  const size = Math.min(bidParsed.size, askParsed.size);
  bidParsed.status = "filled";
  askParsed.status = "filled";

  await Promise.all([
    redis.set(orderKey(bidId), JSON.stringify(bidParsed)),
    redis.set(orderKey(askId), JSON.stringify(askParsed)),
    redis.zrem(orderBookKey("ZRC-SOL", "buy"), bidId),
    redis.zrem(orderBookKey("ZRC-SOL", "sell"), askId),
  ]);

  return { statusCode: 200, body: JSON.stringify({ matched: true, size }) };
};

