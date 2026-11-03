/**
 * Minimal client for the NEAR Intents 1Click API.
 * Spec: https://1click.chaindefuser.com/docs/v0/openapi.yaml
 * Only endpoints and fields present in that spec are used here.
 */
export const ONECLICK_BASE_URL = process.env.ONECLICK_BASE_URL ?? "https://1click.chaindefuser.com";

export interface Token {
  assetId: string;
  decimals: number;
  blockchain: string;
  symbol: string;
  price: number;
  priceUpdatedAt: string;
  contractAddress?: string;
}

export interface QuoteRequest {
  dry: boolean;
  swapType: "EXACT_OUTPUT";
  slippageTolerance: number;
  originAsset: string;
  depositType: "ORIGIN_CHAIN";
  destinationAsset: string;
  amount: string;
  refundTo: string;
  refundType: "ORIGIN_CHAIN";
  recipient: string;
  recipientType: "DESTINATION_CHAIN";
  deadline: string;
  depositMode?: "SIMPLE" | "MEMO";
  referral?: string;
}

export interface Quote {
  amountIn: string;
  amountInFormatted: string;
  amountInUsd: string;
  minAmountIn: string;
  amountOut: string;
  amountOutFormatted: string;
  amountOutUsd: string;
  minAmountOut: string;
  timeEstimate: number;
  refundFee?: string;
  withdrawFee?: string;
  depositAddress?: string;
  depositMemo?: string;
  deadline?: string;
  timeWhenInactive?: string;
}

export interface QuoteResponse {
  quote: Quote;
  quoteRequest: QuoteRequest;
  signature: string;
  timestamp: string;
  correlationId: string;
}

export type OneClickStatus =
  | "KNOWN_DEPOSIT_TX"
  | "PENDING_DEPOSIT"
  | "INCOMPLETE_DEPOSIT"
  | "PROCESSING"
  | "SUCCESS"
  | "REFUNDED"
  | "FAILED";

export interface TxDetails {
  hash: string;
  explorerUrl: string;
}

export interface SwapDetails {
  depositedAmountFormatted?: string | null;
  amountInFormatted?: string | null;
  amountOut?: string | null;
  amountOutFormatted?: string | null;
  refundedAmountFormatted?: string | null;
  refundReason?: string | null;
  originChainTxHashes: TxDetails[];
  destinationChainTxHashes: TxDetails[];
  nearTxHashes: string[];
}

export interface StatusResponse {
  status: OneClickStatus;
  updatedAt: string;
  correlationId: string;
  swapDetails: SwapDetails;
}

/** Chains whose deposits need a memo (per the spec, e.g. Stellar). */
const MEMO_CHAINS = new Set(["stellar"]);

/** How long the deadline sent to 1Click lasts. Refunds start after it, so it is longer than the 30-minute UI window. */
export const QUOTE_DEADLINE_MS = 60 * 60 * 1000;
/** How long the pay page shows a quote before asking the client to refresh it. */
export const UI_QUOTE_WINDOW_MS = 30 * 60 * 1000;
export const SLIPPAGE_BPS = 100;

export function buildQuoteRequest(input: {
  originAsset: string;
  originChain: string;
  destinationAsset: string;
  amountBaseUnits: string;
  recipient: string;
  refundTo: string;
  dry: boolean;
  now?: Date;
}): QuoteRequest {
  if (!/^[1-9]\d*$/.test(input.amountBaseUnits)) {
    throw new Error("amountBaseUnits must be a positive integer string");
  }
  const now = input.now ?? new Date();
  const req: QuoteRequest = {
    dry: input.dry,
    swapType: "EXACT_OUTPUT",
    slippageTolerance: SLIPPAGE_BPS,
    originAsset: input.originAsset,
    depositType: "ORIGIN_CHAIN",
    destinationAsset: input.destinationAsset,
    amount: input.amountBaseUnits,
    refundTo: input.refundTo.trim(),
    refundType: "ORIGIN_CHAIN",
    recipient: input.recipient.trim(),
    recipientType: "DESTINATION_CHAIN",
    deadline: new Date(now.getTime() + QUOTE_DEADLINE_MS).toISOString(),
    referral: "payday",
  };
  if (MEMO_CHAINS.has(input.originChain)) req.depositMode = "MEMO";
  return req;
}

export class OneClickError extends Error {
  constructor(message: string, public readonly httpStatus: number) {
    super(message);
  }
}

function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const key = process.env.ONECLICK_API_KEY;
  if (key) h["X-API-Key"] = key;
  return h;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ONECLICK_BASE_URL}${path}`, { ...init, headers: headers(), cache: "no-store" });
  const text = await res.text();
  if (!res.ok) {
    let message = `1Click API error (${res.status})`;
    try {
      const body = JSON.parse(text);
      if (body?.message) message = String(body.message);
    } catch {
      /* non-JSON body: keep the generic message */
    }
    throw new OneClickError(message, res.status);
  }
  return JSON.parse(text) as T;
}

export const getTokens = () => call<Token[]>("/v0/tokens");

export const requestQuote = (req: QuoteRequest) =>
  call<QuoteResponse>("/v0/quote", { method: "POST", body: JSON.stringify(req) });

export function getStatus(depositAddress: string, depositMemo?: string) {
  const q = new URLSearchParams({ depositAddress });
  if (depositMemo) q.set("depositMemo", depositMemo);
  return call<StatusResponse>(`/v0/status?${q}`);
}
