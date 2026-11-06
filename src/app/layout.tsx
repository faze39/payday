import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const heading = localFont({
  src: "./fonts/syne.ttf",
  weight: "400 800",
  variable: "--font-heading",
  display: "swap",
});
const body = localFont({
  src: "./fonts/dm-sans.ttf",
  variable: "--font-body",
  weight: "100 1000",
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
  themeColor: "#101815",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${heading.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
