import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ChartPanel } from "@/components/ChartPanel";
import { OrderBook } from "@/components/OrderBook";
import { TradeForm } from "@/components/TradeForm";
import { OpenOrdersTable } from "@/components/OpenOrdersTable";
import { TradeHistory } from "@/components/TradeHistory";
import { MarketStats } from "@/components/MarketStats";

export default function ZcashMarketPage() {
  return (
    <div className="min-h-screen px-6 py-10 text-slate-50">
      <header className="flex flex-col gap-6 pb-10">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.45em] text-slate-500">ZRC / SOLANA / CUSTODIAL</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-semibold">Zcash ZRC-20 Orderbok</h1>
              <p className="text-slate-400 mt-2">
                Live Solana settlement with Zcash custody, inspired by the pro desks you referenced.
              </p>
            </div>
            <WalletConnectButton />
          </div>
        </div>
        <MarketStats />
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <ChartPanel />
          <OpenOrdersTable />
          <TradeHistory />
        </div>
        <div className="space-y-6">
          <OrderBook />
          <TradeForm />
        </div>
      </section>
    </div>
  );
}

