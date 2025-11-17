"use client";

import { ReactNode, createContext, useContext, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useWalletSessionState } from "@/hooks/useWalletSession";
import "@solana/wallet-adapter-react-ui/styles.css";

type WalletSessionValue = ReturnType<typeof useWalletSessionState>;

const WalletSessionContext = createContext<WalletSessionValue | null>(null);

const WalletSessionBridge = ({ children }: { children: ReactNode }) => {
  const value = useWalletSessionState();
  return <WalletSessionContext.Provider value={value}>{children}</WalletSessionContext.Provider>;
};

export const WalletSessionProvider = ({ children }: { children: ReactNode }) => {
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new LedgerWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletSessionBridge>{children}</WalletSessionBridge>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const useWalletSession = () => {
  const ctx = useContext(WalletSessionContext);
  if (!ctx) {
    throw new Error("WalletSessionProvider missing");
  }
  return ctx;
};

