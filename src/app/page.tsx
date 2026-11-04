import { CreateLinkForm } from "@/components/CreateLinkForm";
import { FlowVisual } from "@/components/FlowVisual";
import { Reveal, Tilt } from "@/components/motion";

const STEPS = [
  { title: "Create a link", body: "Set the amount in USD and the wallet where you want USDC. No sign-up needed." },
  { title: "Client pays with any token", body: "They pick a supported token on any supported chain and get a live quote." },
  { title: "You receive USDC", body: "NEAR Intents swaps and delivers USDC to your wallet on Base, Arbitrum, NEAR or Solana." },
  { title: "No custody", body: "Funds go from your client to a one-time deposit address and on to you. Payday never holds them." },
];

const POINTS = ["USDC on Base by default", "No sign-up", "Non-custodial"];

export default function Home() {
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="bg-grid-dark absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden="true" />
        <div
          className="animate-glow absolute -top-40 left-1/2 -z-10 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.42),rgba(13,148,136,0.18)_55%,transparent)] blur-2xl"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-24">
          <div className="space-y-6 lg:sticky lg:top-28">
            <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-300">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live on mainnet
            </span>
            <h1 className="animate-rise delay-1 text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
              Get paid in USDC by anyone,{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">from any token on any chain.</span>
            </h1>
            <p className="animate-rise delay-2 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Create a payment link in seconds. Your client pays with whatever they hold, and NEAR Intents swaps it and delivers USDC straight to your wallet.
            </p>
            <ul className="animate-rise delay-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-200">
              {POINTS.map((p) => (
                <li key={p} className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 16 16" className="h-4 w-4 text-emerald-400" aria-hidden="true">
                    <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
            <FlowVisual />
            <div className="mt-6 max-w-xl space-y-2 text-sm text-slate-300">
              <p>Built by a Nigerian freelancer tired of losing money to cross-chain payment hassle.</p>
              <a
                href="https://solscan.io/tx/547PEU3gUVs6qXJiJCPDniw64XRb8TicPRcZiymfpoD4MkPLobvvQ8XCMzB4ewkEuNeATda5uwTpRMxLZ2WMj61W"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-emerald-300 underline-offset-4 hover:underline"
              >
                Proof: a real mainnet payment (client deposit on Solscan) ↗
              </a>
            </div>
          </div>

          <section aria-labelledby="create" className="animate-rise delay-2 text-slate-900">
            <h2 id="create" className="sr-only">Create a payment link</h2>
            <div className="rounded-[28px] bg-gradient-to-b from-white/20 to-white/5 p-px shadow-[0_40px_80px_-30px_rgba(16,185,129,0.45)]">
              <CreateLinkForm />
            </div>
          </section>
        </div>
      </section>

      <section aria-labelledby="how" className="relative">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-700">How it works</p>
            <h2 id="how" className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              One link. Any token in, USDC out.
            </h2>
          </Reveal>
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 90}>
                <Tilt className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] sm:p-7">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 font-mono text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">0{i + 1}</span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{s.body}</p>
                </Tilt>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
