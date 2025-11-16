"use client";

import { ReactNode, createContext, useContext } from "react";
import { useWalletSessionState } from "@/hooks/useWalletSession";

type WalletSessionValue = ReturnType<typeof useWalletSessionState>;

const WalletSessionContext = createContext<WalletSessionValue | null>(null);

export const WalletSessionProvider = ({ children }: { children: ReactNode }) => {
  const value = useWalletSessionState();
  return <WalletSessionContext.Provider value={value}>{children}</WalletSessionContext.Provider>;
};

export const useWalletSession = () => {
  const ctx = useContext(WalletSessionContext);
  if (!ctx) {
    throw new Error("WalletSessionProvider missing");
  }
  return ctx;
};

