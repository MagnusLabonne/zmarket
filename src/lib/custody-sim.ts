import { getRedis, balanceKey } from "./upstash";
import { BalanceSnapshot, OrderRequest, OrderSnapshot } from "./types";
import { getOrderBook, placeOrder, cancelOrder } from "./orderbook";

export const simulateBalanceFetch = async (wallet: string): Promise<BalanceSnapshot> => {
  const redis = getRedis();
  const payload = await redis.hget<string>(balanceKey(wallet), "payload");
  if (payload) return JSON.parse(payload) as BalanceSnapshot;

  const snapshot: BalanceSnapshot = {
    wallet,
    usdc: 0,
    zrc: 0,
    updatedAt: new Date().toISOString(),
  };
  await redis.hset(balanceKey(wallet), { payload: JSON.stringify(snapshot) });
  return snapshot;
};

export const simulateDeposit = async (wallet: string, chain: "solana" | "zcash", amount: number) => {
  const redis = getRedis();
  const current = await simulateBalanceFetch(wallet);
  const updated: BalanceSnapshot =
    chain === "solana"
      ? { ...current, usdc: current.usdc + amount, updatedAt: new Date().toISOString() }
      : { ...current, zrc: current.zrc + amount, updatedAt: new Date().toISOString() };

  await redis.hset(balanceKey(wallet), { payload: JSON.stringify(updated) });
  return updated;
};

export const simulateWithdraw = async (wallet: string, chain: "solana" | "zcash", amount: number) => {
  const redis = getRedis();
  const current = await simulateBalanceFetch(wallet);
  const updated: BalanceSnapshot =
    chain === "solana"
      ? { ...current, usdc: Math.max(current.usdc - amount, 0), updatedAt: new Date().toISOString() }
      : { ...current, zrc: Math.max(current.zrc - amount, 0), updatedAt: new Date().toISOString() };

  await redis.hset(balanceKey(wallet), { payload: JSON.stringify(updated) });
  return updated;
};

export const simulateOrderPlacement = async (input: OrderRequest) => {
  return placeOrder(input);
};

export const simulateOrderCancel = async (orderId: string, side: "buy" | "sell") => {
  return cancelOrder(orderId, side);
};

export const simulateOrderBook = async () => {
  return getOrderBook();
};

export const simulateWalletOrders = async (wallet: string): Promise<OrderSnapshot[]> => {
  const redis = getRedis();
  const ids = await redis.smembers<string>(`wallet-orders:${wallet}`);
  const payloads = await Promise.all(ids.map((id) => redis.get<string>(`order:${id}`)));
  return payloads
    .map((payload) => (payload ? (JSON.parse(payload) as OrderSnapshot) : null))
    .filter(Boolean) as OrderSnapshot[];
};

