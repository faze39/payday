import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Payday is free to use during the hackathon. Network and 1Click solver fees still apply on-chain.",
};

export default function PricingPage() {
  return (
    <MarketingShell
      eyebrow="Pricing"
      title="Free while we build for the hackathon"
      lead="Payday does not charge a platform subscription or invent fee tiers. You pay only what the underlying networks and NEAR Intents solvers charge to move the funds."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">What Payday charges</h2>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">$0</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Creating links, opening the pay page, the dashboard, CSV export, and the agent invoice API are free on payday-near.vercel.app during the NEAR Protocol Hackathon.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li>No monthly plan</li>
            <li>No Payday cut on invoice amount</li>
            <li>No paid feature gates for line items or CSV</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">What you still pay on-chain</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            NEAR Intents 1Click quotes include solver and withdrawal costs. Those show in the live quote before anyone sends funds. They are not Payday fees.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li>Client pays gas on their origin chain to send the deposit.</li>
            <li>Quote shows amount in vs USDC out so the invoice amount stays exact (`EXACT_OUTPUT`).</li>
            <li>Observed withdrawal fees on dry quotes (2026-11-03): about $0.002 on Base, about $0.005 on Arbitrum and NEAR, about $0.25 on Solana. Live quotes can differ.</li>
          </ul>
        </section>
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-600">
        If Payday ever adds its own fee, it will be disclosed in the quote and on this page before it applies. We will not invent tiers or percentages for a marketing page.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/#create" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
          Create a free link
        </Link>
        <Link href="/faq" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400">
          Read the FAQ
        </Link>
      </div>
    </MarketingShell>
  );
}
