import {
  MarketingLink as Link,
  MarketingPage,
  PaperReveal,
  SettlementNumber,
} from "@/components/marketing-motion";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { SettlementDesk } from "@/components/SettlementDesk";
import { FaqList } from "@/components/MarketingContent";

const PROOF =
  "https://solscan.io/tx/547PEU3gUVs6qXJiJCPDniw64XRb8TicPRcZiymfpoD4MkPLobvvQ8XCMzB4ewkEuNeATda5uwTpRMxLZ2WMj61W";

export default function Home() {
  return (
    <MarketingPage className="marketing">
      <section className="desk-hero wrap">
        <div className="hero-editorial">
          <p className="eyebrow">
            <span className="live-square" /> PAYMENT LINKS FOR INDEPENDENT WORK
          </p>
          <h1>
            Less crypto talk.
            <br />
            More <span className="marked-word">paid work.</span>
          </h1>
          <p className="lead">
            Invoice in dollars. Let clients pay with a token they hold. Receive
            USDC straight to your wallet.
          </p>
          <div className="hero-actions">
            <Link href="#create" className="btn-primary">
              Create a payment link <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/how-it-works" className="text-link">
              Follow the money <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="hero-footnote">
            No account. No custody. Built on NEAR Intents.
          </p>
          <div className="hero-margin-note">
            <span aria-hidden="true">↳</span>
            <p>
              For the work you do everywhere.
              <br />
              And the wallet you call yours.
            </p>
          </div>
        </div>
        <SettlementDesk />
      </section>
      <div className="payout-strip">
        <div className="wrap">
          <p>YOUR USDC CAN LAND ON</p>
          <ul>
            <li>Base</li>
            <li>Arbitrum</li>
            <li>NEAR</li>
            <li>Solana</li>
          </ul>
          <span>YOUR WALLET. YOUR CHOICE. ↗</span>
        </div>
      </div>
      <section className="work-section wrap">
        <div className="section-label">
          <span className="eyebrow">THE JOB AFTER THE JOB</span>
          <span>SHOULD NOT BE ANOTHER JOB.</span>
        </div>
        <h2 className="manifesto">
          You’re a freelancer.
          <br />
          Not a <span>bridge operator.</span>
        </h2>
        <div className="work-bottom">
          <p>
            Built by a Nigerian freelancer who got tired of the coin-and-network
            conversation. Payday separates how your client pays from how you get
            paid.
          </p>
          <Link href="/features" className="text-link">
            A closer look at the toolkit →
          </Link>
        </div>
        <div className="editorial-features">
          <PaperReveal as="article">
            <span className="tiny-label">THE ASK</span>
            <h3>
              One link.
              <br />
              Your exact price.
            </h3>
            <p>
              A USD amount, your wallet and the work you delivered. Line items
              included if you need them.
            </p>
          </PaperReveal>
          <PaperReveal as="article" delay={0.08}>
            <span className="tiny-label">THE HANDOFF</span>
            <h3>
              Their token.
              <br />
              No back-and-forth.
            </h3>
            <p>
              Your client chooses a supported token and gets a live quote.
              1Click handles the swap and bridge.
            </p>
          </PaperReveal>
          <PaperReveal as="article" delay={0.16}>
            <span className="tiny-label">THE RECORD</span>
            <h3>
              Paid, with
              <br />
              the paper trail.
            </h3>
            <p>
              Track status, keep the receipt and export a CSV with transaction
              links from your private dashboard.
            </p>
          </PaperReveal>
        </div>
      </section>
      <section className="proof-section">
        <div className="wrap proof-layout">
          <div>
            <p className="eyebrow">NOT A MOCK PAYMENT</p>
            <h2>
              Small invoice.
              <br />
              Real settlement.
            </h2>
            <p className="lead">
              Our first verified mainnet payment.
              <br />3 November 2026. Historical, not a live feed.
            </p>
            <a
              href={PROOF}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Inspect the deposit on Solscan ↗
            </a>
          </div>
          <div className="proof-docket">
            <div className="docket-meta">
              <span>PAYMENT TEST / 001</span>
              <span>DELIVERED ↙</span>
            </div>
            <PaperReveal className="docket-amount" direction="across">
              <small>Client deposited · Solana</small>
              <strong>
                <SettlementNumber value="2.020567" /> <span>USDC</span>
              </strong>
            </PaperReveal>
            <PaperReveal
              className="docket-amount payout"
              direction="across"
              delay={0.08}
            >
              <small>Invoice settled · Base</small>
              <strong>
                <SettlementNumber value="2.00" /> <span>USDC</span>
              </strong>
            </PaperReveal>
            <p>
              Exact output delivered. Excess auto-refunded. Payout amount
              documented in the project’s payment test record.
            </p>
          </div>
        </div>
      </section>
      <section className="create-section wrap" id="create">
        <div className="create-intro">
          <p className="eyebrow">OPEN FOR BUSINESS</p>
          <h2>
            Send the work.
            <br />
            <span>Then send this.</span>
          </h2>
          <p className="lead">
            Choose where your USDC should arrive. We’ll turn the invoice into a
            payment link.
          </p>
          <div className="create-note">
            <span aria-hidden="true">↳</span>
            <p>
              Keep your private dashboard link safe.
              <br />
              It is the key to your invoice records.
            </p>
          </div>
          <Link href="/pricing" className="text-link">
            Free during the hackathon. See costs →
          </Link>
        </div>
        <div className="create-panel">
          <CreateLinkForm />
        </div>
      </section>
      <section className="questions-section wrap">
        <div className="questions-heading">
          <p className="eyebrow">BEFORE YOU HIT SEND</p>
          <h2>
            The useful
            <br />
            small print.
          </h2>
          <Link href="/faq" className="text-link">
            All questions →
          </Link>
        </div>
        <FaqList />
      </section>
    </MarketingPage>
  );
}
