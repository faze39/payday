import Link from "next/link";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { Reveal } from "@/components/motion";
import { TypedWord, SettlementObject } from "@/components/PaydayVisuals";
import { FeatureGrid, StepList, FaqList } from "@/components/MarketingContent";
const PROOF =
  "https://solscan.io/tx/547PEU3gUVs6qXJiJCPDniw64XRb8TicPRcZiymfpoD4MkPLobvvQ8XCMzB4ewkEuNeATda5uwTpRMxLZ2WMj61W";
export default function Home() {
  return (
    <div className="marketing">
      <section className="payday-hero">
        <div className="hero-frame">
          <div className="hero-topline">
            <span>
              <i /> Live on mainnet
            </span>
            <span>PAYMENT LINKS / NEAR INTENTS</span>
          </div>
          <div className="hero-layout">
            <div className="hero-copy">
              <p className="eyebrow">For people who work across borders</p>
              <h1>
                Get paid for
                <br />
                <TypedWord />
                <br />
                not in excuses.
              </h1>
              <p className="lead">
                Your client pays with a token they hold.
                <br />
                You receive USDC. One link handles the rest.
              </p>
              <div className="hero-actions">
                <Link href="#create" className="btn-primary">
                  Create a payment link ↗
                </Link>
                <Link href="/how-it-works" className="text-link">
                  See how it works →
                </Link>
              </div>
              <p className="hero-footnote">
                No sign-up. No custody. No Payday fee during the hackathon.
              </p>
            </div>
            <SettlementObject />
          </div>
          <div className="hero-bottomline">
            <span>INVOICE IN USD</span>
            <span className="hero-line" />
            <span>SETTLE IN USDC</span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap two-col">
          <Reveal>
            <p className="eyebrow">Built around your wallet</p>
            <h2 className="display">
              The work is yours.
              <br />
              The money <em className="accent">should be too.</em>
            </h2>
            <p className="lead">
              Built by a Nigerian freelancer tired of asking clients to bridge
              tokens just to pay an invoice.
            </p>
            <ul className="trust-list">
              <li>Receive USDC on Base, Arbitrum, NEAR or Solana.</li>
              <li>Your client chooses from the live supported token list.</li>
              <li>Payday never holds funds or private keys.</li>
            </ul>
            <a
              href={PROOF}
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              See the first mainnet deposit ↗
            </a>
          </Reveal>
          <Reveal>
            <SettlementObject compact />
          </Reveal>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Small details. Fewer loose ends.</p>
            <h2 className="display">
              From the first link
              <br />
              to the <em className="accent">last line item.</em>
            </h2>
          </Reveal>
          <FeatureGrid />
          <Link href="/features" className="text-link">
            Explore the features →
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="wrap two-col top">
          <div className="sticky-heading">
            <p className="eyebrow">How it works / 01–04</p>
            <h2 className="display">
              You send a link.
              <br />
              <em className="accent">We keep it simple.</em>
            </h2>
            <p className="lead">
              No shared exchange account. No chain negotiation. Just a quote, a
              deposit and a receipt.
            </p>
            <Link href="/how-it-works" className="text-link">
              Follow the payment →
            </Link>
          </div>
          <StepList />
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <Reveal>
            <div className="ledger-heading">
              <div>
                <p className="eyebrow">On-chain, not just on this page</p>
                <h2 className="display">
                  A payment.
                  <br />
                  <em className="accent">A paper trail.</em>
                </h2>
              </div>
              <p className="lead">
                Our first verified mainnet payment, recorded on 3 November 2026.
                A historical record, not a live activity feed.
              </p>
            </div>
            <div className="ledger">
              <div className="ledger-labels">
                <span>PAYMENT RECORD / 001</span>
                <span className="status-dot">Delivered</span>
              </div>
              <div className="ledger-row">
                <span>01</span>
                <span>
                  Client deposit <small>Solana · USDC</small>
                </span>
                <a href={PROOF} target="_blank" rel="noreferrer">
                  2.020567 USDC ↗
                </a>
              </div>
              <div className="ledger-row">
                <span>02</span>
                <span>
                  Invoice settled <small>Base · USDC</small>
                </span>
                <strong>2.00 USDC</strong>
              </div>
              <p className="ledger-note">
                The deposit explorer link is public. The payout amount is
                documented in the project’s payment test record. Excess was
                auto-refunded.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section">
        <div className="wrap two-col top">
          <Reveal>
            <p className="eyebrow">The terms, in plain language</p>
            <h2 className="display">
              Know what
              <br />
              <em className="accent">moves your money.</em>
            </h2>
          </Reveal>
          <dl className="definition-list">
            <div>
              <dt>Payment link</dt>
              <dd>
                A public invoice with an amount, description and receiving
                wallet. Share it with your client.
              </dd>
            </div>
            <div>
              <dt>NEAR Intents</dt>
              <dd>
                The settlement network behind 1Click. Solvers swap and bridge
                the client’s deposit into your USDC payout.
              </dd>
            </div>
            <div>
              <dt>Exact output</dt>
              <dd>
                Your invoice amount is the USDC amount to deliver. The quote
                calculates what your client needs to send.
              </dd>
            </div>
            <div>
              <dt>Non-custodial</dt>
              <dd>
                No Payday balance to withdraw. Settlement goes to your wallet,
                and your keys stay yours.
              </dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="section" id="create">
        <div className="wrap two-col top">
          <div className="sticky-heading">
            <p className="eyebrow">Start with the amount</p>
            <h2 className="display">
              Good work.
              <br />
              <em className="accent">Now get paid.</em>
            </h2>
            <p className="lead">
              Choose where your USDC should arrive. Keep your private dashboard
              link safe.
            </p>
            <Link className="text-link" href="/pricing">
              What does it cost? →
            </Link>
          </div>
          <div className="create-panel">
            <CreateLinkForm />
          </div>
        </div>
      </section>
      <section className="faq-band">
        <div className="wrap two-col top">
          <div>
            <p className="eyebrow">Before you send it</p>
            <h2>
              Fair questions.
              <br />
              <em>Straight answers.</em>
            </h2>
            <Link href="/faq" className="text-link">
              Read all FAQs →
            </Link>
          </div>
          <FaqList />
        </div>
      </section>
    </div>
  );
}
