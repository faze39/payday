const COLORS: Record<string, string> = {
  awaiting_deposit: "bg-slate-100 text-slate-800 ring-slate-300",
  swapping: "bg-sky-50 text-sky-800 ring-sky-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  underpaid: "bg-amber-50 text-amber-900 ring-amber-200",
  refunded: "bg-amber-50 text-amber-900 ring-amber-200",
  failed: "bg-red-50 text-red-800 ring-red-200",
  pending: "bg-slate-100 text-slate-800 ring-slate-300",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  expired: "bg-slate-100 text-slate-600 ring-slate-300",
};
const DOT: Record<string, string> = { delivered: "bg-emerald-500", paid: "bg-emerald-500", swapping: "bg-sky-500 animate-pulse", failed: "bg-red-500", underpaid: "bg-amber-500", refunded: "bg-amber-500" };

export function StatusBadge({ kind, label }: { kind: string; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${COLORS[kind] ?? COLORS.pending}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[kind] ?? "bg-slate-400"}`} aria-hidden="true" />
      {label}
    </span>
  );
}
