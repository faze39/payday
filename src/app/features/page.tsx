import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { FeatureGrid, MarketingCta } from "@/components/MarketingContent";
export const metadata: Metadata = { title: "Features" };
export default function FeaturesPage() {
  return (
    <MarketingShell
      eyebrow="The toolkit"
      title="Less chasing. More getting paid."
      lead="Payment links, itemised invoices and a clear trail from deposit to receipt. Built for freelancers who work across chains."
    >
      <FeatureGrid />
      <section className="inner-note two-col">
        <div>
          <p className="eyebrow">Made for your records</p>
          <h2>
            Nothing lost between
            <br />
            the invoice and the receipt.
          </h2>
        </div>
        <div>
          <p>
            Your private dashboard keeps paid, pending and refunded links in one
            place. Export CSV records with transaction links when it is time to
            reconcile.
          </p>
          <Link href="/dashboard" className="text-link">
            Open your dashboard →
          </Link>
        </div>
      </section>
      <section className="technical-note">
        <span className="eyebrow">Development note</span>
        <p>
          The NEAR invoice registry is a scaffold, not a deployed contract.
          Agent payments use the working 1Click flow. PingPay x402 is not
          integrated.
        </p>
        <a
          className="text-link"
          href="https://github.com/faze39/payday/blob/main/docs/agent-payments.md"
        >
          Read the agent API documentation ↗
        </a>
      </section>
      <MarketingCta />
    </MarketingShell>
  );
}
