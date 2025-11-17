"use client";

import { formatNumber } from "@/lib/utils";
import { useOrderBook } from "@/hooks/useOrderBook";
import { useTokenSelection } from "@/context/token-context";

export const OrderBook = () => {
  const { marketId } = useTokenSelection();
  const { orderbook } = useOrderBook(marketId);

  return (
    <div className="glass-panel p-3 h-[360px] flex flex-col">
      <div className="flex justify-between text-xs uppercase tracking-[0.3em] text-slate-500 mb-4">
        <span>Bids</span>
        <span>Asks</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm flex-1 overflow-hidden">
        <div className="flex flex-col gap-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600/40">
          {orderbook?.bids.map((level) => (
            <div key={`bid-${level.price}`} className="flex justify-between text-emerald-300/90">
              <span>{formatNumber(level.price, 2)}</span>
              <span>{formatNumber(level.size, 3)} SOL</span>
            </div>
          ))}
          {!orderbook?.bids?.length && (
            <p className="text-xs text-slate-500 text-center py-4">No bids yet</p>
          )}
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto pl-2 scrollbar-thin scrollbar-thumb-slate-600/40">
          {orderbook?.asks.map((level) => (
            <div key={`ask-${level.price}`} className="flex justify-between text-rose-300/90">
              <span>{formatNumber(level.price, 2)}</span>
              <span>{formatNumber(level.size, 3)} SOL</span>
            </div>
          ))}
          {!orderbook?.asks?.length && (
            <p className="text-xs text-slate-500 text-center py-4">No asks yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

