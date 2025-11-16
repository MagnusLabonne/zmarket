import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Zerdinals ZRC-20 Market",
  description: "Custodial DeFi venue for trading ZRC over Solana liquidity.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${space.variable} bg-night antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
