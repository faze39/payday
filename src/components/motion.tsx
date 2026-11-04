"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

function reduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fades/slides children in when they scroll into view. */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !("IntersectionObserver" in window)) return void setShown(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${shown ? "reveal-in" : ""} ${className}`}>
      {children}
    </Tag>
  );
}

/** Counts a displayed number up from 0, keeping its decimals. Falls back to the plain value. */
export function CountUp({ value, duration = 900 }: { value: string; duration?: number }) {
  const target = Number(value);
  const decimals = (value.split(".")[1] ?? "").length;
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!Number.isFinite(target) || target <= 0 || reduced()) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown((target * eased).toFixed(decimals));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setShown(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, decimals, duration, value]);
  return <span className="tabular-nums">{shown}</span>;
}

/** Subtle 3D tilt that follows the pointer (mouse only). */
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || reduced()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-3px)`;
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  }
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={() => ref.current && (ref.current.style.transform = "")} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

/** Animated check mark that draws itself. */
export function SuccessCheck({ size = 40 }: { size?: number }) {
  return (
    <span className="success-pop relative inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.7)]" style={{ width: size, height: size }} aria-hidden="true">
      <span className="success-ring absolute inset-0 rounded-full bg-emerald-500" />
      <svg viewBox="0 0 16 16" className="relative h-1/2 w-1/2">
        <path className="success-draw" d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
