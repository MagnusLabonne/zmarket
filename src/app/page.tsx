import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-slate-100">
      <div className="glass-panel max-w-4xl w-full px-10 py-12 flex flex-col gap-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
          Zerdinals Trading Surface
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
          Speculative ZRC-20 markets with instant Solana settlement.
        </h1>
        <p className="text-slate-400 text-lg">
          Plug in Phantom, Backpack, or Solflare, scan the live order book, and express a view on any inscription without waiting for
          future custody rails to arrive.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/zcash" className="btn-primary text-base">
            Enter ZRC-20 Market
          </Link>
          <a
            href="https://zerdinals.com/marketplace"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 px-8 py-3 text-base font-semibold hover:border-signal/80 transition"
          >
            View Marketplace Deck
          </a>
        </div>
      </div>
    </div>
  );
}
