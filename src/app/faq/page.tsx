import type { Metadata } from "next";
import { MarketingShell } from "@/components/MarketingShell";
import { FaqList, MarketingCta } from "@/components/MarketingContent";
export const metadata: Metadata = { title: "FAQ" };
export default function FaqPage() {
  return (
    <MarketingShell
      eyebrow="A few things worth knowing"
      title="Before the first payment."
      lead="Straight answers about wallets, fees, quotes and what is live today."
    >
      <div className="faq-page-band">
        <FaqList all />
      </div>
      <MarketingCta />
    </MarketingShell>
  );
}
