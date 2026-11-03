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
      <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
        {list.map((t) => (
          <button
            type="button"
            key={t.assetId}
            onClick={() => onChange(t.assetId)}
            className={`rounded-lg border px-3 py-2 text-left text-sm ${value === t.assetId ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}
          >
            <span className="font-semibold">{t.symbol}</span> <span className="text-xs uppercase text-slate-500">on {t.blockchain}</span>
          </button>
        ))}
        {list.length === 0 && <p className="col-span-full text-sm text-slate-500">No token matches “{q}”.</p>}
      </div>
    </div>
  );
}
