import { Redis } from "@upstash/redis";
import { serverEnv } from "./env.server";

let redis: Redis | null = null;

export const getRedis = () => {
  if (redis) return redis;
  if (!serverEnv.UPSTASH_REDIS_REST_URL || !serverEnv.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Upstash credentials are not configured");
  }

  redis = new Redis({
    url: serverEnv.UPSTASH_REDIS_REST_URL,
    token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
};

export const orderBookKey = (market: string, side: "buy" | "sell") =>
  `orderbook:${market}:${side}`;

export const balanceKey = (wallet: string) => `balance:${wallet}`;


