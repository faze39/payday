"use client";
import { useEffect, useState } from "react";
import type { AttemptView, PublicLink, TokenOption } from "@/lib/client-types";
import { Alert, Button, Card, CopyText, Eyebrow, Field, Loading, Page, api, inputClass, primaryButtonClass } from "./ui";
import { NgnEstimate } from "./NgnEstimate";
import { StatusBadge } from "./StatusBadge";
import { CountUp, SuccessCheck } from "./motion";
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

  if (loadError && !link) return <Page><Alert>{loadError}</Alert></Page>;
  if (!link) return <Page><Loading label="Loading payment…" /></Page>;

  const token = tokens.find((t) => t.assetId === originAsset);
  const a = view?.attempt;
  const quoteExpired = a ? new Date(a.quoteExpiresAt).getTime() <= now && view?.phase.phase === "awaiting_deposit" : false;
  const minsLeft = a ? Math.max(0, Math.ceil((new Date(a.quoteExpiresAt).getTime() - now) / 60000)) : 0;

  return (
    <Page>
    <div className="space-y-4 sm:space-y-5">
      <div className="animate-rise relative isolate overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-[0_30px_60px_-30px_rgba(2,6,23,0.6)] sm:p-8">
        <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.45),transparent)] blur-xl" aria-hidden="true" />
        <div className="bg-grid-dark absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <Eyebrow className="!text-emerald-300">{link.clientRef ? `Invoice for ${link.clientRef}` : "Payment request"}</Eyebrow>
          {link.status !== "pending" && <StatusBadge kind={link.status} label={link.status} />}
        </div>
        <p className="mt-3 text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">$<CountUp value={link.amountUsd} /></p>
        <NgnEstimate usd={Number(link.amountUsd)} className="mt-1 text-slate-300" />
        <p className="mt-4 text-base leading-relaxed text-slate-100">{link.description}</p>
        {!!link.lineItems?.length && (
          <ul className="mt-4 space-y-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {link.lineItems.map((item, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>{item.qty} × {item.description}</span>
                <span className="tabular-nums text-white">${(item.qty * Number(item.unitAmountUsd)).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-300">
          The freelancer receives <span className="font-semibold text-white">{link.amountUsd} USDC</span> on {link.payoutChainName} at{" "}
          <span className="break-all font-mono text-slate-200">{link.recipientAddress}</span>
        </div>
      </div>

      {link.status === "paid" && !attemptId && (
        <div className="animate-rise delay-1 flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <SuccessCheck />
            <p className="font-semibold text-emerald-950">This link has already been paid. Thank you!</p>
          </div>
          {link.receiptId && <a className={primaryButtonClass} href={`/receipt/${link.receiptId}`}>View receipt →</a>}
        </div>
      )}
      {link.status === "expired" && !attemptId && <Alert kind="warn">This payment link has expired. Ask the freelancer to send a new one.</Alert>}

      {link.status === "pending" && !attemptId && (
        <Card>
          <div className="space-y-4">
            <div>
              <Eyebrow>Step 1</Eyebrow>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Choose what you want to pay with</h2>
            </div>
            {tokens.length ? <TokenPicker tokens={tokens} value={originAsset} onChange={setOriginAsset} /> : <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />}
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

      {attemptId && !a && <Loading label="Loading payment status…" />}

      {a && view && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">Payment status</h2>
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
                <p className="text-xs leading-relaxed text-slate-600">
                  Quote valid for about {minsLeft} more minute{minsLeft === 1 ? "" : "s"}. Sending slightly more is fine: anything above what the swap needs is refunded to your refund address afterwards. If less than {a.minAmountIn === a.amountIn ? "the amount" : "the minimum"} has arrived by the deadline, it is refunded instead, minus any network refund fee.
                </p>
              </>
            )}

            {view.phase.phase === "underpaid" && (
              <div className="space-y-3">
                {view.live?.depositedAmountFormatted && (
                  <p className="text-sm">Received so far: {view.live.depositedAmountFormatted} {a.originSymbol} (quoted amount {a.amountInFormatted} {a.originSymbol}).</p>
                )}
                <Field label="Same deposit address" hint={`Send only ${a.originSymbol} on the ${a.originChain.toUpperCase()} network.`}>
                  <CopyText value={a.depositAddress} label="deposit address" />
                </Field>
                {a.depositMemo && (
                  <Field label="Memo (required)">
                    <CopyText value={a.depositMemo} label="memo" />
                  </Field>
                )}
              </div>
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
                {a.refundReason && <p className="text-slate-600">Reason: {a.refundReason}</p>}
                <Button onClick={startOver}>Try again with a new quote</Button>
              </div>
            )}

            {view.phase.phase === "delivered" && (
              <div className="flex items-center gap-3"><SuccessCheck size={36} /><a href={`/receipt/${a.id}`} className={primaryButtonClass}>View receipt →</a></div>
            )}
          </div>
        </Card>
      )}
    </div>
    </Page>
  );
}
