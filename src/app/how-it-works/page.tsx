import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
import { StepList, MarketingCta } from "@/components/MarketingContent";
export const metadata: Metadata = { title: "How it works" };
export default function HowItWorksPage() {
  return (
    <MarketingShell
      eyebrow="THE HANDOFF"
      title="The work is done. Here’s what happens next."
      lead="One invoice, two sides of a payment. You decide what arrives. Your client decides what to send."
    >
      <div className="route-banner">
        <span>
          YOUR INVOICE <b>USD</b>
        </span>
        <span className="route-bridge">
          NEAR INTENTS 1CLICK <i aria-hidden="true">→</i>
        </span>
        <span>
          YOUR WALLET <b>USDC</b>
        </span>
      </div>
      <StepList />
      <section className="inner-note">
        <p className="eyebrow">EXCEPTIONS, EXPLAINED</p>
        <h2>
          A clear next step.
          <br />
          Even when things go off-route.
        </h2>
        <dl className="exception-grid definition-list">
          <div>
            <dt>Quote expired?</dt>
            <dd>
              After about 30 minutes, get a fresh quote before sending. Payments
              already sent continue to be tracked.
            </dd>
          </div>
          <div>
            <dt>Too little sent?</dt>
            <dd>
              The status page shows an incomplete deposit and guidance to top up
              or wait for the automatic refund.
            </dd>
          </div>
          <div>
            <dt>Too much sent?</dt>
            <dd>
              1Click refunds the excess to the refund address your client
              provided.
            </dd>
          </div>
          <div>
            <dt>Failed or refunded?</dt>
            <dd>
              The page shows the reason, refund information and a way to try
              again.
            </dd>
          </div>
        </dl>
      </section>
      <MarketingCta />
    </MarketingShell>
  );
}
