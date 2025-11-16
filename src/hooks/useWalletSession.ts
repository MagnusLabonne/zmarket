"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type UniversalProvider from "@walletconnect/universal-provider";
import type WalletConnectModal from "@walletconnect/modal";
import { clientEnv } from "@/lib/env.client";
import type { BalanceSnapshot } from "@/lib/types";

type WalletSession = {
  address?: string;
  chain?: "solana" | "zcash";
};

export const useWalletSessionState = () => {
  const providerRef = useRef<UniversalProvider | null>(null);
  const modalRef = useRef<WalletConnectModal | null>(null);
  const [session, setSession] = useState<WalletSession>({});
  const [balances, setBalances] = useState<BalanceSnapshot | null>(null);
  const [connecting, setConnecting] = useState(false);

  const ensureProvider = useCallback(async () => {
    if (providerRef.current) return providerRef.current;
    const { default: UniversalProviderInit } = await import("@walletconnect/universal-provider");
    providerRef.current = await UniversalProviderInit.init({
      projectId: clientEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: "Zerdinals Marketplace",
        description: "ZRC custody trading powered by Solana and Zcash",
        url: "https://zerdinals.com/marketplace",
        icons: ["https://zerdinals.com/icon.png"],
      },
    });
    return providerRef.current;
  }, []);

  const ensureModal = useCallback(async () => {
    if (modalRef.current) return modalRef.current;
    const { default: WalletConnectModal } = await import("@walletconnect/modal");
    modalRef.current = new WalletConnectModal({
      projectId: clientEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      themeMode: "dark",
      explorerRecommendedWalletIds: "NONE",
    });
    return modalRef.current;
  }, []);

  const refreshBalance = useCallback(
    async (wallet?: string) => {
      const target = wallet ?? session.address;
      if (!target) return null;
      const response = await fetch("/api/balances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: target }),
      });
      if (!response.ok) throw new Error("Unable to refresh balances");
      const data = (await response.json()) as BalanceSnapshot;
      setBalances(data);
      return data;
    },
    [session.address],
  );

  const connect = useCallback(async () => {
    if (!clientEnv.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
      throw new Error("WalletConnect project id missing");
    }

    setConnecting(true);
    try {
      const [provider, modal] = await Promise.all([ensureProvider(), ensureModal()]);
      provider.on("display_uri", (uri: string) => {
        modal.openModal({ uri });
      });

      const namespaces = {
        solana: {
          methods: ["solana_signMessage", "solana_signTransaction"],
          chains: ["solana:mainnet"],
          events: ["chainChanged", "accountsChanged"],
        },
      };

      const result = await provider.connect({ namespaces });
      modal.closeModal();
      const solAccount = result.namespaces.solana.accounts[0];
      const address = solAccount.split(":")[2];
      setSession({ address, chain: "solana" });
      await refreshBalance(address);
      return address;
    } finally {
      setConnecting(false);
    }
  }, [ensureModal, ensureProvider, refreshBalance]);

  const disconnect = useCallback(async () => {
    if (providerRef.current) {
      await providerRef.current.disconnect();
    }
    setSession({});
    setBalances(null);
  }, []);

  return useMemo(
    () => ({
      ...session,
      balances,
      connecting,
      connect,
      disconnect,
      refreshBalance,
    }),
    [balances, connect, connecting, disconnect, refreshBalance, session],
  );
};

