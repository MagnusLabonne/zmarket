import type { PriceTick } from "./types";
import { buildCandlesFromTrades, fetchRecentTrades } from "./trades";

export const fetchRecentTicks = async (market?: string): Promise<PriceTick[]> => {
  const trades = await fetchRecentTrades(market);
  const candles = buildCandlesFromTrades(trades);

  if (!candles.length) {
    return seedTicks();
  }

  return candles;
};

const seedTicks = (): PriceTick[] => {
  const now = Date.now();
  return Array.from({ length: 15 }).map((_, idx) => {
    const base = 130 + Math.sin(idx / 2) * 3;
    return {
      id: `seed-${idx}`,
      open: base - 0.3,
      high: base + 0.6,
      low: base - 0.6,
      close: base + 0.2,
      volume: 50 + idx * 5,
      timestamp: now - (15 - idx) * 15 * 60 * 1000,
    };
  });
};

