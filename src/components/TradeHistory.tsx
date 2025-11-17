"use client";

import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import type { PriceTick } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useTokenSelection } from "@/context/token-context";
import { useCallback } from "react";

type PriceEvent = {
  market: string;
  tick: PriceTick;
};

export const TradeHistory = () => {
  const { marketId, selectedToken } = useTokenSelection();
  const filter = useCallback((payload: PriceEvent) => payload.market === marketId, [marketId]);
  const { messages } = useRealtimeFeed<PriceEvent>("price", filter);
  const rows = [...messages].slice(-12).reverse();

  return (
    <div className="glass-panel p-4">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-3">Trade History</p>
      {rows.length === 0 && <p className="text-sm text-slate-400">No trades yet</p>}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-600/40">
        {rows.map(({ tick }) => (
          <div
            key={tick.id}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-sm"
          >
            <span className="text-slate-400">{new Date(tick.timestamp).toLocaleTimeString()}</span>
            <span className="font-semibold text-slate-100">{formatNumber(tick.close, 3)} USDC</span>
            <span className="text-slate-400">
              {formatNumber(tick.volume, 2)} {selectedToken?.tick.toUpperCase() ?? "ZRC"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

