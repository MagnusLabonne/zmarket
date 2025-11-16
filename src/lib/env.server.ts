import { z } from "zod";

const serverSchema = z.object({
  SOLANA_RPC_URL: z.string().min(1).default(""),
  ZCASH_RPC_URL: z.string().min(1).default(""),
  UPSTASH_REDIS_REST_URL: z.string().min(1).default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).default(""),
  AMPLIFY_API_BASE_URL: z.string().optional(),
  AMPLIFY_API_KEY: z.string().optional(),
  CUSTODY_SOLANA_HOT_WALLET: z.string().optional(),
  CUSTODY_ZCASH_HOT_WALLET: z.string().optional(),
});

const parsedServer = serverSchema.safeParse({
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
  ZCASH_RPC_URL: process.env.ZCASH_RPC_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  AMPLIFY_API_BASE_URL: process.env.AMPLIFY_API_BASE_URL,
  AMPLIFY_API_KEY: process.env.AMPLIFY_API_KEY,
  CUSTODY_SOLANA_HOT_WALLET: process.env.CUSTODY_SOLANA_HOT_WALLET,
  CUSTODY_ZCASH_HOT_WALLET: process.env.CUSTODY_ZCASH_HOT_WALLET,
});

if (!parsedServer.success) {
  console.warn("[env] Missing server env vars", parsedServer.error.flatten().fieldErrors);
}

export const serverEnv = {
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL ?? "",
  ZCASH_RPC_URL: process.env.ZCASH_RPC_URL ?? "",
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  AMPLIFY_API_BASE_URL: process.env.AMPLIFY_API_BASE_URL ?? "",
  AMPLIFY_API_KEY: process.env.AMPLIFY_API_KEY ?? "",
  CUSTODY_SOLANA_HOT_WALLET: process.env.CUSTODY_SOLANA_HOT_WALLET ?? "",
  CUSTODY_ZCASH_HOT_WALLET: process.env.CUSTODY_ZCASH_HOT_WALLET ?? "",
};

export const isServerEnvReady =
  !!serverEnv.SOLANA_RPC_URL &&
  !!serverEnv.ZCASH_RPC_URL &&
  !!serverEnv.UPSTASH_REDIS_REST_URL &&
  !!serverEnv.UPSTASH_REDIS_REST_TOKEN;

