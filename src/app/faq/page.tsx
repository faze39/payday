import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about Payday payment links, custody, payouts, refunds, and the agent API.",
};

const FAQS = [
  {
    q: "What is Payday?",
    a: "A payment-link tool for freelancers. You invoice in USD and receive USDC. Your client can pay with any token 1Click supports on a supported chain.",
  },
  {
    q: "Does Payday hold my money?",
    a: "No. Payday is non-custodial. It asks NEAR Intents for quotes and status. Funds go from the client to a one-time deposit address and then to your wallet.",
  },
  {
    q: "Which payout chains work?",
    a: "USDC on Base (default), Arbitrum, NEAR, and Solana. Those were verified against the 1Click token list and dry quotes.",
  },
  {
    q: "Do I need an account?",
    a: "No sign-up to create a link. Your browser keeps a secret dashboard key (also in the private dashboard URL fragment). Anyone with that key can see your links, so keep it private.",
  },
  {
    q: "What happens if the client underpays or overpays?",
    a: "Underpays show as incomplete deposit with guidance to top up or wait for refund. Overpays: excess is refunded to the refund address the client entered. Failed or refunded attempts show the reason and a way to try again.",
  },
  {
    q: "How long is a quote valid?",
    a: "About 30 minutes. After that the deposit address is hidden and the client should request a new quote. A payment already sent is still tracked.",
  },
  {
    q: "Can I add line items?",
    a: "Yes. Optional line items on create appear on the pay page and the receipt. They need the line_items column in Supabase if you self-host production.",
  },
  {
    q: "Can an AI agent pay an invoice?",
    a: "Yes. GET /api/invoices/:id returns machine-readable invoice JSON. POST /api/invoices/:id/pay starts the same 1Click flow. Poll GET /api/attempts/:id for status. See docs/agent-payments.md in the repo.",
  },
  {
    q: "Is there a NEAR smart contract?",
    a: "Scaffold code for an invoice registry exists in the repo. It is not deployed on-chain yet and needs a NEAR account plus a small balance to deploy.",
  },
  {
    q: "What does Payday cost?",
    a: "Payday itself is free during the hackathon. On-chain gas and 1Click solver or withdrawal costs still apply and appear in the live quote. See the Pricing page.",
  },
];

export default function FaqPage() {
  return (
    <MarketingShell
      eyebrow="FAQ"
      title="Questions people actually ask"
      lead="Short answers based on how the live app works today. If something here disagrees with a live quote or status page, trust the live page."
    >
      <div className="space-y-3">
        {FAQS.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
            <summary className="cursor-pointer list-none text-base font-semibold tracking-tight text-slate-950 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.q}
                <span className="mt-0.5 font-mono text-xs text-slate-400 group-open:hidden" aria-hidden="true">
                  +
                </span>
                <span className="mt-0.5 hidden font-mono text-xs text-slate-400 group-open:inline" aria-hidden="true">
                  -
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-600">
        Still stuck? Start from{" "}
        <Link href="/#create" className="font-semibold text-slate-950 underline-offset-4 hover:underline">
          creating a link
        </Link>{" "}
        or open your{" "}
        <Link href="/dashboard" className="font-semibold text-slate-950 underline-offset-4 hover:underline">
          dashboard
        </Link>
        .
      </p>
    </MarketingShell>
  );
}
