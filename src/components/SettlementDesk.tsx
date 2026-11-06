"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useAnimationControls,
  type Variants,
} from "motion/react";
import { PAPER_EASE, useMarketingMotion } from "@/components/marketing-motion";

const SOURCES = [
  { token: "SOL", chain: "Solana" },
  { token: "ETH", chain: "Arbitrum" },
  { token: "USDT", chain: "Tron" },
] as const;
const slipVariants: Variants = {
  enter: { y: 26, rotate: -1.5, opacity: 0.5 },
  ready: {
    y: 0,
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: PAPER_EASE,
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
};
const fieldVariants: Variants = {
  enter: { y: 9, opacity: 0.25 },
  ready: { y: 0, opacity: 1, transition: { duration: 0.4, ease: PAPER_EASE } },
};

/** An explanatory route, never a quote or a simulated payment status. */
export function SettlementDesk() {
  const [selected, setSelected] = useState(0);
  const enabled = useMarketingMotion();
  const controls = useAnimationControls();
  const source = SOURCES[selected];
  useEffect(() => {
    if (!enabled) {
      controls.set("ready");
      return;
    }
    controls.set("enter");
    void controls.start("ready");
    return () => controls.stop();
  }, [controls, enabled]);

  const payer = (
    <span>
      {source.token} on {source.chain}
    </span>
  );
  return (
    <div className="settlement-desk">
      <div className="desk-heading">
        <span>THE PAYMENT, SIMPLIFIED</span>
        <span aria-hidden="true">↙</span>
      </div>
      <LayoutGroup id="payment-token-picker">
        <div
          className="source-picker"
          role="group"
          aria-label="Illustrate a payment token"
        >
          {SOURCES.map((item, i) => (
            <motion.button
              type="button"
              key={item.token}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              whileTap={enabled ? { scale: 0.94 } : undefined}
              transition={{ duration: enabled ? 0.2 : 0, ease: PAPER_EASE }}
            >
              {selected === i ? (
                <motion.span
                  className="token-selection"
                  aria-hidden="true"
                  layoutId={enabled ? "token-selection" : undefined}
                  transition={{ duration: enabled ? 0.3 : 0, ease: PAPER_EASE }}
                />
              ) : null}
              <span className="token-name">{item.token}</span>
            </motion.button>
          ))}
        </div>
      </LayoutGroup>
      <div className="route-track" key={source.token} aria-hidden="true">
        <span>{source.chain}</span>
        <i />
        <span>NEAR Intents</span>
        <b>↓</b>
      </div>
      <motion.div
        className="payment-slip"
        aria-live="polite"
        aria-atomic="true"
        initial={false}
        animate={controls}
        variants={slipVariants}
      >
        <motion.div variants={fieldVariants} className="slip-top">
          <span>PAYDAY / PAYMENT LINK</span>
          <span aria-hidden="true">↗</span>
        </motion.div>
        <motion.p variants={fieldVariants} className="slip-label">
          Your work, settled in
        </motion.p>
        <motion.p variants={fieldVariants} className="slip-currency">
          USDC<span aria-hidden="true">↙</span>
        </motion.p>
        <div className="slip-rule" />
        <dl>
          <motion.div variants={fieldVariants}>
            <dt>Client pays</dt>
            <dd className="payer-transition">
              {enabled ? (
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    className="payer-label"
                    key={source.token}
                    initial={{ y: 9, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -7, opacity: 0 }}
                    transition={{ duration: 0.2, ease: PAPER_EASE }}
                  >
                    {payer}
                  </motion.span>
                </AnimatePresence>
              ) : (
                payer
              )}
            </dd>
          </motion.div>
          <motion.div variants={fieldVariants}>
            <dt>You receive</dt>
            <dd>USDC on Base</dd>
          </motion.div>
          <motion.div variants={fieldVariants}>
            <dt>Destination</dt>
            <dd>Your wallet</dd>
          </motion.div>
        </dl>
        <motion.div variants={fieldVariants} className="slip-bottom">
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
        </motion.div>
      </motion.div>
      <p className="desk-caption">
        Route illustration. Choose a token to explore.
        <br />
        Actual availability and costs come from a live quote.
      </p>
    </div>
  );
}
