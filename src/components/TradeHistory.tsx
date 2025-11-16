"use client";

import { useRealtimeFeed } from "@/hooks/useRealtimeFeed";
import type { PriceTick } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export const TradeHistory = () => {
  const { messages } = useRealtimeFeed<PriceTick>("price");
  const rows = [...messages].slice(-12).reverse();

  return (
    <div className="glass-panel p-5">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-4">Handelshistorik</p>
      {rows.length === 0 && <p className="text-sm text-slate-400">No trades yet</p>}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600/40">
        {rows.map((tick) => (
          <div
            key={tick.id}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-sm"
          >
            <span className="text-slate-400">{new Date(tick.timestamp).toLocaleTimeString()}</span>
            <span className="font-semibold text-slate-100">{formatNumber(tick.close, 3)} USDC</span>
            <span className="text-slate-400">{formatNumber(tick.volume, 2)} ZRC</span>
          </div>
        ))}
      </div>
    </div>
  );
};

