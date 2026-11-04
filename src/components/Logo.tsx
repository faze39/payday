/** Payday wordmark: a rounded mark with an upward arrow (money arriving) plus the name. */
export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" className="drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]">
        <rect width="32" height="32" rx="9" fill="url(#pd-g)" />
        <path d="M10 18.5 16 12.5l6 6M16 13v9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <defs>
          <linearGradient id="pd-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#0f766e" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`text-lg font-semibold tracking-tight ${dark ? "text-white" : "text-slate-950"}`}>
        Pay<span className={dark ? "text-emerald-400" : "text-emerald-600"}>day</span>
      </span>
    </span>
  );
}
