"use client";
import { useState, type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-rise rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_20px_48px_-24px_rgba(15,23,42,0.22)] sm:p-7 ${className}`}>
      {children}
    </div>
  );
}

/** Small mono uppercase label, borrowed from Column's ruled, technical type. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 ${className}`}>{children}</p>;
}

/** Centred page column with a soft grid backdrop. */
export function Page({ children, width = "max-w-2xl" }: { children: ReactNode; width?: string }) {
  return (
    <div className="relative">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-72 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
      <div className={`relative mx-auto w-full ${width} px-4 py-6 sm:px-6 sm:py-10`}>{children}</div>
    </div>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {children}
      {error ? <span className="block text-sm font-medium text-red-700">{error}</span> : hint ? <span className="block text-xs leading-relaxed text-slate-600">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3.5 py-3 text-base text-slate-950 shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] transition placeholder:text-slate-500 hover:border-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 sm:text-sm";

export const primaryButtonClass =
  "group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(2,6,23,0.5)] ring-1 ring-inset ring-white/10 transition hover:-translate-y-px hover:bg-emerald-700 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-slate-950 sm:w-auto";

export function Button({ children, disabled, onClick, type = "button" }: { children: ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={primaryButtonClass}>
      {children}
    </button>
  );
}

export function CopyText({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-stretch gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
      <code className="flex flex-1 items-center break-all px-2 py-1.5 font-mono text-sm text-slate-900">{value}</code>
      <button
        type="button"
        className={`min-h-9 shrink-0 rounded-lg px-3.5 text-xs font-semibold transition ${copied ? "bg-emerald-600 text-white" : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:ring-slate-300"}`}
        onClick={() => navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
        aria-label={`Copy ${label ?? "value"}`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "info" | "success" | "warn"; children: ReactNode }) {
  const cls = {
    error: "border-red-200 bg-red-50 text-red-900",
    info: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
  }[kind];
  return <div role="status" className={`animate-rise rounded-xl border px-4 py-3 text-sm leading-relaxed ${cls}`}>{children}</div>;
}

/** Shimmer placeholder used while data loads. */
export function Loading({ label }: { label: string }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="h-40 animate-pulse rounded-3xl bg-slate-200/70" />
      <div className="h-24 animate-pulse rounded-3xl bg-slate-200/50" />
      <p className="text-center text-sm text-slate-600" aria-hidden="true">{label}</p>
    </div>
  );
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error ?? `Request failed (${res.status})`), { body });
  return body as T;
}
