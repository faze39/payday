import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  title: "Payday: get paid in USDC from any token",
  description: "One payment link. Your client pays with any token on any chain; you receive USDC. Powered by NEAR Intents.",
};

export const viewport: Viewport = { themeColor: "#020617", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${mono.variable}`}>
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" aria-label="Payday home">
              <Logo dark />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-white transition hover:border-emerald-400/60 hover:bg-white/10"
            >
              Dashboard
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center text-sm text-slate-600 sm:flex-row sm:justify-between sm:px-6 sm:text-left">
            <Logo />
            <span>
              Powered by{" "}
              <a className="font-semibold text-slate-900 underline-offset-4 hover:underline" href="https://docs.near-intents.org" target="_blank" rel="noreferrer">
                NEAR Intents
              </a>{" "}
              · non-custodial · Payday never holds your funds.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
