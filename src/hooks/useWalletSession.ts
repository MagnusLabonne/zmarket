"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { BalanceSnapshot } from "@/lib/types";

export const useWalletSessionState = () => {
  const { publicKey, connect, disconnect, connected, connecting } = useWallet();
  const [balances, setBalances] = useState<BalanceSnapshot | null>(null);

  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const fetchBalance = useCallback(
    async (wallet?: string) => {
      const target = wallet ?? address;
      if (!target) return null;
      const response = await fetch("/api/balances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: target }),
      });
      if (!response.ok) throw new Error("Unable to refresh balances");
      return (await response.json()) as BalanceSnapshot;
    },
    [address],
  );

  const refreshBalance = useCallback(
    async (wallet?: string) => {
      const snapshot = await fetchBalance(wallet);
      if (snapshot) {
        setBalances(snapshot);
      }
      return snapshot;
    },
    [fetchBalance],
  );

  useEffect(() => {
    if (connected && address) {
      let ignore = false;
      fetchBalance(address).then((snapshot) => {
        if (!ignore && snapshot) {
          setBalances(snapshot);
        }
      });
      return () => {
        ignore = true;
      };
    }
    if (!connected) {
      const timeout = setTimeout(() => setBalances(null), 0);
      return () => clearTimeout(timeout);
    }
  }, [address, connected, fetchBalance]);

  const handleConnect = useCallback(async () => {
    await connect();
  }, [connect]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setBalances(null);
  }, [disconnect]);

  return useMemo(
    () => ({
      address,
      chain: address ? ("solana" as const) : undefined,
      balances,
      connecting,
      connect: handleConnect,
      disconnect: handleDisconnect,
      refreshBalance,
    }),
    [address, balances, connecting, handleConnect, handleDisconnect, refreshBalance],
  );
};

