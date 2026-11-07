import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
export const metadata: Metadata = { title: "Terms" };
export default function TermsPage() {
  return (
    <MarketingShell
      eyebrow="Use and payment risks"
      title="Check before you send."
      lead="Payday is a hackathon build running on mainnet. These are practical conditions and limitations of the current service."
    >
      <dl className="definition-list">
        <div>
          <dt>You control your wallet</dt>
          <dd>
            Use a receiving address you control on the selected payout chain.
            Format validation cannot prove ownership. Never share a private key
            or seed phrase.
          </dd>
        </div>
        <div>
          <dt>Follow the live quote</dt>
          <dd>
            Only send the quoted asset, amount and network to the current
            deposit address. Quotes expire. Review the refund address before
            paying.
          </dd>
        </div>
        <div>
          <dt>Transfers carry risk</dt>
          <dd>
            Blockchain transfers can be irreversible. Network delays, solver
            availability and provider failures can affect settlement. Status
            pages report what 1Click returns; they do not guarantee a completion
            time.
          </dd>
        </div>
        <div>
          <dt>Current fees</dt>
          <dd>
            There is no Payday platform fee during the hackathon. Network,
            solver and withdrawal costs still apply. Any future platform fee
            will be disclosed before it applies.
          </dd>
        </div>
        <div>
          <dt>Keep records</dt>
          <dd>
            Keep your receipt and transaction links. Payday is not a bank or a
            custodial wallet. The public repository documents known limitations
            and the current implementation.
          </dd>
        </div>
      </dl>
    </MarketingShell>
  );
}
