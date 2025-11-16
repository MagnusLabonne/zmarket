"use client";

import { useMemo } from "react";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import type { PriceTick } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const MarketStats = () => {
  const { orderbook } = useOrderBook();
  const { messages } = useRealtimeFeed<PriceTick>("price");

  const lastPrice = messages.at(-1)?.close ?? 137.5;
  const depth = useMemo(() => {
    if (!orderbook) return { bid: 0, ask: 0 };
    return {
      bid: orderbook.bids.slice(0, 5).reduce((acc, cur) => acc + cur.size, 0),
      ask: orderbook.asks.slice(0, 5).reduce((acc, cur) => acc + cur.size, 0),
    };
  }, [orderbook]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Metric label="Senaste pris" value={formatCurrency(lastPrice)} badge="15m candle" />
      <Metric label="Bid depth" value={`${formatNumber(depth.bid, 2)} SOL`} badge="Top 5" />
      <Metric label="Ask depth" value={`${formatNumber(depth.ask, 2)} SOL`} badge="Top 5" />
    </div>
  );
};

const Metric = ({ label, value, badge }: { label: string; value: string; badge: string }) => (
  <div className="glass-panel p-4">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="text-2xl font-semibold text-slate-50 mt-2">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{badge}</p>
  </div>
);

