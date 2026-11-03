import type { PaymentAttempt } from "./store/types";
import type { PhaseInfo } from "./status";

export interface PublicLink {
  id: string;
  recipientAddress: string;
  payoutChain: string;
  payoutChainName: string;
  amountUsd: string;
  description: string;
  clientRef: string;
  expiresAt: string;
  status: "pending" | "paid" | "expired";
}

export interface AttemptView {
  attempt: PaymentAttempt;
  phase: PhaseInfo;
  link: PublicLink | null;
}

export interface TokenOption {
  assetId: string;
  symbol: string;
  blockchain: string;
  decimals: number;
  price: number;
}
