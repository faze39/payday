import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <MarketingShell
      eyebrow="Privacy / hackathon build"
      title="Know what you share."
      lead="Payday is a payment-link tool. This page describes the data needed for its current payment flow."
    >
      <dl className="definition-list">
        <div>
          <dt>Invoice and payment records</dt>
          <dd>
            Payday stores invoice amounts, descriptions, optional line items,
            wallet addresses and payment-attempt status. Do not put sensitive
            personal information in invoice descriptions.
          </dd>
        </div>
        <div>
          <dt>Public payment links</dt>
          <dd>
            Anyone with a payment link can read that invoice. Blockchain
            transactions and addresses can also be viewed on public explorers.
          </dd>
        </div>
        <div>
          <dt>Your dashboard key</dt>
          <dd>
            Your browser stores a secret key that grants access to your
            dashboard. Keep the private dashboard URL safe. It is not the same
            as your public payment link.
          </dd>
        </div>
        <div>
          <dt>Settlement providers</dt>
          <dd>
            Quotes and payment status are handled through NEAR Intents 1Click.
            Payment and refund addresses are used to route funds. Payday does
            not ask for wallet private keys.
          </dd>
        </div>
        <div>
          <dt>Questions about your data</dt>
          <dd>
            Contact the maintainer through the repository at
            github.com/faze39/payday. Do not post private dashboard links or
            wallet secrets in public issues.
          </dd>
        </div>
      </dl>
    </MarketingShell>
  );
}
