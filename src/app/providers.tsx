"use client";

import { ThemeProvider } from "next-themes";
import { WalletSessionProvider } from "@/context/wallet-session-context";
import { TokenProvider } from "@/context/token-context";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <WalletSessionProvider>
      <TokenProvider>{children}</TokenProvider>
    </WalletSessionProvider>
  </ThemeProvider>
);

