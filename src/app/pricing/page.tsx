import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
export const metadata: Metadata = { title: "Pricing" };
export default function PricingPage() {
  return (
    <MarketingShell
      eyebrow="THE COST BREAKDOWN"
      title="The link is free. Moving money has a cost."
      lead="No Payday fee during the NEAR Protocol Hackathon. No subscription and no platform cut. Network and settlement costs still apply."
    >
      <section className="pricing-sheet">
        <div className="price-summary">
          <p className="eyebrow">PAYDAY PLATFORM FEE</p>
          <div className="price">
            $0<span>during the hackathon</span>
          </div>
          <p>
            The full toolkit.
            <br />
            Not a stripped-down trial.
          </p>
          <Link href="/#create" className="btn-primary">
            Create a free link <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="included-list">
          <p className="tiny-label">INCLUDED IN PAYDAY</p>
          {[
            "Payment links & line-item invoices",
            "Status tracking & transaction receipts",
            "Private dashboard & CSV export",
            "Agent invoice API",
            "USDC payouts on four supported chains",
          ].map((item) => (
            <div key={item}>
              <span>{item}</span>
              <span aria-label="Included">↗</span>
            </div>
          ))}
        </div>
      </section>
      <section className="cost-breakdown">
        <div>
          <p className="eyebrow">SEPARATE FROM PAYDAY</p>
          <h2>
            Read the quote.
            <br />
            Then send.
          </h2>
        </div>
        <dl className="definition-list">
          <div>
            <dt>Solver & withdrawal costs</dt>
            <dd>
              Included in the live NEAR Intents 1Click quote. Costs vary by
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
            <dt>Exact-output settlement</dt>
            <dd>
              The quote calculates what to send for your requested USDC amount.
              Always check the token, network and amount before paying.
            </dd>
          </div>
        </dl>
      </section>
      <aside className="technical-note">
        <h2>Free now. No promise of free forever.</h2>
        <p>
          This is the current hackathon pricing, not a lifetime offer. Any
          future Payday fee will be disclosed before it applies.
        </p>
        <Link href="/faq" className="text-link">
          More about quotes and payments →
        </Link>
      </aside>
    </MarketingShell>
  );
}
