"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Eyebrow, Loading, Page, api } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { DASHBOARD_KEY_STORAGE } from "@/components/CreateLinkForm";
import { CountUp } from "@/components/motion";
import type { DashboardRow } from "@/lib/client-types";

export default function DashboardPage() {
  const [data, setData] = useState<{ links: DashboardRow[]; totalReceived: string } | null>(null);
  const [error, setError] = useState("");
  const [key, setKey] = useState<string | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);

  useEffect(() => {
    // The key is read from the URL fragment (#k=…), which browsers never send to the server, or from this browser's saved key.
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("k");
    if (fromHash) localStorage.setItem(DASHBOARD_KEY_STORAGE, fromHash);
    const k = fromHash ?? localStorage.getItem(DASHBOARD_KEY_STORAGE);
    setKey(k);
    const load = async () => {
      if (!k) throw new Error("No dashboard key found. Open your private dashboard link, or create a payment link first.");
      return api<{ links: DashboardRow[]; totalReceived: string }>("/api/dashboard", { headers: { Authorization: `Bearer ${k}` } });
    };
    load()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  async function downloadCsv() {
    if (!key) return;
    setCsvBusy(true);
    try {
      const res = await fetch("/api/dashboard/export", { headers: { Authorization: `Bearer ${key}` } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payday-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCsvBusy(false);
    }
  }

  if (error && !data) return <Page width="max-w-3xl"><Alert kind="info">{error}</Alert></Page>;
  if (!data) return <Page width="max-w-3xl"><Loading label="Loading dashboard…" /></Page>;
  const paidCount = data.links.filter((l) => l.status === "paid").length;
  const refundedCount = data.links.filter((l) => l.latestAttempt?.status === "REFUNDED").length;

  return (
    <Page width="max-w-3xl">
      <div className="space-y-5">
        <div className="animate-rise relative isolate overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.45),transparent)] blur-xl" aria-hidden="true" />
          <div className="bg-grid-dark absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" aria-hidden="true" />
          <Eyebrow className="!text-emerald-300">Total received</Eyebrow>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            <CountUp value={data.totalReceived} /> <span className="text-2xl font-medium text-emerald-300 sm:text-3xl">USDC</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {data.links.length} link{data.links.length === 1 ? "" : "s"} · {paidCount} paid
            {refundedCount ? ` · ${refundedCount} refunded` : ""}
          </p>
        </div>
        {error && <Alert kind="warn">{error}</Alert>}
        {data.links.length === 0 ? (
          <Alert kind="info">No links yet. <Link className="font-semibold underline" href="/">Create your first payment link.</Link></Alert>
        ) : (
          <div className="animate-rise delay-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_20px_48px_-28px_rgba(15,23,42,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5 sm:px-6">
              <Eyebrow>Your links</Eyebrow>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadCsv}
                  disabled={csvBusy}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-60"
                >
                  {csvBusy ? "Exporting…" : "Download CSV"}
                </button>
                <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">+ New link</Link>
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {data.links.map((l, i) => {
                const attempt = l.latestAttempt;
                const badgeKind = attempt?.phase ?? l.status;
                const badgeLabel = attempt?.label ?? l.status;
                return (
                  <li key={l.id} className="animate-rise px-5 py-4 transition hover:bg-slate-50 sm:px-6" style={{ animationDelay: `${120 + i * 60}ms` }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">
                          <span className="tabular-nums">${l.amountUsd}</span> <span className="text-slate-400">·</span> {l.description}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">{l.clientRef || "No reference"} · USDC on {l.payoutChainName} · expires {new Date(l.expiresAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge kind={badgeKind} label={badgeLabel} />
                        {l.paidAttemptId ? (
                          <a className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50" href={`/receipt/${l.paidAttemptId}`}>Receipt →</a>
                        ) : (
                          <a className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100" href={`/pay/${l.id}`}>Open link →</a>
                        )}
                      </div>
                    </div>
                    {attempt && (attempt.depositTxUrl || attempt.deliveryTxUrl || attempt.status === "REFUNDED" || attempt.status === "INCOMPLETE_DEPOSIT") && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="font-mono text-[11px] uppercase tracking-wide text-slate-500">{attempt.status}</span>
                        {attempt.depositTxUrl && (
                          <a className="font-medium text-emerald-700 underline underline-offset-2" href={attempt.depositTxUrl} target="_blank" rel="noreferrer">Deposit tx ↗</a>
                        )}
                        {attempt.deliveryTxUrl && (
                          <a className="font-medium text-emerald-700 underline underline-offset-2" href={attempt.deliveryTxUrl} target="_blank" rel="noreferrer">Delivery tx ↗</a>
                        )}
                        {attempt.refundReason && <span>Refund: {attempt.refundReason}</span>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Page>
  );
}
