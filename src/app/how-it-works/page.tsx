import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
import { StepList, MarketingCta } from "@/components/MarketingContent";
import { SettlementObject } from "@/components/PaydayVisuals";
export const metadata: Metadata = { title: "How it works" };
export default function HowItWorksPage() {
  return (
    <MarketingShell
      eyebrow="The payment path"
      title="One link. A clear way to your wallet."
      lead="You set the invoice. Your client chooses how to pay. NEAR Intents 1Click handles the swap and bridge."
    >
      <div className="two-col top">
        <div className="sticky-heading">
          <SettlementObject compact />
        </div>
        <StepList />
      </div>
      <section className="inner-note">
        <p className="eyebrow">When plans change</p>
        <h2>Not every deposit goes to plan.</h2>
        <dl className="definition-list">
          <div>
            <dt>Quote expired</dt>
            <dd>
              After about 30 minutes, request a new quote before sending.
              Payments already sent continue to be tracked.
            </dd>
          </div>
          <div>
            <dt>Too little sent</dt>
            <dd>
              The status page shows an incomplete deposit with guidance to top
              up or wait for an automatic refund.
            </dd>
          </div>
          <div>
            <dt>Too much sent</dt>
            <dd>
              1Click refunds the excess to the refund address your client
              provided.
            </dd>
          </div>
          <div>
            <dt>Failed or refunded</dt>
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
