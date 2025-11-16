"use client";

import { Loader2, LogOut } from "lucide-react";
import { useWalletSession } from "@/context/wallet-session-context";
import { shortenAddress } from "@/lib/utils";

export const WalletConnectButton = () => {
  const { address, connecting, connect, disconnect } = useWalletSession();

  if (address) {
    return (
      <button
        className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-signal/60 transition"
        onClick={disconnect}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        {shortenAddress(address)}
        <LogOut size={15} className="text-slate-500" />
      </button>
    );
  }

  return (
    <button
      className="btn-primary text-sm px-6 py-2 min-w-[180px]"
      onClick={connect}
      disabled={connecting}
    >
      {connecting ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={16} /> Connecting
        </span>
      ) : (
        "Connect Wallet"
      )}
    </button>
  );
};

