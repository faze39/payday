"use client";
import { useMemo, useState } from "react";
import type { TokenOption } from "@/lib/client-types";
import { inputClass } from "./ui";

/** Shown first: common tokens on cheap chains. The full live list can still be searched. */
const POPULAR = ["USDT:sol", "USDC:sol", "SOL:sol", "wNEAR:near", "USDT:near", "USDC:arb", "ETH:arb", "USDT:tron", "ETH:base", "USDC:pol", "BNB:bsc", "BTC:btc"];

export function TokenPicker({ tokens, value, onChange }: { tokens: TokenOption[]; value: string; onChange: (assetId: string) => void }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle) return tokens.filter((t) => `${t.symbol} ${t.blockchain}`.toLowerCase().includes(needle)).slice(0, 50);
    return POPULAR.map((k) => tokens.find((t) => `${t.symbol}:${t.blockchain}` === k)).filter((t): t is TokenOption => !!t);
  }, [q, tokens]);

  return (
    <div className="space-y-2">
      <input className={inputClass} placeholder={`Search ${tokens.length} tokens (e.g. "usdt", "sol", "eth base")`} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto p-0.5 sm:grid-cols-3">
        {list.map((t) => (
          <button
            type="button"
            key={t.assetId}
            onClick={() => onChange(t.assetId)}
            className={`rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${value === t.assetId ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20" : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 active:scale-[0.98] hover:shadow-sm"}`}
          >
            <span className="block font-semibold text-slate-950">{t.symbol}</span> <span className="block font-mono text-[11px] uppercase tracking-wide text-slate-600">on {t.blockchain}</span>
          </button>
        ))}
        {list.length === 0 && <p className="col-span-full text-sm text-slate-600">No token matches “{q}”.</p>}
      </div>
    </div>
  );
}
