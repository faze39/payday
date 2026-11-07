import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import Features from "@/app/features/page";
import HowItWorks from "@/app/how-it-works/page";
import Pricing from "@/app/pricing/page";
import Faq from "@/app/faq/page";
import { SettlementDesk } from "@/components/SettlementDesk";
import { FaqList } from "@/components/MarketingContent";

describe("marketing render contracts", () => {
  for (const [name, Page] of Object.entries({
    Home,
    Features,
    HowItWorks,
    Pricing,
    Faq,
  })) {
    it(`${name} renders a single heading and content without client effects`, () => {
      const html = renderToStaticMarkup(createElement(Page));
      expect(html.match(/<h1\b/g)).toHaveLength(1);
      const createHref = name === "Home" ? "#create" : "/#create";
      expect(html).toContain(`href="${createHref}"`);
      expect(html).not.toMatch(
        /hero-frame|typed-word|orbital|sticky-heading|class="reveal/,
      );
      expect(html).not.toContain("—");
    });
  }
  it("the home page retains the actual invoice form and historical payment proof", () => {
    const html = renderToStaticMarkup(createElement(Home));
    for (const field of [
      "payoutChain",
      "recipientAddress",
      "amountUsd",
      "description",
    ]) {
      expect(html).toContain(`name="${field}"`);
    }
    expect(html).toContain("Historical, not a live feed");
    expect(html).toContain("https://solscan.io/tx/");
    expect(html).toContain("2.020567");
  });
  it("route illustration has accessible token controls and is not presented as a live quote", () => {
    const html = renderToStaticMarkup(createElement(SettlementDesk));
    expect(html.match(/aria-pressed=/g)).toHaveLength(3);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain("Route illustration");
    expect(html).toContain(
      "Actual availability and costs come from a live quote",
    );
  });
  it("FAQ uses native keyboard-accessible disclosure controls", () => {
    const html = renderToStaticMarkup(createElement(FaqList, { all: true }));
    expect(html.match(/<details\b/g)).toHaveLength(8);
    expect(html.match(/<summary\b/g)).toHaveLength(8);
  });
  it("pricing separates the temporary platform fee from settlement costs", () => {
    const html = renderToStaticMarkup(createElement(Pricing));
    expect(html).toContain("during the hackathon");
    expect(html).toContain("Solver &amp; withdrawal costs");
    expect(html).toContain("Origin-chain gas");
    expect(html).toContain("No promise of free forever");
  });
});
