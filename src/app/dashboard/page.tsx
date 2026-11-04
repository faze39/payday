"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Eyebrow, Loading, Page, api } from "@/components/ui";
import { StatusBadge } from "@/components/StatusBadge";
import { DASHBOARD_KEY_STORAGE } from "@/components/CreateLinkForm";
import type { PublicLink } from "@/lib/client-types";

type Row = PublicLink & { receivedUsdc: string | null; paidAttemptId: string | null; attempts: number };

export default function DashboardPage() {
  const [data, setData] = useState<{ links: Row[]; totalReceived: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // The key is read from the URL fragment (#k=…), which browsers never send to the server, or from this browser's saved key.
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("k");
    if (fromHash) localStorage.setItem(DASHBOARD_KEY_STORAGE, fromHash);
    const key = fromHash ?? localStorage.getItem(DASHBOARD_KEY_STORAGE);
    const load = async () => {
      if (!key) throw new Error("No dashboard key found. Open your private dashboard link, or create a payment link first.");
      return api<{ links: Row[]; totalReceived: string }>("/api/dashboard", { headers: { Authorization: `Bearer ${key}` } });
    };
    load()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Page width="max-w-3xl"><Alert kind="info">{error}</Alert></Page>;
  if (!data) return <Page width="max-w-3xl"><Loading label="Loading dashboard…" /></Page>;
  const paidCount = data.links.filter((l) => l.status === "paid").length;

  return (
    <Page width="max-w-3xl">
      <div className="space-y-5">
        <div className="animate-rise relative isolate overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <div className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.45),transparent)] blur-xl" aria-hidden="true" />
          <div className="bg-grid-dark absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" aria-hidden="true" />
          <Eyebrow className="!text-emerald-300">Total received</Eyebrow>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            {data.totalReceived} <span className="text-2xl font-medium text-emerald-300 sm:text-3xl">USDC</span>
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {data.links.length} link{data.links.length === 1 ? "" : "s"} · {paidCount} paid
          </p>
        </div>
        {data.links.length === 0 ? (
          <Alert kind="info">No links yet. <Link className="font-semibold underline" href="/">Create your first payment link.</Link></Alert>
        ) : (
          <div className="animate-rise delay-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_20px_48px_-28px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 sm:px-6">
              <Eyebrow>Your links</Eyebrow>
              <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">+ New link</Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {data.links.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">
                      <span className="tabular-nums">${l.amountUsd}</span> <span className="text-slate-400">·</span> {l.description}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">{l.clientRef || "No reference"} · USDC on {l.payoutChainName} · expires {new Date(l.expiresAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge kind={l.status} label={l.status} />
                    {l.paidAttemptId ? (
                      <a className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50" href={`/receipt/${l.paidAttemptId}`}>Receipt →</a>
                    ) : (
                      <a className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100" href={`/pay/${l.id}`}>Open link →</a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Page>
  );
}
