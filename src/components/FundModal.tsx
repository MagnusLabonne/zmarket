"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useWalletSession } from "@/context/wallet-session-context";

type Props = {
  mode: "deposit" | "withdraw";
  label: string;
};

export const FundModal = ({ mode, label }: Props) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("10");
  const [chain, setChain] = useState<"solana" | "zcash">("solana");
  const { address, refreshBalance } = useWalletSession();
  const [submitting, setSubmitting] = useState(false);

  const actionCopy = mode === "deposit" ? "Deposit" : "Withdraw";

  const onSubmit = async () => {
    if (!address) return;
    setSubmitting(true);
    try {
      await fetch(`/api/balances/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, chain, amount: Number(amount) }),
      });
      await refreshBalance(address);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-slate-300 hover:border-signal/60 transition">
          {label}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-3xl border border-white/10 bg-slate-900/90 p-6 text-slate-100 shadow-2xl">
          <div>
            <Dialog.Title className="text-lg font-semibold">{actionCopy} funds</Dialog.Title>
            <Dialog.Description className="text-sm text-slate-400 mt-1">
              Custodial settlement lands on Solana for now — ZRC on-chain settlement arrives after launch.
            </Dialog.Description>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Chain</label>
            <div className="flex gap-2">
              {(["solana", "zcash"] as const).map((option) => (
                <button
                  key={option}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm capitalize transition ${
                    chain === option ? "border-signal/80 bg-white/5" : "border-white/10 text-slate-400"
                  }`}
                  onClick={() => setChain(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Amount</label>
            <input
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-lg focus:border-signal/60 outline-none"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            className="btn-primary w-full justify-center text-base"
            onClick={onSubmit}
            disabled={submitting || !address}
          >
            {submitting ? "Processing..." : `${actionCopy} ${chain}`}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

