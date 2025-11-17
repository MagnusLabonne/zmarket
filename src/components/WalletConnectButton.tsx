"use client";

import { Loader2, LogOut, Wallet } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWalletSession } from "@/context/wallet-session-context";
import { shortenAddress } from "@/lib/utils";

export const WalletConnectButton = () => {
  const { setVisible } = useWalletModal();
  const { address, connecting, disconnect } = useWalletSession();

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-signal/50 transition"
          onClick={() => setVisible(true)}
        >
          <Wallet size={15} className="text-slate-400" />
          {shortenAddress(address)}
        </button>
        <button
          className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 hover:border-rose-400/60 hover:text-rose-200 transition"
          onClick={disconnect}
          aria-label="Disconnect wallet"
        >
          <LogOut size={15} />
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn-primary text-sm px-5 py-2 min-w-[150px]"
      onClick={() => setVisible(true)}
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
