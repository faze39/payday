"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MotionConfig,
  motion,
  useAnimationControls,
  useInView,
  type Variants,
} from "motion/react";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ComponentProps,
  type ReactNode,
} from "react";

import {
  subscribeMotionPreference,
  motionPreferenceSnapshot,
  staticMotionSnapshot,
} from "@/components/marketing-motion-preference";

export const PAPER_EASE = [0.22, 1, 0.36, 1] as const;
/** Native subscription also handles OS changes while an animation is running. */
export function useMarketingMotion() {
  return useSyncExternalStore(
    subscribeMotionPreference,
    motionPreferenceSnapshot,
    staticMotionSnapshot,
  );
}

export function MarketingMotionProvider({ children }: { children: ReactNode }) {
  const enabled = useMarketingMotion();
  return (
    <MotionConfig
      reducedMotion={enabled ? "never" : "always"}
      transition={{ duration: enabled ? 0.4 : 0, ease: PAPER_EASE }}
    >
      {children}
    </MotionConfig>
  );
}

const pageVariants: Variants = {
  enter: { opacity: 0.65, x: 14 },
  ready: { opacity: 1, x: 0, transition: { duration: 0.4, ease: PAPER_EASE } },
};

/** Enter-only route handoff. Never retain a stale App Router tree for an exit. */
export function MarketingPage({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const enabled = useMarketingMotion();
  const pathname = usePathname();
  const controls = useAnimationControls();
  useEffect(() => {
    if (!enabled) {
      controls.set("ready");
      return;
    }
    controls.set("enter");
    void controls.start("ready");
    return () => controls.stop();
  }, [controls, enabled, pathname]);
  return (
    <div className="marketing-route-window">
      <motion.div
        className={className}
        data-marketing-page=""
        initial={false}
        animate={controls}
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** A one-time paper-registration movement, starting only after viewport entry. */
export function PaperReveal({
  children,
  className,
  delay = 0,
  as = "div",
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "article";
  direction?: "up" | "across";
}) {
  const enabled = useMarketingMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const played = useRef(false);
  const controls = useAnimationControls();
  useEffect(() => {
    if (!enabled) {
      controls.set({ opacity: 1, x: 0, y: 0 });
      return;
    }
    if (!inView || played.current) return;
    played.current = true;
    controls.set({
      opacity: 0.45,
      x: direction === "across" ? 16 : 0,
      y: direction === "up" ? 18 : 0,
    });
    void controls.start({
      opacity: 1,
      x: 0,
      y: 0,
      transition: { delay, duration: 0.5, ease: PAPER_EASE },
    });
    return () => controls.stop();
  }, [controls, delay, direction, enabled, inView]);
  const Tag = as === "article" ? motion.article : motion.div;
  return (
    <Tag
      ref={ref}
      className={className}
      data-paper-reveal=""
      initial={false}
      animate={controls}
    >
      {children}
    </Tag>
  );
}

const digitVariants: Variants = {
  enter: { y: "80%", opacity: 0.3 },
  ready: { y: 0, opacity: 1, transition: { duration: 0.4, ease: PAPER_EASE } },
};

/** Reveal the real digits, not a fabricated intermediate balance/count-up. */
export function SettlementNumber({ value }: { value: string }) {
  const enabled = useMarketingMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const played = useRef(false);
  const controls = useAnimationControls();
  useEffect(() => {
    if (!enabled) {
      controls.set("ready");
      return;
    }
    if (!inView || played.current) return;
    played.current = true;
    controls.set("enter");
    void controls.start("ready");
    return () => controls.stop();
  }, [controls, enabled, inView]);
  return (
    <span className="settlement-number" ref={ref} data-settlement-value={value}>
      <span className="sr-only">{value}</span>
      <motion.span
        aria-hidden="true"
        className="number-digits"
        initial={false}
        animate={controls}
        variants={{ ready: { transition: { staggerChildren: 0.025 } } }}
      >
        {Array.from(value).map((digit, i) => (
          <span className="digit-window" key={`${i}-${digit}`}>
            <motion.span variants={digitVariants}>{digit}</motion.span>
          </span>
        ))}
      </motion.span>
    </span>
  );
}

const AnimatedLink = motion.create(Link);
type LinkProps = Pick<
  ComponentProps<typeof Link>,
  | "href"
  | "children"
  | "className"
  | "aria-label"
  | "aria-current"
  | "onClick"
  | "onMouseEnter"
  | "onFocus"
  | "onBlur"
>;

export function MarketingLink(props: LinkProps) {
  const enabled = useMarketingMotion();
  return (
    <AnimatedLink
      {...props}
      whileTap={enabled ? { scale: 0.97, y: 1 } : undefined}
      transition={{ duration: enabled ? 0.2 : 0, ease: PAPER_EASE }}
    />
  );
}
