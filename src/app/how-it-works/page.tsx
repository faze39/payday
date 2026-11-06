import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export const metadata: Metadata = {
  title: "How it works",
  description: "Create a Payday link, let your client pay with any supported token, and receive USDC through NEAR Intents.",
};

const STEPS = [
  {
    title: "You create a link",
    body: "Enter the amount in USD, optional line items, a short description, and the wallet that should receive USDC. Payday returns a public pay link and a private dashboard key.",
  },
  {
    title: "Your client opens the link",
    body: "They choose a token they already hold from the live list (hundreds of assets across many chains), enter a refund address, and request a quote.",
  },
  {
    title: "They send the exact deposit",
    body: "1Click returns a unique deposit address and the exact amount to send. The client pays that amount from their own wallet. Quotes expire after about 30 minutes.",
  },
  {
    title: "NEAR Intents delivers USDC",
    body: "Solvers detect the deposit, swap and bridge, and send the exact invoice amount as USDC to your payout wallet. Excess is refunded to the client refund address.",
  },
  {
    title: "Status and receipt",
    body: "The pay page and dashboard poll for status (awaiting deposit, swapping, delivered, refunded). The receipt includes explorer links for the deposit and the payout when available.",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingShell
      eyebrow="How it works"
      title="One link. Any token in, USDC out."
      lead="Payday sits in front of NEAR Intents 1Click. You never custody funds. You create the invoice; 1Click handles the swap and bridge."
    >
      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-mono text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Failure cases we already handle</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-300">
          <li>Expired quote: deposit address is hidden; client requests a new quote. An in-flight payment is still tracked.</li>
          <li>Underpaid: client is told to top up or wait for the automatic refund.</li>
          <li>Refunded or failed: page shows amount, reason, and a try-again path.</li>
          <li>Overpaid: excess is refunded to the client refund address.</li>
        </ul>
        <Link href="/#create" className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500">
          Create a link
        </Link>
      </div>
    </MarketingShell>
  );
}
