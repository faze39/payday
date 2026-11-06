"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useInView,
  type Variants,
} from "motion/react";
import { PAPER_EASE, useMarketingMotion } from "@/components/marketing-motion";

export const API_EXAMPLES = [
  {
    label: "Read",
    method: "GET",
    path: "/api/invoices/:id",
    response:
      '{\n  "schema": "payday.invoice.v1",\n  "id": "<invoice-id>",\n  "amount": { "currency": "USDC" }\n}',
    note: "Read the invoice before choosing a supported deposit asset.",
  },
  {
    label: "Quote",
    method: "POST",
    path: "/api/invoices/:id/pay",
    response:
      '{\n  "originAsset": "<supported-asset-id>",\n  "refundTo": "<client-refund-address>"\n}',
    note: "Example request body. A real call returns the live quote and deposit instructions.",
  },
  {
    label: "Track",
    method: "GET",
    path: "/api/attempts/:id",
    response:
      '{\n  "phase": {\n    "phase": "awaiting_deposit",\n    "terminal": false\n  }\n}',
    note: "Example response only. The agent still sends the deposit from its own wallet.",
  },
] as const;
const letterVariants: Variants = {
  enter: { opacity: 0 },
  ready: { opacity: 1, transition: { duration: 0.2, ease: PAPER_EASE } },
};

/** Types a documentation command, never a headline or a network request. */
function Command({ text }: { text: string }) {
  const enabled = useMarketingMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const controls = useAnimationControls();
  useEffect(() => {
    if (!enabled) {
      controls.set("ready");
      return;
    }
    if (!inView) return;
    controls.set("enter");
    void controls.start("ready");
    return () => controls.stop();
  }, [controls, enabled, inView, text]);
  return (
    <code className="example-command" ref={ref}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={controls}
        variants={{
          ready: {
            transition: {
              staggerChildren: Math.min(0.008, 0.38 / text.length),
            },
          },
        }}
      >
        {Array.from(text).map((letter, i) => (
          <motion.span key={`${i}-${letter}`} variants={letterVariants}>
            {letter}
          </motion.span>
        ))}
      </motion.span>
    </code>
  );
}

/** Static documentation examples. Selection makes zero requests and moves no money. */
export function ApiWorkbench() {
  const [selected, setSelected] = useState(0);
  const enabled = useMarketingMotion();
  const example = API_EXAMPLES[selected];
  const response = (
    <div>
      <p className="example-response-label">
        {selected === 1 ? "EXAMPLE REQUEST BODY" : "EXAMPLE RESPONSE EXCERPT"}
      </p>
      <pre>{example.response}</pre>
      <p className="example-note">{example.note}</p>
    </div>
  );
  return (
    <div className="endpoint-sheet animated-workbench">
      <p className="tiny-label">INVOICE API / DOCUMENTATION EXAMPLES</p>
      <div
        className="example-selector"
        role="group"
        aria-label="API documentation examples"
      >
        {API_EXAMPLES.map((item, i) => (
          <motion.button
            type="button"
            key={item.label}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
            whileTap={enabled ? { scale: 0.96 } : undefined}
            transition={{ duration: enabled ? 0.2 : 0, ease: PAPER_EASE }}
          >
            {item.label}
            <motion.span
              aria-hidden="true"
              className="example-step-rule"
              initial={false}
              animate={{ scaleX: selected === i ? 1 : 0 }}
              transition={{ duration: enabled ? 0.3 : 0, ease: PAPER_EASE }}
            />
          </motion.button>
        ))}
      </div>
      <Command key={example.path} text={`${example.method} ${example.path}`} />
      <div
        className="example-response"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {enabled ? (
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={example.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25, ease: PAPER_EASE }}
            >
              {response}
            </motion.div>
          </AnimatePresence>
        ) : (
          response
        )}
      </div>
      <p className="example-disclaimer">
        Illustrative snippets, not live activity. No request is sent and no
        payment is simulated.
      </p>
    </div>
  );
}
