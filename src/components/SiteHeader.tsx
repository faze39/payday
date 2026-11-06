"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
] as const;

function linkClass(active: boolean) {
  return active
    ? "text-sm font-semibold text-white"
    : "text-sm font-medium text-slate-300 transition hover:text-white";
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <nav
        className="wrap flex items-center justify-between gap-4 py-5"
        aria-label="Primary"
      >
        <Link href="/" aria-label="Payday home" className="shrink-0">
          <Logo dark />
        </Link>

        <ul className="nav-pill hidden lg:flex">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={linkClass(isActive(item.href))}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/#create"
            className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white transition hover:border-emerald-400/50 hover:bg-white/10"
          >
            Create
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#5fd29b] px-3.5 py-1.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
          >
            Dashboard
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-white/15 p-2 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() =>
            setMenuPath((value) => (value === pathname ? null : pathname))
          }
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-white/10 bg-slate-950 px-4 py-4 lg:hidden"
        >
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 ${isActive(item.href) ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#create"
                className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Create link
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="mt-1 block rounded-lg bg-[#5fd29b] px-3 py-2 text-center font-semibold text-black hover:bg-emerald-300"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
