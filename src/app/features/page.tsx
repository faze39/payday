import type { Metadata } from "next";
import { MarketingLink as Link } from "@/components/marketing-motion";
import { ApiWorkbench } from "@/components/ApiWorkbench";
import { MarketingShell } from "@/components/MarketingShell";
import { FeatureGrid, MarketingCta } from "@/components/MarketingContent";
export const metadata: Metadata = { title: "Features" };
export default function FeaturesPage() {
  return (
    <MarketingShell
      eyebrow="THE WORKING KIT"
      title="An invoice is only the beginning."
      lead="From the first ask to the accounting afterwards. The tools to request, receive and reconcile cross-chain payments, without a shared balance."
    >
      <FeatureGrid />
      <section className="inner-note two-col">
        <div>
          <p className="eyebrow">CLOSE THE BOOKS, TOO</p>
          <h2>
            Keep the record.
            <br />
            Skip the spreadsheet archaeology.
          </h2>
        </div>
        <div>
          <p>
            Your private dashboard keeps paid, pending and refunded links
            together. Export CSV records with transaction links when it is time
            to reconcile.
          </p>
          <Link href="/dashboard" className="text-link">
            Open your dashboard →
          </Link>
        </div>
      </section>
      <section className="api-workbench">
        <div>
          <p className="eyebrow">FOR THE PROGRAMMABLE SIDE</p>
          <h2>
            Same invoice.
            <br />
            Another interface.
          </h2>
          <p className="lead">
            Agents can read an invoice, request a quote and poll the payment
            status. They still send the deposit from their own wallet.
          </p>
          <a
            className="text-link"
            href="https://github.com/faze39/payday/blob/main/docs/agent-payments.md"
          >
            Read the API documentation ↗
          </a>
        </div>
        <ApiWorkbench />
      </section>
      <aside className="technical-note">
        <span className="eyebrow">WHAT IS NOT LIVE</span>
        <p>
          The NEAR invoice registry is a scaffold, not a deployed contract.
          Agent payments use the working 1Click flow. PingPay x402 is not
          integrated.
        </p>
      </aside>
      <MarketingCta />
    </MarketingShell>
  );
}
