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
      "Less than the minimum amount for this quote has arrived. You can send the rest to the same deposit address; if the total is still below the minimum when the quote's deadline passes, the deposit is refunded to your refund address.",
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
    guidance: "The payment could not complete (for example, too little arrived before the deadline), so the deposit was returned to your refund address, minus any network refund fee. Request a new quote to try again.",
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

/**
 * Amounts reported by 1Click /v0/status swapDetails (documented fields depositedAmountFormatted,
 * refundedAmountFormatted). Not stored; read live for display only.
 */
export interface LiveAmounts {
  depositedAmountFormatted: string | null;
  refundedAmountFormatted: string | null;
}

/** Pick live amounts out of a status response's swapDetails, ignoring empty or zero values. */
export function liveAmounts(d: { depositedAmountFormatted?: string | null; refundedAmountFormatted?: string | null } | null | undefined): LiveAmounts {
  const clean = (v?: string | null) => (v && Number(v) > 0 ? v : null);
  return { depositedAmountFormatted: clean(d?.depositedAmountFormatted), refundedAmountFormatted: clean(d?.refundedAmountFormatted) };
}

/**
 * What the receipt shows as the client's payment: the amount actually deposited on-chain when 1Click reports it,
 * otherwise the quoted amount, labelled honestly as a quote.
 */
export function clientPaidView(quotedFormatted: string, live: LiveAmounts | null | undefined): { label: string; amount: string; actual: boolean } {
  if (live?.depositedAmountFormatted) return { label: "Client sent", amount: live.depositedAmountFormatted, actual: true };
  return { label: "Quoted amount", amount: quotedFormatted, actual: false };
}

/** Link status shown on the dashboard. */
export type LinkStatus = "pending" | "paid" | "expired";

export function linkStatus(link: { paidAt: string | null; expiresAt: string }, now = new Date()): LinkStatus {
  if (link.paidAt) return "paid";
  return new Date(link.expiresAt) <= now ? "expired" : "pending";
}
