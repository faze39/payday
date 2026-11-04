"use client";
import { useEffect, useState } from "react";

interface Fx { rate: number; updatedAt: string; source: string }

/** Shows an approximate naira value, labelled as an estimate, with its source. Hidden if the FX source fails. */
export function NgnEstimate({ usd, className = "text-slate-600" }: { usd: number; className?: string }) {
  const [fx, setFx] = useState<Fx | null>(null);
  useEffect(() => {
    fetch("/api/fx").then((r) => r.json()).then((b) => setFx(b.usdNgn)).catch(() => setFx(null));
  }, []);
  if (!fx || !Number.isFinite(usd) || usd <= 0) return null;
  return (
    <p className={`text-xs ${className}`} title={`Rate ${fx.rate.toFixed(2)} NGN/USD, updated ${fx.updatedAt}`}>
      ≈ ₦{Math.round(usd * fx.rate).toLocaleString()} (approximate, source: {fx.source})
    </p>
  );
}
