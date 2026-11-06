import { PAYOUT_CHAINS, isValidAddress } from "./chains";
import {
  UI_QUOTE_WINDOW_MS,
  buildQuoteRequest,
  getStatus,
  getTokens,
  requestQuote,
  type Token,
} from "./oneclick";
import { recordInvoiceSettlement } from "./near-registry";
import { newDashboardToken, newId, newLinkId, hashToken } from "./secrets";
import { linkStatus, mapStatus, liveAmounts, type LiveAmounts } from "./status";
import { getStore, type PaymentAttempt, type PaymentLink, type Store } from "./store";
import type { CreateLinkInput } from "./validation";
import { txExplorerUrl } from "./explorer";

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
    lineItems: input.lineItems,
    expiresAt: new Date(now.getTime() + input.expiresInDays * DAY_MS).toISOString(),
    createdAt: now.toISOString(),
    paidAt: null,
    nearRecordTx: null,
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
    lineItems: link.lineItems ?? [],
    expiresAt: link.expiresAt,
    status: linkStatus(link, now),
    nearRecordTx: link.nearRecordTx,
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
  return { attempt, quote: q, link };
}

/** Fetch the latest status from 1Click, save it, and mark the link paid when the payment succeeds. */
export async function refreshAttempt(attemptId: string, store: Store = getStore(), opts: { withLiveAmounts?: boolean } = {}) {
  const attempt = await store.getAttempt(attemptId);
  if (!attempt) throw new UserError("Payment not found.", 404);
  let live: LiveAmounts | null = null;
  let justSucceeded = false;
  if (!mapStatus(attempt.status).terminal) {
    const s = await getStatus(attempt.depositAddress, attempt.depositMemo ?? undefined);
    const d = s.swapDetails;
    live = liveAmounts(d);
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
    if (s.status === "SUCCESS") {
      await store.markLinkPaid(attempt.linkId, attempt.updatedAt);
      justSucceeded = true;
    }
  } else if (opts.withLiveAmounts) {
    // Finished payments are not re-saved; this read only feeds the receipt's amounts and may fail harmlessly.
    live = await getStatus(attempt.depositAddress, attempt.depositMemo ?? undefined)
      .then((s) => liveAmounts(s.swapDetails))
      .catch(() => null);
  }
  let link = await store.getLink(attempt.linkId);
  if (justSucceeded && link && !link.nearRecordTx) {
    const recorded = await recordInvoiceSettlement(link, attempt);
    if (recorded.ok && recorded.txHash) {
      await store.setLinkNearRecordTx(link.id, recorded.txHash);
      link = { ...link, nearRecordTx: recorded.txHash };
    }
  }
  return { attempt, link, phase: mapStatus(attempt.status), live };
}

/**
 * A link as the payer sees it, plus the receipt id of the attempt that paid it
 * (receipts are addressed by attempt id), so a paid link can point to its receipt.
 */
export async function getLinkView(id: string, store: Store = getStore(), now = new Date()) {
  const link = await store.getLink(id);
  if (!link) return null;
  const view = publicLink(link, now);
  let receiptId: string | null = null;
  if (view.status === "paid") {
    const attempts = await store.listAttemptsByLink(id);
    receiptId = attempts.find((a) => a.status === "SUCCESS")?.id ?? null;
  }
  return { ...view, receiptId };
}

/** Machine-readable invoice for agents (and humans). */
export function agentInvoiceView(
  link: PaymentLink,
  opts: {
    baseUrl: string;
    now?: Date;
    latestAttempt?: PaymentAttempt | null;
  },
) {
  const now = opts.now ?? new Date();
  const pub = publicLink(link, now);
  const attempt = opts.latestAttempt ?? null;
  const phase = attempt ? mapStatus(attempt.status) : null;
  const depositTx =
    attempt?.originTxs[0] && txExplorerUrl(attempt.originChain, attempt.originTxs[0].hash, attempt.originTxs[0].explorerUrl);
  const deliveryTx =
    attempt?.destinationTxs[0] &&
    txExplorerUrl(link.payoutChain, attempt.destinationTxs[0].hash, attempt.destinationTxs[0].explorerUrl);

  return {
    schema: "payday.invoice.v1",
    id: link.id,
    status: pub.status,
    amount: { usd: link.amountUsd, currency: "USDC", payoutChain: link.payoutChain, payoutChainName: pub.payoutChainName },
    recipient: link.recipientAddress,
    description: link.description,
    clientRef: link.clientRef || null,
    lineItems: link.lineItems ?? [],
    expiresAt: link.expiresAt,
    payUrl: `${opts.baseUrl}/pay/${link.id}`,
    humanReceiptUrl: attempt?.status === "SUCCESS" ? `${opts.baseUrl}/receipt/${attempt.id}` : null,
    agent: {
      /** GET this URL for the same JSON. */
      self: `${opts.baseUrl}/api/invoices/${link.id}`,
      /**
       * POST { originAsset, refundTo } to create a 1Click quote (same as /api/links/:id/quote).
       * Response includes depositAddress and amountInFormatted the agent must send.
       */
      quoteUrl: `${opts.baseUrl}/api/invoices/${link.id}/pay`,
      /** Poll GET /api/attempts/:attemptId after quoting. */
      statusHint: "After POST /pay, poll GET /api/attempts/{attemptId} until phase.terminal.",
    },
    latestAttempt: attempt
      ? {
          id: attempt.id,
          status: attempt.status,
          phase: phase?.phase ?? null,
          label: phase?.label ?? null,
          originSymbol: attempt.originSymbol,
          originChain: attempt.originChain,
          depositAddress: attempt.depositAddress,
          depositMemo: attempt.depositMemo,
          amountInFormatted: attempt.amountInFormatted,
          amountOutFormatted: attempt.amountOutFormatted,
          quoteExpiresAt: attempt.quoteExpiresAt,
          depositTxUrl: depositTx || null,
          deliveryTxUrl: deliveryTx || null,
        }
      : null,
    nearRecordTx: link.nearRecordTx,
    notes: [
      "Non-custodial: Payday never holds funds. Settlement is via NEAR Intents 1Click (https://1click.chaindefuser.com).",
      "PingPay x402 / Agent Connect is a separate facilitator that also routes through Intents; Payday exposes this native JSON surface so agents can pay without a Ping API key. See docs/agent-payments.md.",
    ],
  };
}
