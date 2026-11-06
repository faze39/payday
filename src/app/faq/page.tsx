import type { Metadata } from "next";
import { MarketingLink as Link } from "@/components/marketing-motion";
import { MarketingShell } from "@/components/MarketingShell";
import { FaqList, MarketingCta } from "@/components/MarketingContent";
export const metadata: Metadata = { title: "FAQ" };
export default function FaqPage() {
  return (
    <MarketingShell
      eyebrow="THE DETAILS DESK"
      title="Good questions. No fine-print answers."
      lead="What happens to the money, what it costs, and what’s actually live. Read this before your first payment."
    >
      <div className="faq-layout">
        <aside className="faq-aside">
          <span className="tiny-label">START HERE</span>
          <p>
            Your keys stay yours.
            <br />
            The quote is your source of truth.
          </p>
          <Link href="/how-it-works" className="text-link">
            Walk through a payment →
          </Link>
          <Link href="/pricing" className="text-link">
            See the cost breakdown →
          </Link>
        </aside>
        <FaqList all />
      </div>
      <MarketingCta />
    </MarketingShell>
  );
}
