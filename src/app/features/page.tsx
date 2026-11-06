import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export const metadata: Metadata = {
  title: "Features",
  description: "What Payday does today: payment links, any-token pay-in, USDC payout via NEAR Intents, line items, CSV export, and an agent pay API.",
};

const FEATURES = [
  {
    title: "Payment links",
    body: "Set a USD amount, a description, and the wallet where you want USDC. Share the link. No account required to create one.",
  },
  {
    title: "Any token, any supported chain",
    body: "Your client opens the link, picks a token from the live 1Click token list, and gets a quote with a unique deposit address.",
  },
  {
    title: "USDC payout via NEAR Intents",
    body: "NEAR Intents (1Click) swaps and bridges the deposit and delivers the exact invoice amount as USDC to your wallet on Base, Arbitrum, NEAR, or Solana. Base is the default.",
  },
  {
    title: "Non-custodial",
    body: "Funds move from the client to a one-time deposit address and on to you. Payday never holds balances or private keys. It only requests quotes and reads status.",
  },
  {
    title: "Line-item invoices",
    body: "Optional line items on create. They show on the pay page and the receipt so the invoice matches the work you billed.",
  },
  {
    title: "Dashboard and CSV export",
    body: "Your secret dashboard lists each link with paid, pending, and refunded status. Download CSV with explorer transaction links for your records.",
  },
  {
    title: "Agent payment API",
    body: "Agents can read an invoice as JSON and start the same 1Click payment a human would, then poll attempt status until it settles.",
  },
  {
    title: "NEAR invoice registry (scaffold)",
    body: "Contract code can record invoice fingerprints on NEAR. It is not deployed on-chain yet. Deploy needs a NEAR account and a small balance from you.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingShell
      eyebrow="Features"
      title="What Payday does today"
      lead="Built for freelancers who get paid across chains. Everything below is live on the app except the on-chain registry deploy."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <li key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{f.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/#create" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Create a payment link
        </Link>
        <Link href="/how-it-works" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400">
          See how it works
        </Link>
      </div>
    </MarketingShell>
  );
}
