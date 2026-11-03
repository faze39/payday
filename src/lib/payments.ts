import { PAYOUT_CHAINS, isValidAddress } from "./chains";
import {
  UI_QUOTE_WINDOW_MS,
  buildQuoteRequest,
  getStatus,
  getTokens,
  requestQuote,
  type Token,
} from "./oneclick";
import { newDashboardToken, newId, newLinkId, hashToken } from "./secrets";
import { linkStatus, mapStatus } from "./status";
import { getStore, type PaymentAttempt, type PaymentLink, type Store } from "./store";
import type { CreateLinkInput } from "./validation";

export class UserError extends Error {
  constructor(message: string, public readonly status = 400, public readonly field?: string) {
    super(message);
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Pass `existingToken` to add the link to an existing dashboard; otherwise a new dashboard token is made. */
export async function createLink(
  input: CreateLinkInput,
  store: Store = getStore(),
  now = new Date(),
  existingToken?: string,
) {
  const dashboardToken = existingToken && existingToken.length >= 20 ? existingToken : newDashboardToken();
  const link: PaymentLink = {
    id: newLinkId(),
    ownerTokenHash: hashToken(dashboardToken),
    recipientAddress: input.recipientAddress,
    payoutChain: input.payoutChain,
    destAssetId: PAYOUT_CHAINS[input.payoutChain].usdcAssetId,
    amountUsd: input.amountUsd,
    amountBaseUnits: input.amountBaseUnits,
    description: input.description,
    clientRef: input.clientRef,
    expiresAt: new Date(now.getTime() + input.expiresInDays * DAY_MS).toISOString(),
    createdAt: now.toISOString(),
    paidAt: null,
  };
  await store.createLink(link);
  return { link, dashboardToken };
}

/** The fields a client may see. The owner token hash is never included. */
export function publicLink(link: PaymentLink, now = new Date()) {
  return {
    id: link.id,
    recipientAddress: link.recipientAddress,
    payoutChain: link.payoutChain,
    payoutChainName: PAYOUT_CHAINS[link.payoutChain].name,
    amountUsd: link.amountUsd,
    description: link.description,
    clientRef: link.clientRef,
    expiresAt: link.expiresAt,
    status: linkStatus(link, now),
  };
}

let tokenCache: { at: number; tokens: Token[] } | undefined;
export async function getCachedTokens(): Promise<Token[]> {
  if (tokenCache && Date.now() - tokenCache.at < 5 * 60 * 1000) return tokenCache.tokens;
  const tokens = await getTokens();
  tokenCache = { at: Date.now(), tokens };
  return tokens;
}

export async function createAttempt(
  linkId: string,
  body: { originAsset?: unknown; refundTo?: unknown },
  store: Store = getStore(),
) {
  const link = await store.getLink(linkId);
  if (!link) throw new UserError("This payment link does not exist.", 404);
  const st = linkStatus(link);
  if (st === "paid") throw new UserError("This link has already been paid.", 409);
  if (st === "expired") throw new UserError("This payment link has expired. Ask the freelancer for a new one.", 410);

  const originAsset = typeof body.originAsset === "string" ? body.originAsset : "";
  const token = (await getCachedTokens()).find((t) => t.assetId === originAsset);
  if (!token) throw new UserError("Choose a token to pay with.", 400, "originAsset");

  const refundTo = typeof body.refundTo === "string" ? body.refundTo.trim() : "";
  if (!isValidAddress(token.blockchain, refundTo))
    throw new UserError(
      `Enter a valid refund address on ${token.blockchain.toUpperCase()}. This should be the wallet you are paying from.`,
      400,
      "refundTo",
    );

  const req = buildQuoteRequest({
    originAsset: token.assetId,
    originChain: token.blockchain,
    destinationAsset: link.destAssetId,
    amountBaseUnits: link.amountBaseUnits,
    recipient: link.recipientAddress,
    refundTo,
    dry: false,
  });
  const res = await requestQuote(req);
  const q = res.quote;
  if (!q.depositAddress) throw new UserError("The swap service did not return a deposit address. Please try again.", 502);

  const now = new Date();
  const attempt: PaymentAttempt = {
    id: newId(),
    linkId: link.id,
    originAssetId: token.assetId,
    originChain: token.blockchain,
    originSymbol: token.symbol,
    refundTo,
    depositAddress: q.depositAddress,
    depositMemo: q.depositMemo ?? null,
    amountIn: q.amountIn,
    amountInFormatted: q.amountInFormatted,
    minAmountIn: q.minAmountIn,
    quoteExpiresAt: new Date(now.getTime() + UI_QUOTE_WINDOW_MS).toISOString(),
    correlationId: res.correlationId,
    status: "PENDING_DEPOSIT",
    amountOutFormatted: null,
    originTxs: [],
    destinationTxs: [],
    refundReason: null,
    refundedAmountFormatted: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await store.createAttempt(attempt);
  return { attempt, quote: q };
}

/** Fetch the latest status from 1Click, save it, and mark the link paid when the payment succeeds. */
export async function refreshAttempt(attemptId: string, store: Store = getStore()) {
  const attempt = await store.getAttempt(attemptId);
  if (!attempt) throw new UserError("Payment not found.", 404);
  if (!mapStatus(attempt.status).terminal) {
    const s = await getStatus(attempt.depositAddress, attempt.depositMemo ?? undefined);
    const d = s.swapDetails;
    const patch: Partial<PaymentAttempt> = {
      status: s.status,
      amountOutFormatted: d?.amountOutFormatted ?? null,
      originTxs: d?.originChainTxHashes ?? [],
      destinationTxs: d?.destinationChainTxHashes ?? [],
      refundReason: d?.refundReason ?? null,
      refundedAmountFormatted: d?.refundedAmountFormatted ?? null,
      updatedAt: new Date().toISOString(),
    };
    await store.updateAttempt(attempt.id, patch);
    Object.assign(attempt, patch);
    if (s.status === "SUCCESS") await store.markLinkPaid(attempt.linkId, attempt.updatedAt);
  }
  const link = await store.getLink(attempt.linkId);
  return { attempt, link, phase: mapStatus(attempt.status) };
}
