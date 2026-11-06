import type { LineItem } from "./line-items";
import type { PaymentAttempt } from "./store/types";
import type { LiveAmounts, PhaseInfo } from "./status";

export interface PublicLink {
  id: string;
  recipientAddress: string;
  payoutChain: string;
  payoutChainName: string;
  amountUsd: string;
  description: string;
  clientRef: string;
  lineItems?: LineItem[];
  expiresAt: string;
  status: "pending" | "paid" | "expired";
  /** Attempt id of the payment that settled this link (only from GET /api/links/[id]). */
  receiptId?: string | null;
  nearRecordTx?: string | null;
}

export interface AttemptView {
  attempt: PaymentAttempt;
  phase: PhaseInfo;
  link: PublicLink | null;
  /** Live on-chain amounts from 1Click status, when available. */
  live?: LiveAmounts | null;
}

export interface TokenOption {
  assetId: string;
  symbol: string;
  blockchain: string;
  decimals: number;
  price: number;
}

export interface DashboardAttemptSummary {
  id: string;
  status: string;
  phase: string;
  label: string;
  originSymbol: string;
  originChain: string;
  amountInFormatted: string;
  amountOutFormatted: string | null;
  depositTxUrl: string | null;
  deliveryTxUrl: string | null;
  refundReason: string | null;
  updatedAt: string;
}

export type DashboardRow = PublicLink & {
  receivedUsdc: string | null;
  paidAttemptId: string | null;
  attempts: number;
  latestAttempt: DashboardAttemptSummary | null;
};
