"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTokenSelection } from "@/context/token-context";
import { buildTokenLabel } from "@/lib/tokens";

export const TokenSelector = () => {
  const { tokens, selectedToken, setSelectedToken, loading } = useTokenSelection();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!tokens.length) return [];
    const value = query.trim().toLowerCase();
    const base = value
      ? tokens.filter(
          (token) =>
            token.tick.toLowerCase().includes(value) ||
            token.inscriptionId.toLowerCase().includes(value),
        )
      : tokens;
    return base.slice(0, 8);
  }, [query, tokens]);

  if (loading && !tokens.length) {
    return (
      <div className="glass-panel p-4 text-sm text-slate-400">
        Loading ZRC-20 registry...
      </div>
    );
  }

  if (!selectedToken) {
    return (
      <div className="glass-panel p-4 text-sm text-rose-400">
        Unable to load token list.
      </div>
    );
  }

  return (
    <div className="glass-panel flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Selected token</p>
          <p className="text-xl font-semibold text-slate-50">{selectedToken.tick.toUpperCase()}</p>
          <p className="text-xs text-slate-400">Inscription {selectedToken.inscriptionId}</p>
        </div>
        <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-400">
          Supply {selectedToken.supply.toLocaleString()}
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          className="w-full rounded-2xl border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-signal/60 focus:outline-none"
          placeholder="Search by tick or inscription id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700/50">
        {filtered.map((token) => {
          const isActive = token.inscriptionId === selectedToken.inscriptionId;
          return (
            <button
              key={token.inscriptionId}
              onClick={() => setSelectedToken(token)}
              className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? "border-signal/80 bg-slate-900/60 text-slate-50"
                  : "border-white/10 text-slate-300 hover:border-signal/60"
              }`}
            >
              <span className="text-sm font-semibold">{token.tick.toUpperCase()}</span>
              <span className="text-xs text-slate-500">{buildTokenLabel(token)}</span>
            </button>
          );
        })}
        {!filtered.length && (
          <p className="text-xs text-slate-500">
            No tokens match &quot;{query}&quot;.
          </p>
        )}
      </div>
    </div>
  );
};

