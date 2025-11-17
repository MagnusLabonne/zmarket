"use client";

import { useMemo, useCallback } from "react";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import type { PriceTick } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useTokenSelection } from "@/context/token-context";

type PriceEvent = {
  market: string;
  tick: PriceTick;
};

export const MarketStats = () => {
  const { marketId } = useTokenSelection();
  const { orderbook } = useOrderBook(marketId);
  const priceFilter = useCallback((payload: PriceEvent) => payload.market === marketId, [marketId]);
  const { messages } = useRealtimeFeed<PriceEvent>("price", priceFilter);

  const lastPrice = messages.at(-1)?.tick.close ?? 0;
  const depth = useMemo(() => {
    if (!orderbook) return { bid: 0, ask: 0 };
    return {
      bid: orderbook.bids.slice(0, 5).reduce((acc, cur) => acc + cur.size, 0),
      ask: orderbook.asks.slice(0, 5).reduce((acc, cur) => acc + cur.size, 0),
    };
  }, [orderbook]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Metric label="Last Price" value={formatCurrency(lastPrice)} badge="15 min" />
      <Metric label="Bid Depth" value={`${formatNumber(depth.bid, 2)} SOL`} badge="Top 5" />
      <Metric label="Ask Depth" value={`${formatNumber(depth.ask, 2)} SOL`} badge="Top 5" />
    </div>
  );
};

const Metric = ({ label, value, badge }: { label: string; value: string; badge: string }) => (
  <div className="glass-panel p-3">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="text-2xl font-semibold text-slate-50 mt-2">{value}</p>
    <p className="text-xs text-slate-500 mt-1">{badge}</p>
  </div>
);

