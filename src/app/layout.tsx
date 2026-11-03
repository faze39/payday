import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Payday: get paid in USDC from any token",
  description: "One payment link. Your client pays with any token on any chain; you receive USDC. Powered by NEAR Intents.",
};

export const viewport: Viewport = { themeColor: "#059669", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" aria-label="Payday home">
              <Logo />
            </Link>
            <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
              Dashboard
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-1 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:justify-between sm:text-left">
            <span>
              Powered by{" "}
              <a className="font-medium text-slate-700 underline-offset-2 hover:underline" href="https://docs.near-intents.org" target="_blank" rel="noreferrer">
                NEAR Intents
              </a>{" "}
              · non-custodial
            </span>
            <span>Payday never holds your funds.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
