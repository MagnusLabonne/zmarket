import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ChartPanel } from "@/components/ChartPanel";
import { OrderBook } from "@/components/OrderBook";
import { TradeForm } from "@/components/TradeForm";
import { OpenOrdersTable } from "@/components/OpenOrdersTable";
import { TradeHistory } from "@/components/TradeHistory";
import { MarketStats } from "@/components/MarketStats";
import { TokenSelector } from "@/components/TokenSelector";

export default function ZrcMarketPage() {
  return (
    <div className="min-h-screen px-5 py-8 text-slate-50">
      <header className="flex flex-col gap-5 pb-8">
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">ZRC-20 / SOLANA / SPECULATIVE</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold md:text-4xl">ZRC-20 Order Book</h1>
                  <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
                    Trade inscription supply synthetically against Solana liquidity, monitor depth, and react to fills in real time.
                  </p>
                </div>
                <WalletConnectButton />
              </div>
            </div>
            <MarketStats />
          </div>
          <TokenSelector />
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <ChartPanel />
          <OpenOrdersTable />
          <TradeHistory />
        </div>
        <div className="space-y-5">
          <OrderBook />
          <TradeForm />
        </div>
      </section>
    </div>
  );
}

