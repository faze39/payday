import Link from "next/link";
import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/#create", label: "Create" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Payment links for freelancers. Clients pay with any supported token on any supported chain. You receive USDC via NEAR Intents. Payday never holds your funds.
          </p>
          <p className="text-sm text-slate-600">
            Powered by{" "}
            <a className="font-semibold text-slate-900 underline-offset-4 hover:underline" href="https://docs.near-intents.org" target="_blank" rel="noreferrer">
              NEAR Intents
            </a>
            . Non-custodial.
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">Site</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-medium text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-500 sm:px-6">
          Built for the NEAR Protocol Hackathon. Live at payday-near.vercel.app.
        </p>
      </div>
    </footer>
  );
}
