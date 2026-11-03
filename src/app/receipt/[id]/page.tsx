"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { AttemptView } from "@/lib/client-types";
import { Alert, Card, api } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";

function TxList({ title, txs }: { title: string; txs: { hash: string; explorerUrl: string }[] }) {
  if (!txs.length) return null;
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-1 space-y-1">
        {txs.map((t) => (
          <li key={t.hash}>
            <a className="break-all font-mono text-xs text-emerald-700 underline" href={t.explorerUrl} target="_blank" rel="noreferrer">{t.hash}</a>
          </li>
        ))}
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

  if (error) return <Alert>{error}</Alert>;
  if (!view) return <p className="text-slate-500">Loading receipt…</p>;
  const { attempt: a, link, phase } = view;

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Payment receipt</h1>
          <StatusBadge kind={phase.phase} label={phase.label} />
        </div>
        {phase.phase !== "delivered" && <Alert kind="warn">This payment is not complete yet: {phase.guidance}</Alert>}
        {link && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-500">For</dt><dd>{link.description}</dd>
            {link.clientRef && (<><dt className="text-slate-500">Client</dt><dd>{link.clientRef}</dd></>)}
            <dt className="text-slate-500">Invoice amount</dt><dd>${link.amountUsd}</dd>
            <dt className="text-slate-500">Client paid</dt><dd>{a.amountInFormatted} {a.originSymbol} ({a.originChain.toUpperCase()})</dd>
            <dt className="text-slate-500">Freelancer received</dt><dd className="font-semibold">{a.amountOutFormatted ?? "—"} USDC on {link.payoutChainName}</dd>
            <dt className="text-slate-500">To</dt><dd className="break-all font-mono text-xs">{link.recipientAddress}</dd>
            <dt className="text-slate-500">Deposit address</dt><dd className="break-all font-mono text-xs">{a.depositAddress}</dd>
            <dt className="text-slate-500">Updated</dt><dd>{new Date(a.updatedAt).toLocaleString()}</dd>
          </dl>
        )}
        <TxList title="Client deposit transaction" txs={a.originTxs} />
        <TxList title="USDC delivery transaction" txs={a.destinationTxs} />
        <p className="text-xs text-slate-500">
          Routed by NEAR Intents. You can also look up the deposit address on{" "}
          <a className="underline" href="https://explorer.near-intents.org" target="_blank" rel="noreferrer">explorer.near-intents.org</a>.
        </p>
      </div>
    </Card>
  );
}
