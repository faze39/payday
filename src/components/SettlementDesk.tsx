"use client";

import { useState } from "react";

const SOURCES = [
  { token: "SOL", chain: "Solana" },
  { token: "ETH", chain: "Arbitrum" },
  { token: "USDT", chain: "Tron" },
] as const;

/** An explanatory route, never a quote or a simulated payment status. */
export function SettlementDesk() {
  const [selected, setSelected] = useState(0);
  const source = SOURCES[selected];
  return (
    <div className="settlement-desk">
      <div className="desk-heading">
        <span>THE PAYMENT, SIMPLIFIED</span>
        <span aria-hidden="true">↙</span>
      </div>
      <div
        className="source-picker"
        role="group"
        aria-label="Illustrate a payment token"
      >
        {SOURCES.map((item, i) => (
          <button
            type="button"
            key={item.token}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            {item.token}
          </button>
        ))}
      </div>
      <div className="route-track" key={source.token} aria-hidden="true">
        <span>{source.chain}</span>
        <i />
        <span>NEAR Intents</span>
        <b>↓</b>
      </div>
      <div className="payment-slip" aria-live="polite" aria-atomic="true">
        <div className="slip-top">
          <span>PAYDAY / PAYMENT LINK</span>
          <span>↗</span>
        </div>
        <p className="slip-label">Your work, settled in</p>
        <p className="slip-currency">
          USDC<span>↙</span>
        </p>
        <div className="slip-rule" />
        <dl>
          <div>
            <dt>Client pays</dt>
            <dd>
              {source.token} on {source.chain}
            </dd>
          </div>
          <div>
            <dt>You receive</dt>
            <dd>USDC on Base</dd>
          </div>
          <div>
            <dt>Destination</dt>
            <dd>Your wallet</dd>
          </div>
        </dl>
        <div className="slip-bottom">
          <span>
            No Payday balance.
            <br />
            Nothing to withdraw.
          </span>
          <svg viewBox="0 0 90 30" width="90" height="30" aria-hidden="true">
            <path
              d="M1 0v30m4-30v30m7-30v30m3-30v30m7-30v30m5-30v30m3-30v30m8-30v30m4-30v30m6-30v30m3-30v30m8-30v30m5-30v30m4-30v30m7-30v30m5-30v30m3-30v30m5-30v30"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <p className="desk-caption">
        Route illustration. Choose a token to explore.
        <br />
        Actual availability and costs come from a live quote.
      </p>
    </div>
  );
}
