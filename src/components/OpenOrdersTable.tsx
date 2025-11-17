"use client";

import useSWR from "swr";
import { Loader2, X } from "lucide-react";
import { useWalletSession } from "@/context/wallet-session-context";
import { useTokenSelection } from "@/context/token-context";
import type { OrderSnapshot } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const OpenOrdersTable = () => {
  const { address } = useWalletSession();
  const { marketId } = useTokenSelection();
  const { data, isLoading, mutate } = useSWR<OrderSnapshot[]>(
    address ? `/api/orders?wallet=${address}&market=${marketId}` : null,
    fetcher,
    { refreshInterval: 5000 },
  );

  const cancel = async (order: OrderSnapshot) => {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, side: order.side, market: order.market }),
    });
    mutate();
  };

  return (
    <div className="glass-panel w-full p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Open orders</p>
        {isLoading && <Loader2 className="animate-spin text-slate-500" size={16} />}
      </div>

      {!address && <p className="text-sm text-slate-400">Connect your wallet to sync custody orders.</p>}

      {address && (!data || data.length === 0) && (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-500 text-sm">
          <p>No open orders for this token yet</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-300">
            <thead>
              <tr className="text-xs uppercase tracking-[0.3em] text-slate-500 text-left">
                <th className="py-2">Time</th>
                <th>Side</th>
                <th>Price</th>
                <th>Size</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((order) => (
                <tr key={order.id} className="border-t border-white/5">
                  <td className="py-3 text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</td>
                  <td className="capitalize">{order.side}</td>
                  <td>{formatNumber(order.price, 2)} USDC</td>
                  <td>{formatNumber(order.size, 3)} SOL</td>
                  <td className="capitalize text-slate-400">{order.status}</td>
                  <td>
                    <button onClick={() => cancel(order)} className="text-slate-500 hover:text-rose-400">
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

