const COLORS: Record<string, string> = {
  awaiting_deposit: "bg-slate-100 text-slate-700",
  swapping: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  underpaid: "bg-amber-100 text-amber-900",
  refunded: "bg-amber-100 text-amber-900",
  failed: "bg-red-100 text-red-800",
  pending: "bg-slate-100 text-slate-700",
  paid: "bg-emerald-100 text-emerald-800",
  expired: "bg-slate-200 text-slate-500",
};

export function StatusBadge({ kind, label }: { kind: string; label: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORS[kind] ?? COLORS.pending}`}>{label}</span>;
}
