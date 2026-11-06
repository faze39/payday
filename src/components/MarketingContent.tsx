import Link from "next/link";
export const FEATURES = [
  {
    title: "A link, not a negotiation",
    body: "Set your price in USD. Share one link without agreeing on a token or network first.",
    path: "M8 12h8m-5-5 5 5-5 5M7 5H4v14h3m10-14h3v14h-3",
  },
  {
    title: "Their token. Your USDC.",
    body: "Clients choose from the live 1Click token list. You receive USDC on your chosen payout chain.",
    path: "M4 7h15l-4-4M20 17H5l4 4M4 7v5m16 5v-5",
  },
  {
    title: "An invoice that adds up",
    body: "Add line items for the work you delivered. They follow the invoice through to the receipt.",
    path: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6",
  },
  {
    title: "Keep your own keys",
    body: "Payday does not hold your funds or private keys. Settlement goes to your receiving wallet.",
    path: "m12 3 8 3v6c0 4-8 9-8 9s-8-5-8-9V6l8-3Zm-4 9 3 3 5-6",
  },
  {
    title: "Records, ready to export",
    body: "Track paid, pending and refunded links. Export a CSV with transaction explorer links.",
    path: "M4 4h16v16H4V4Zm0 5h16M9 9v11m5-11v11",
  },
  {
    title: "A path for agents, too",
    body: "Read invoice JSON, start a payment attempt and poll its status through the existing API.",
    path: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16",
  },
];
export const STEPS = [
  {
    title: "Name your price",
    body: "Enter a USD amount, a description and your USDC wallet. Add line items if you need them.",
  },
  {
    title: "Send the link",
    body: "Your client picks a supported token, adds a refund address and gets a live quote.",
  },
  {
    title: "Let the payment move",
    body: "The client sends the quoted amount to a unique deposit address. NEAR Intents handles the swap and bridge.",
  },
  {
    title: "Close the invoice",
    body: "USDC arrives in your wallet. Track the status and keep a receipt with transaction links.",
  },
];
export const FAQS = [
  {
    q: "Does Payday hold my money?",
    a: "No. Payday requests quotes and reads status from NEAR Intents 1Click. Funds move through a unique deposit address to your wallet. Payday never holds your keys.",
  },
  {
    q: "Where can I receive USDC?",
    a: "Base is the default. You can also receive USDC on Arbitrum, NEAR or Solana. Your client can use any token and network supported by the live quote service.",
  },
  {
    q: "What does it cost?",
    a: "Payday is free during the hackathon. There is no Payday subscription or platform cut. Network gas, solver and withdrawal costs still apply. Review the live quote before sending funds.",
  },
  {
    q: "Do I need to sign up?",
    a: "No account is needed to create a link. Your browser stores a secret dashboard key. Keep the private dashboard link safe: anyone with the key can view your invoices.",
  },
  {
    q: "What if a payment goes wrong?",
    a: "Incomplete deposits show guidance to top up or wait for a refund. Overpayments are refunded to the client’s refund address. Failed attempts show a reason and a way to try again.",
  },
  {
    q: "How long does a quote last?",
    a: "About 30 minutes. When it expires, request a new quote before sending. A payment already sent continues to be tracked.",
  },
  {
    q: "Can an agent pay an invoice?",
    a: "Yes. GET /api/invoices/:id reads an invoice, POST /api/invoices/:id/pay starts a payment, and GET /api/attempts/:id reads status. The agent still needs to send the quoted deposit from its own wallet.",
  },
  {
    q: "Is the invoice registry deployed?",
    a: "Not yet. NEAR invoice-registry contract code is a scaffold in the repository. It is separate from the working payment-link and settlement flow.",
  },
];
export function FeatureGrid() {
  return (
    <div className="feature-grid">
      {FEATURES.map((item, i) => (
        <article className="feature-card" key={item.title}>
          <span className="feature-index">
            {String(i + 1).padStart(2, "0")}
          </span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={item.path} />
          </svg>
          <div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
export function StepList() {
  return (
    <ol className="payment-stages">
      {STEPS.map((item, i) => (
        <li key={item.title} className="step-row">
          <span className="step-num">
            {["CREATE", "SHARE", "ROUTE", "RECEIVE"][i]}
          </span>
          <div>
            <h3>{item.title}</h3>
            <p className="lead">{item.body}</p>
          </div>
          <span className="step-arrow" aria-hidden="true">
            ↗
          </span>
        </li>
      ))}
    </ol>
  );
}
export function FaqList({ all = false }: { all?: boolean }) {
  return (
    <div className="faq-list">
      {FAQS.slice(0, all ? undefined : 4).map((item, i) => (
        <details className="faq-item" key={item.q} id={`question-${i + 1}`}>
          <summary>
            <span className="faq-index">{String(i + 1).padStart(2, "0")}</span>
            <span>{item.q}</span>
          </summary>
          <p className="faq-body">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
export function MarketingCta() {
  return (
    <div className="marketing-cta">
      <div>
        <p className="eyebrow">WORK DONE? NEXT STEP.</p>
        <h2>Put a link on it.</h2>
      </div>
      <Link className="btn-primary" href="/#create">
        Create a payment link <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
