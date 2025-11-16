import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const balanceKey = (wallet: string) => `balance:${wallet}`;

type LambdaEvent = { body?: string | null };

export const handler = async (event: LambdaEvent) => {
  const payload = JSON.parse(event.body ?? "{}");
  if (!payload.wallet) {
    return { statusCode: 400, body: JSON.stringify({ error: "wallet required" }) };
  }

  const snapshot = await redis.hget<string>(balanceKey(payload.wallet), "payload");
  if (snapshot) {
    return { statusCode: 200, body: snapshot };
  }

  const empty = {
    wallet: payload.wallet,
    usdc: 0,
    zrc: 0,
    updatedAt: new Date().toISOString(),
  };
  await redis.hset(balanceKey(payload.wallet), { payload: JSON.stringify(empty) });
  return { statusCode: 200, body: JSON.stringify(empty) };
};

