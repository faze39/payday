import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiWorkbench, API_EXAMPLES } from "@/components/ApiWorkbench";
import {
  MarketingMotionProvider,
  PaperReveal,
  SettlementNumber,
} from "@/components/marketing-motion";
import { SettlementDesk } from "@/components/SettlementDesk";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("marketing motion static and truthful fallbacks", () => {
  it("server renders the whole slip with visible content and no initial hidden styles", () => {
    const html = renderToStaticMarkup(
      createElement(
        MarketingMotionProvider,
        null,
        createElement(SettlementDesk),
      ),
    );
    expect(html).toContain("USDC on Base");
    expect(html).toContain("SOL");
    expect(html).toContain("Nothing to withdraw");
    expect(html).not.toMatch(
      /opacity:0(?:;|"|\.)|visibility:hidden|translateY/,
    );
  });
  it("a real settlement value is never replaced by a fictional intermediate balance", () => {
    const html = renderToStaticMarkup(
      createElement(SettlementNumber, { value: "2.020567" }),
    );
    expect(html).toContain('data-settlement-value="2.020567"');
    expect(html).toContain('<span class="sr-only">2.020567</span>');
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toMatch(/opacity:0|translateY/);
  });
  it("scroll registration does not conceal server-rendered editorial text", () => {
    const html = renderToStaticMarkup(
      createElement(PaperReveal, null, "Always readable"),
    );
    expect(html).toContain("data-paper-reveal");
    expect(html).toContain("Always readable");
    expect(html).not.toMatch(/opacity:0|visibility:hidden|clip-path/);
  });
  it("the API example is labeled as documentation, never live activity", () => {
    const html = renderToStaticMarkup(createElement(ApiWorkbench));
    expect(html).toContain("DOCUMENTATION EXAMPLES");
    expect(html).toContain("GET /api/invoices/:id");
    expect(html).toContain("No request is sent and no payment is simulated");
    expect(html.match(/aria-pressed=/g)).toHaveLength(3);
    expect(API_EXAMPLES).toHaveLength(3);
    expect(API_EXAMPLES[1].response).toContain("<client-refund-address>");
    expect(API_EXAMPLES[2].response).toContain("awaiting_deposit");
    expect(API_EXAMPLES.map((item) => item.response).join()).not.toContain(
      "SUCCESS",
    );
  });
});

describe("reactive reduced-motion preference", () => {
  it("defaults to static without a browser", async () => {
    const store = await import("@/components/marketing-motion-preference");
    expect(store.staticMotionSnapshot()).toBe(false);
    expect(store.motionPreferenceSnapshot()).toBe(false);
  });
  it("shares one media listener and reacts immediately to OS changes", async () => {
    const handlers = new Set<() => void>();
    const media = {
      matches: true,
      addEventListener: vi.fn((_event: string, listener: () => void) =>
        handlers.add(listener),
      ),
      removeEventListener: vi.fn((_event: string, listener: () => void) =>
        handlers.delete(listener),
      ),
    };
    vi.stubGlobal("window", { matchMedia: vi.fn(() => media) });
    const store = await import("@/components/marketing-motion-preference");
    const first = vi.fn();
    const second = vi.fn();
    const stopFirst = store.subscribeMotionPreference(first);
    const stopSecond = store.subscribeMotionPreference(second);
    expect(media.addEventListener).toHaveBeenCalledTimes(1);
    expect(store.motionPreferenceSnapshot()).toBe(true);
    media.matches = false;
    handlers.forEach((handler) => handler());
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(store.motionPreferenceSnapshot()).toBe(false);
    expect(store.staticMotionSnapshot()).toBe(false);
    stopFirst();
    expect(media.removeEventListener).not.toHaveBeenCalled();
    stopSecond();
    expect(media.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
