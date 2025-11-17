import { getRedis, balanceKey } from "./upstash";
import { BalanceSnapshot, OrderRequest, OrderSnapshot, TradeFill } from "./types";
import { getOrderBook, placeOrder, cancelOrder } from "./orderbook";
import { recordTradeAndBroadcast } from "./trades";
import { normalizeMarket } from "./market";

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
  const order = await placeOrder(input);
  const market = normalizeMarket(input.market);
  const trade: TradeFill = {
    id: crypto.randomUUID(),
    taker: input.wallet,
    maker: "internal-liquidity",
    price: input.price,
    size: input.size,
    side: input.side,
    createdAt: new Date().toISOString(),
    timestamp: Date.now(),
    market,
  };
  await recordTradeAndBroadcast(trade);
  return order;
};

export const simulateOrderCancel = async (orderId: string, side: "buy" | "sell", market?: string) => {
  return cancelOrder(orderId, side, market);
};

export const simulateOrderBook = async (market?: string) => {
  return getOrderBook(market);
};

export const simulateWalletOrders = async (wallet: string, market?: string): Promise<OrderSnapshot[]> => {
  const redis = getRedis();
  const ids = await redis.smembers<string>(`wallet-orders:${wallet}`);
  const payloads = await Promise.all(ids.map((id) => redis.get<string>(`order:${id}`)));
  return payloads
    .map((payload) => (payload ? (JSON.parse(payload) as OrderSnapshot) : null))
    .filter((order): order is OrderSnapshot => Boolean(order && (!market || order.market === market)));
};

