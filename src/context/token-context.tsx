"use client";

import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import { useTokenList } from "@/hooks/useTokenList";
import type { ZrcToken } from "@/lib/types";
import { extractMarketFromToken } from "@/lib/tokens";

type TokenContextValue = {
  tokens: ZrcToken[];
  selectedToken: ZrcToken | null;
  marketId: string;
  loading: boolean;
  setSelectedToken: (token: ZrcToken) => void;
};

const TokenContext = createContext<TokenContextValue | null>(null);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { tokens, loading } = useTokenList();
  const [selectedInscription, setSelectedInscription] = useState<string | null>(null);

  const selectedToken =
    tokens.find((token) => token.inscriptionId === selectedInscription) ?? tokens[0] ?? null;

  const value = useMemo<TokenContextValue>(
    () => ({
      tokens,
      selectedToken,
      marketId: extractMarketFromToken(selectedToken),
      loading,
      setSelectedToken: (token: ZrcToken) => setSelectedInscription(token.inscriptionId),
    }),
    [loading, selectedToken, tokens],
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
};

export const useTokenSelection = () => {
  const ctx = useContext(TokenContext);
  if (!ctx) {
    throw new Error("TokenProvider missing");
  }
  return ctx;
};

