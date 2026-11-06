import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
export const metadata: Metadata = { title: "Pricing" };
export default function PricingPage() {
  return (
    <MarketingShell
      eyebrow="Pricing, plainly"
      title="Free to use. Not free to move funds."
      lead="Payday charges no platform fee during the NEAR Protocol Hackathon. The underlying networks and settlement service still have costs."
    >
      <div className="pricing-grid">
        <section className="price-card">
          <p className="eyebrow">Payday platform fee</p>
          <div className="price">
            $0<span>during the hackathon</span>
          </div>
          <p>No subscription. No Payday cut of your invoice.</p>
          <ul className="trust-list">
            <li>Payment links and line-item invoices</li>
            <li>Dashboard, status tracking and receipts</li>
            <li>CSV export and agent invoice API</li>
            <li>USDC payouts on four supported chains</li>
          </ul>
          <Link href="/#create" className="btn-primary">
            Create a free link ↗
          </Link>
        </section>
        <section className="cost-card">
          <p className="eyebrow">Separate from Payday</p>
          <h2>What the quote covers.</h2>
          <dl className="definition-list">
            <div>
              <dt>Solver and withdrawal costs</dt>
              <dd>
                Included in your live NEAR Intents 1Click quote. They vary by
                route and payout chain.
              </dd>
            </div>
            <div>
              <dt>Origin-chain gas</dt>
              <dd>
                Your client pays the network fee to send the deposit from their
                own wallet.
              </dd>
            </div>
            <div>
              <dt>The invoice amount stays exact</dt>
              <dd>
                Payday requests exact-output quotes. Your client sees the amount
                to send for your requested USDC payout.
              </dd>
            </div>
          </dl>
        </section>
      </div>
      <section className="technical-note">
        <h2>No promise of free forever.</h2>
        <p>
          This is the current hackathon pricing, not a lifetime offer. Any
          future Payday fee will be disclosed before it applies. Always review
          the live quote before sending funds.
        </p>
        <Link href="/faq" className="text-link">
          More about quotes and payments →
        </Link>
      </section>
    </MarketingShell>
  );
}
