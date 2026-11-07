/** A right-angle route mark: an invoice turning into a direct payout. */
export function Logo({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M3 25V3h22v22H3Z" fill="#d5f66b" />
        <path
          d="M8 19 19 8M9 8h10v10"
          stroke="#101815"
          strokeWidth="2.4"
          fill="none"
        />
      </svg>
      <span
        className={`payday-wordmark ${dark ? "text-white" : "text-slate-950"}`}
      >
        payday
      </span>
    </span>
  );
}
