import { CreateLinkForm } from "@/components/CreateLinkForm";

const STEPS = [
  { title: "Create a link", body: "Set the amount in USD and the wallet where you want USDC. No sign-up needed." },
  { title: "Client pays with any token", body: "They pick a supported token on any supported chain and get a live quote." },
  { title: "You receive USDC", body: "NEAR Intents swaps and delivers USDC to your wallet on Base, Arbitrum, NEAR or Solana." },
  { title: "No custody", body: "Funds go from your client to a one-time deposit address and on to you. Payday never holds them." },
];

export default function Home() {
  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="space-y-4 pt-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> Live on mainnet
        </span>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
          Get paid in USDC by anyone, <span className="text-emerald-600">from any token on any chain.</span>
        </h1>
        <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
          Create a payment link in seconds. Your client pays with whatever they hold, and NEAR Intents swaps it and delivers USDC
          straight to your wallet.
        </p>
      </section>

      <section aria-labelledby="create">
        <h2 id="create" className="sr-only">Create a payment link</h2>
        <CreateLinkForm />
      </section>

      <section aria-labelledby="how" className="space-y-5">
        <h2 id="how" className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">How it works</h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">{i + 1}</span>
              <div>
                <h3 className="font-semibold text-slate-950">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
