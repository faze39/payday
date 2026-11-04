/** Looping illustration of the live flow: client token → NEAR Intents → USDC on Base. Decorative only. */
const TOKENS = ["USDT", "SOL", "ETH", "wNEAR", "BTC"];

function Node({ title, sub, accent = false, children }: { title: string; sub: string; accent?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`relative z-10 flex w-full max-w-xs flex-row items-center gap-3 rounded-2xl border px-4 py-3 text-left backdrop-blur sm:max-w-none sm:flex-col sm:gap-2 sm:px-4 sm:text-center ${accent ? "border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_40px_-10px_rgba(52,211,153,0.6)]" : "border-white/10 bg-white/5"}`}>
      {children}
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300">{sub}</p>
      </div>
    </div>
  );
}

export function FlowVisual() {
  return (
    <div aria-hidden="true" className="animate-rise delay-3 relative mt-2 max-w-xl">
      <div className="relative flex flex-col items-center gap-1 sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-2">
        <Node title="Any token" sub="Client pays">
          <span className="token-cycle relative h-9 w-16 shrink-0 overflow-hidden font-mono text-xs font-semibold text-emerald-200">
            {TOKENS.map((t, i) => (
              <span key={t} className="absolute inset-0 flex items-center justify-center rounded-full bg-white/10" style={{ animationDelay: `${i * 1.6}s` }}>{t}</span>
            ))}
          </span>
        </Node>
        <span className="flow-line" />
        <Node title="NEAR Intents" sub="Swaps & routes" accent>
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-300 [animation-duration:2.4s]" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
          </span>
        </Node>
        <span className="flow-line [--d:1.1s]" />
        <Node title="USDC" sub="On Base">
          <span className="usdc-pulse flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500 font-mono text-[10px] font-bold text-white">$</span>
        </Node>
      </div>
    </div>
  );
}
