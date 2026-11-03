"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Card, api } from "@/components/ui";
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

  if (error) return <Alert kind="info">{error}</Alert>;
  if (!data) return <p className="text-slate-500">Loading dashboard…</p>;

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm text-slate-500">Total received</p>
        <p className="text-3xl font-bold">{data.totalReceived} USDC</p>
      </Card>
      {data.links.length === 0 ? (
        <Alert kind="info">No links yet. <Link className="underline" href="/">Create your first payment link.</Link></Alert>
      ) : (
        <div className="space-y-2">
          {data.links.map((l) => (
            <Card key={l.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">${l.amountUsd} · {l.description}</p>
                  <p className="text-xs text-slate-500">{l.clientRef || "No reference"} · USDC on {l.payoutChainName} · expires {new Date(l.expiresAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge kind={l.status} label={l.status} />
                  {l.paidAttemptId ? (
                    <a className="text-sm text-emerald-700 underline" href={`/receipt/${l.paidAttemptId}`}>Receipt</a>
                  ) : (
                    <a className="text-sm text-slate-600 underline" href={`/pay/${l.id}`}>Open link</a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
