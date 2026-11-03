import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payday: get paid in USDC from any token",
  description: "One payment link. Your client pays with any token on any chain; you receive USDC. Powered by NEAR Intents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Pay<span className="text-emerald-600">day</span>
            </Link>
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
        <footer className="py-6 text-center text-xs text-slate-500">
          Non-custodial. Swaps and delivery by{" "}
          <a className="underline" href="https://docs.near-intents.org" target="_blank" rel="noreferrer">
            NEAR Intents
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
