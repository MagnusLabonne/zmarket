import { Redis } from "@upstash/redis";

type OrderSide = "buy" | "sell";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const orderBookKey = (market: string, side: OrderSide) => `orderbook:${market}:${side}`;
const orderKey = (id: string) => `order:${id}`;

type LambdaEvent = { httpMethod?: string; body?: string | null };

export const handler = async (event: LambdaEvent) => {
  if (event.httpMethod === "DELETE") {
    const payload = JSON.parse(event.body ?? "{}");
    await redis.del(orderKey(payload.orderId));
    await redis.zrem(orderBookKey("ZRC-SOL", payload.side), payload.orderId);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  const payload = JSON.parse(event.body ?? "{}");
  const id = crypto.randomUUID();
  await redis.zadd(orderBookKey("ZRC-SOL", payload.side), {
    score: payload.price,
    member: id,
  });
  await redis.set(
    orderKey(id),
    JSON.stringify({
      ...payload,
      id,
      status: "open",
      filledSize: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  );
  return { statusCode: 200, body: JSON.stringify({ id }) };
};

