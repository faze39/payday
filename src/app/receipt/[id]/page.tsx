"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { AttemptView } from "@/lib/client-types";
import { Alert, Eyebrow, Loading, Page, api } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { txExplorerUrl } from "@/lib/explorer";
import { clientPaidView } from "@/lib/status";
import { CountUp, Reveal, SuccessCheck } from "@/components/motion";

function shortHash(h: string) {
  return h.length > 22 ? `${h.slice(0, 10)}…${h.slice(-8)}` : h;
}

function TxList({ title, chain, txs }: { title: string; chain?: string; txs: { hash: string; explorerUrl: string }[] }) {
  if (!txs.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <Eyebrow>{title}</Eyebrow>
      <ul className="mt-1.5 space-y-1">
        {txs.map((t) => {
          const url = txExplorerUrl(chain, t.hash, t.explorerUrl);
          return (
            <li key={t.hash} className="font-mono text-sm">
              {url ? (
                <a className="break-all font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-900" href={url} target="_blank" rel="noreferrer" title={t.hash}>
                  {shortHash(t.hash)} ↗
                </a>
              ) : (
                <span className="break-all text-slate-700">{t.hash}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [view, setView] = useState<AttemptView | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<AttemptView>(`/api/attempts/${id}`).then(setView).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <Page><Alert>{error}</Alert></Page>;
  if (!view) return <Page><Loading label="Loading receipt…" /></Page>;
  const { attempt: a, link, phase } = view;
  const paid = clientPaidView(a.amountInFormatted, view.live);
  const excess = phase.phase === "delivered" ? view.live?.refundedAmountFormatted : null;
  const rows: [string, React.ReactNode, string?][] = link
    ? [
        ["For", link.description],
        ...(link.clientRef ? ([["Client", link.clientRef]] as [string, string][]) : []),
        ["Invoice amount", `$${link.amountUsd}`],
        [paid.label, `${paid.amount} ${a.originSymbol} (${a.originChain.toUpperCase()})`],
        ...(excess ? ([["Excess refunded", `${excess} ${a.originSymbol} to the client's refund address`]] as [string, string][]) : []),
        ["To", link.recipientAddress, "mono"],
        ["Deposit address", a.depositAddress, "mono"],
        ["Updated", new Date(a.updatedAt).toLocaleString()],
      ]
    : [];

  return (
    <Page>
      <article className="animate-rise overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_24px_56px_-28px_rgba(15,23,42,0.28)]">
        <header className="relative isolate overflow-hidden bg-slate-950 px-6 py-6 text-white sm:px-8 sm:py-7">
          <div className="absolute -left-16 -top-28 -z-10 h-64 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.5),transparent)] blur-xl" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-300">Payment receipt</h1>
            <StatusBadge kind={phase.phase} label={phase.label} />
          </div>
          {link && (
            <>
              <div className="mt-4 flex items-center gap-3">{phase.phase === "delivered" && <SuccessCheck size={28} />}<p className="text-sm text-slate-300">Freelancer received</p></div>
              <p className="mt-1 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                {a.amountOutFormatted ? <CountUp value={a.amountOutFormatted} /> : "—"} <span className="text-2xl font-medium text-emerald-300 sm:text-3xl">USDC</span>
              </p>
              <p className="mt-1 text-sm text-slate-300">on {link.payoutChainName}</p>
            </>
          )}
        </header>
        <div className="space-y-4 p-5 sm:p-7">
          {phase.phase !== "delivered" && <Alert kind="warn">This payment is not complete yet: {phase.guidance}</Alert>}
          {rows.length > 0 && (
            <dl className="divide-y divide-slate-100 text-sm">
              {rows.map(([k, v, m]) => (
                <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
                  <dt className="text-slate-600">{k}</dt>
                  <dd className={m ? "break-all font-mono text-xs leading-5 text-slate-900" : "font-medium text-slate-950"}>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <Reveal className="grid gap-3 sm:grid-cols-2">
            <TxList title="Client deposit transaction" chain={a.originChain} txs={a.originTxs} />
            <TxList title="USDC delivery transaction" chain={link?.payoutChain} txs={a.destinationTxs} />
          </Reveal>
          <p className="text-xs leading-relaxed text-slate-600">
            Routed by NEAR Intents. You can also look up the deposit address on{" "}
            <a className="font-medium text-slate-900 underline underline-offset-2" href="https://explorer.near-intents.org" target="_blank" rel="noreferrer">explorer.near-intents.org</a>.
          </p>
        </div>
      </article>
    </Page>
  );
}
