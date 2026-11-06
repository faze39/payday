import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const instrument = localFont({
  src: "./fonts/instrument-sans.woff",
  weight: "400 700",
  variable: "--font-instrument",
  display: "swap",
});
const serif = localFont({
  src: "./fonts/instrument-serif.woff2",
  variable: "--font-instrument-serif",
  weight: "400",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Payday: get paid in USDC from any token",
    template: "%s · Payday",
  },
  description:
    "One payment link. Your client pays with any token on any chain; you receive USDC. Powered by NEAR Intents.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${instrument.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
