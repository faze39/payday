import type { PayoutChainId } from "../chains";
import type { OneClickStatus, TxDetails } from "../oneclick";

export interface PaymentLink {
  id: string;
  ownerTokenHash: string;
  recipientAddress: string;
  payoutChain: PayoutChainId;
  destAssetId: string;
  amountUsd: string;
  amountBaseUnits: string;
  description: string;
  clientRef: string;
  expiresAt: string;
  createdAt: string;
  paidAt: string | null;
}

export interface PaymentAttempt {
  id: string;
  linkId: string;
  originAssetId: string;
  originChain: string;
  originSymbol: string;
  refundTo: string;
  depositAddress: string;
  depositMemo: string | null;
  amountIn: string;
  amountInFormatted: string;
  minAmountIn: string;
  quoteExpiresAt: string;
  correlationId: string;
  status: OneClickStatus;
  amountOutFormatted: string | null;
  originTxs: TxDetails[];
  destinationTxs: TxDetails[];
  refundReason: string | null;
  refundedAmountFormatted: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  createLink(link: PaymentLink): Promise<void>;
  getLink(id: string): Promise<PaymentLink | null>;
  listLinksByOwner(ownerTokenHash: string): Promise<PaymentLink[]>;
  markLinkPaid(id: string, paidAt: string): Promise<void>;
  createAttempt(attempt: PaymentAttempt): Promise<void>;
  getAttempt(id: string): Promise<PaymentAttempt | null>;
  listAttemptsByLink(linkId: string): Promise<PaymentAttempt[]>;
  updateAttempt(id: string, patch: Partial<PaymentAttempt>): Promise<void>;
}
