import type { OneClickStatus } from "./oneclick";

export type PaymentPhase = "awaiting_deposit" | "swapping" | "delivered" | "underpaid" | "refunded" | "failed";

export interface PhaseInfo {
  phase: PaymentPhase;
  label: string;
  /** What the person looking at the page should do next. */
  guidance: string;
  terminal: boolean;
}

const MAP: Record<OneClickStatus, PhaseInfo> = {
  PENDING_DEPOSIT: {
    phase: "awaiting_deposit",
    label: "Awaiting deposit",
    guidance: "Send the exact amount shown to the deposit address. This page updates automatically.",
    terminal: false,
  },
  KNOWN_DEPOSIT_TX: {
    phase: "swapping",
    label: "Deposit detected",
    guidance: "Your deposit was seen. Waiting for confirmation, then the swap starts.",
    terminal: false,
  },
  PROCESSING: {
    phase: "swapping",
    label: "Swapping",
    guidance: "NEAR Intents is converting and delivering USDC. Most payments finish within a few minutes.",
    terminal: false,
  },
  INCOMPLETE_DEPOSIT: {
    phase: "underpaid",
    label: "Underpaid",
    guidance:
      "Less than the required amount arrived. Send the remaining amount to the same address before the deadline, or the deposit will be refunded to your refund address.",
    terminal: false,
  },
  SUCCESS: {
    phase: "delivered",
    label: "Delivered",
    guidance: "USDC was delivered to the freelancer. Your receipt is ready.",
    terminal: true,
  },
  REFUNDED: {
    phase: "refunded",
    label: "Refunded",
    guidance: "The payment could not complete, so the deposit was returned to your refund address. Request a new quote to try again.",
    terminal: true,
  },
  FAILED: {
    phase: "failed",
    label: "Failed",
    guidance:
      "The swap failed. Check your refund address for returned funds and contact the freelancer with the deposit address shown below.",
    terminal: true,
  },
};

export function mapStatus(status: string): PhaseInfo {
  return (
    MAP[status as OneClickStatus] ?? {
      phase: "awaiting_deposit",
      label: "Checking…",
      guidance: `Unrecognised status "${status}". We will keep checking.`,
      terminal: false,
    }
  );
}

/** Link status shown on the dashboard. */
export type LinkStatus = "pending" | "paid" | "expired";

export function linkStatus(link: { paidAt: string | null; expiresAt: string }, now = new Date()): LinkStatus {
  if (link.paidAt) return "paid";
  return new Date(link.expiresAt) <= now ? "expired" : "pending";
}
