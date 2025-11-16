"use client";

import { useMemo, useState } from "react";
import { useWalletSession } from "@/context/wallet-session-context";
import { formatCurrency } from "@/lib/utils";
import { FundModal } from "./FundModal";

const allocation = [0.25, 0.5, 0.75, 1];

export const TradeForm = () => {
  const { address, balances } = useWalletSession();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState(137.59);
  const [size, setSize] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const total = useMemo(() => (type === "market" ? size * price * 1.002 : price * size), [price, size, type]);
  const insufficient =
    side === "buy"
      ? (balances?.usdc ?? 0) < total
      : (balances?.zrc ?? 0) < size;

  const handleSubmit = async () => {
    if (!address) {
      setMessage("Connect a wallet first");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, side, type, price, size }),
      });
      if (!response.ok) throw new Error("Order rejected");
      setMessage("Order submitted");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-5 space-y-5">
      <div className="flex justify-between items-center">
        <div className="rounded-full bg-white/5 p-1 flex">
          {(["buy", "sell"] as const).map((mode) => (
            <button
              key={mode}
              className={`px-4 py-1 text-sm font-semibold rounded-full transition ${
                side === mode ? "bg-signal/90 text-slate-900" : "text-slate-400"
              }`}
              onClick={() => setSide(mode)}
            >
              {mode === "buy" ? "Buy" : "Sell"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <FundModal mode="deposit" label="Deposit" />
          <FundModal mode="withdraw" label="Withdraw" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Ordertyp</label>
        <select
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-signal/70"
          value={type}
          onChange={(e) => setType(e.target.value as "limit" | "market")}
        >
          <option value="limit">Limitorder</option>
          <option value="market">Marknadsorder</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Limitpris</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-lg focus:border-signal/70 outline-none"
          />
          <span className="text-sm text-slate-400">USDC</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Antal</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-lg focus:border-signal/70 outline-none"
          />
          <span className="text-sm text-slate-400">SOL</span>
        </div>
      </div>

      <div className="flex gap-2">
        {allocation.map((pct) => (
          <button
            key={pct}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400 hover:border-signal/60"
            onClick={() => {
              const balance = side === "buy" ? balances?.usdc ?? 0 : balances?.zrc ?? 0;
              const target = balance * pct;
              if (side === "buy") {
                setSize(Math.max(target / price, 0.001));
              } else {
                setSize(target);
              }
            }}
          >
            {pct === 1 ? "MAX" : `${pct * 100}%`}
          </button>
        ))}
      </div>

      {insufficient && (
        <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Insufficient balance — top up via Deposits.
        </p>
      )}

      <div className="space-y-2 text-sm text-slate-400">
        <div className="flex justify-between">
          <span>Available</span>
          <span>
            {(balances?.usdc ?? 0).toFixed(2)} USDC / {(balances?.zrc ?? 0).toFixed(3)} ZRC
          </span>
        </div>
        <div className="flex justify-between">
          <span>Fee</span>
          <span>0.55 USDC</span>
        </div>
        <div className="flex justify-between font-semibold text-slate-200">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {message && <p className="text-xs text-slate-400">{message}</p>}

      <button
        className="btn-primary w-full justify-center text-lg"
        onClick={handleSubmit}
        disabled={submitting || insufficient}
      >
        {submitting ? "Sending..." : side === "buy" ? "Buy ZRC" : "Sell ZRC"}
      </button>
    </div>
  );
};

