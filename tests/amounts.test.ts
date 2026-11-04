import { describe, expect, it } from "vitest";
import { clientPaidView, liveAmounts, mapStatus } from "@/lib/status";

describe("clientPaidView", () => {
  it("shows the on-chain deposit when 1Click reports it", () => {
    const v = clientPaidView("2.023038", liveAmounts({ depositedAmountFormatted: "2.020567", refundedAmountFormatted: "0.00778" }));
    expect(v).toEqual({ label: "Client sent", amount: "2.020567", actual: true });
  });
  it("falls back to an honestly labelled quote", () => {
    expect(clientPaidView("2.023038", null)).toEqual({ label: "Quoted amount", amount: "2.023038", actual: false });
    expect(clientPaidView("2.023038", liveAmounts({}))).toMatchObject({ label: "Quoted amount" });
  });
});

describe("liveAmounts", () => {
  it("drops zero and missing values", () => {
    expect(liveAmounts({ depositedAmountFormatted: "0", refundedAmountFormatted: "0.0" })).toEqual({ depositedAmountFormatted: null, refundedAmountFormatted: null });
    expect(liveAmounts(undefined)).toEqual({ depositedAmountFormatted: null, refundedAmountFormatted: null });
  });
});

describe("underpay and refund copy", () => {
  it("underpaid keeps polling and mentions the deadline and refund", () => {
    const m = mapStatus("INCOMPLETE_DEPOSIT");
    expect(m.terminal).toBe(false);
    expect(m.guidance).toMatch(/minimum/);
    expect(m.guidance).toMatch(/deadline/);
    expect(m.guidance).toMatch(/refunded/);
  });
  it("refunded is terminal and mentions the refund fee", () => {
    const m = mapStatus("REFUNDED");
    expect(m.terminal).toBe(true);
    expect(m.guidance).toMatch(/refund fee/);
  });
});
