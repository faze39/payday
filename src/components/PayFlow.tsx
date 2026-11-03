"use client";
import { useEffect, useState } from "react";
import type { AttemptView, PublicLink, TokenOption } from "@/lib/client-types";
import { Alert, Button, Card, CopyText, Field, api, inputClass } from "./ui";
import { NgnEstimate } from "./NgnEstimate";
import { StatusBadge } from "./StatusBadge";
import { TokenPicker } from "./TokenPicker";

const POLL_MS = 5000;

export function PayFlow({ linkId, initialAttemptId }: { linkId: string; initialAttemptId: string | null }) {
  const [link, setLink] = useState<PublicLink | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [originAsset, setOriginAsset] = useState("");
  const [refundTo, setRefundTo] = useState("");
  const [quoteError, setQuoteError] = useState<{ message: string; field?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<AttemptView | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(initialAttemptId);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    api<{ link: PublicLink }>(`/api/links/${linkId}`).then((r) => setLink(r.link)).catch((e) => setLoadError(e.message));
    api<{ tokens: TokenOption[] }>("/api/tokens").then((r) => setTokens(r.tokens)).catch((e) => setLoadError(`Could not load tokens: ${e.message}`));
  }, [linkId]);

  const terminal = view?.phase.terminal ?? false;
  useEffect(() => {
    if (!attemptId) return;
    const poll = () =>
      api<AttemptView>(`/api/attempts/${attemptId}`)
        .then(setView)
        .catch(() => {
          /* temporary network error: the next poll will try again */
        });
    const first = setTimeout(poll, 0);
    const t = setInterval(() => {
      setNow(Date.now());
      if (!terminal) poll();
    }, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [attemptId, terminal]);

  async function getQuote() {
    setBusy(true);
    setQuoteError(null);
    try {
      const r = await api<{ attempt: { id: string } }>(`/api/links/${linkId}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originAsset, refundTo }),
      });
      setView(null);
      setAttemptId(r.attempt.id);
      window.history.replaceState(null, "", `?a=${r.attempt.id}`);
    } catch (e) {
      setQuoteError({ message: (e as Error).message, field: (e as { body?: { field?: string } }).body?.field });
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    setAttemptId(null);
    setView(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  if (loadError && !link) return <Alert>{loadError}</Alert>;
  if (!link) return <p className="text-slate-500">Loading payment…</p>;

  const token = tokens.find((t) => t.assetId === originAsset);
  const a = view?.attempt;
  const quoteExpired = a ? new Date(a.quoteExpiresAt).getTime() <= now && view?.phase.phase === "awaiting_deposit" : false;
  const minsLeft = a ? Math.max(0, Math.ceil((new Date(a.quoteExpiresAt).getTime() - now) / 60000)) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm text-slate-500">{link.clientRef ? `Invoice for ${link.clientRef}` : "Payment request"}</p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">${link.amountUsd}</p>
        <NgnEstimate usd={Number(link.amountUsd)} />
        <p className="mt-3 text-slate-700">{link.description}</p>
        <p className="mt-3 text-xs text-slate-500">
          The freelancer receives {link.amountUsd} USDC on {link.payoutChainName} at <span className="break-all font-mono">{link.recipientAddress}</span>
        </p>
      </Card>

      {link.status === "paid" && !attemptId && (
        <Alert kind="success">
          This link has already been paid. Thank you!
          {link.receiptId && (
            <>
              {" "}
              <a className="font-semibold underline underline-offset-2" href={`/receipt/${link.receiptId}`}>View receipt</a>
            </>
          )}
        </Alert>
      )}
      {link.status === "expired" && !attemptId && <Alert kind="warn">This payment link has expired. Ask the freelancer to send a new one.</Alert>}

      {link.status === "pending" && !attemptId && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">1. Choose what you want to pay with</h2>
            {tokens.length ? <TokenPicker tokens={tokens} value={originAsset} onChange={setOriginAsset} /> : <p className="text-sm text-slate-500">Loading tokens…</p>}
            {token && (
              <Field
                label={`2. Your refund address on ${token.blockchain.toUpperCase()}`}
                hint="Use the wallet you are paying from. If the payment can't complete, your funds are returned here automatically."
                error={quoteError?.field === "refundTo" ? quoteError.message : undefined}
              >
                <input className={inputClass} value={refundTo} onChange={(e) => setRefundTo(e.target.value)} spellCheck={false} autoComplete="off" />
              </Field>
            )}
            {quoteError && quoteError.field !== "refundTo" && <Alert>{quoteError.message}</Alert>}
            <Button disabled={!token || !refundTo || busy} onClick={getQuote}>{busy ? "Getting live quote…" : "Get live quote"}</Button>
          </div>
        </Card>
      )}

      {attemptId && !a && <p className="text-slate-500">Loading payment status…</p>}

      {a && view && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Payment status</h2>
              <StatusBadge kind={view.phase.phase} label={view.phase.label} />
            </div>
            <Alert kind={view.phase.phase === "delivered" ? "success" : ["failed"].includes(view.phase.phase) ? "error" : ["underpaid", "refunded"].includes(view.phase.phase) ? "warn" : "info"}>
              {view.phase.guidance}
            </Alert>

            {view.phase.phase === "awaiting_deposit" && !quoteExpired && (
              <>
                <Field label={`Send exactly this amount of ${a.originSymbol} (${a.originChain.toUpperCase()} network)`}>
                  <CopyText value={a.amountInFormatted} label="amount" />
                </Field>
                <Field label="To this deposit address" hint="This address is unique to this payment. Send only on the network shown above.">
                  <CopyText value={a.depositAddress} label="deposit address" />
                </Field>
                {a.depositMemo && (
                  <Field label="Memo (required)">
                    <CopyText value={a.depositMemo} label="memo" />
                  </Field>
                )}
                <p className="text-xs text-slate-500">
                  Quote valid for about {minsLeft} more minute{minsLeft === 1 ? "" : "s"}. Sending slightly more is fine (the extra is refunded). Sending less than {a.minAmountIn === a.amountIn ? "the amount" : "the minimum"} will be refunded.
                </p>
              </>
            )}

            {quoteExpired && (
              <div className="space-y-3">
                <Alert kind="warn">This quote has expired because prices move. If you have not sent anything yet, get a new quote. If you already sent funds, keep this page open: status will still update.</Alert>
                <Button onClick={startOver}>Get a new quote</Button>
              </div>
            )}

            {(view.phase.phase === "refunded" || view.phase.phase === "failed") && (
              <div className="space-y-2 text-sm">
                {a.refundedAmountFormatted && a.refundedAmountFormatted !== "0" && <p>Refunded: {a.refundedAmountFormatted} {a.originSymbol} to {a.refundTo}</p>}
                {a.refundReason && <p className="text-slate-500">Reason: {a.refundReason}</p>}
                <Button onClick={startOver}>Try again with a new quote</Button>
              </div>
            )}

            {view.phase.phase === "delivered" && (
              <a href={`/receipt/${a.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">View receipt</a>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
