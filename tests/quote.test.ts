import { describe, expect, it } from "vitest";
import { QUOTE_DEADLINE_MS, buildQuoteRequest } from "@/lib/oneclick";
import { PAYOUT_CHAINS } from "@/lib/chains";

const base = {
  originAsset: "nep141:sol-c800a4bd850783ccb82c2b2c7e84175443606352.omft.near",
  originChain: "sol",
  destinationAsset: PAYOUT_CHAINS.base.usdcAssetId,
  amountBaseUnits: "5000000",
  recipient: " 0x2527D02599Ba641c19FEa793cD0F167589a0f10D ",
  refundTo: "13QkxhNMrTPxoCkRdYdJ65tFuwXPhL5gLS2Z5Nr6gjRK",
  dry: false,
  now: new Date("2026-11-03T12:00:00Z"),
};

describe("buildQuoteRequest", () => {
  it("builds an EXACT_OUTPUT request with every field the spec requires", () => {
    const r = buildQuoteRequest(base);
    expect(r).toMatchObject({
      dry: false,
      swapType: "EXACT_OUTPUT",
      slippageTolerance: 100,
      depositType: "ORIGIN_CHAIN",
      refundType: "ORIGIN_CHAIN",
      recipientType: "DESTINATION_CHAIN",
      amount: "5000000",
      recipient: "0x2527D02599Ba641c19FEa793cD0F167589a0f10D",
    });
    for (const k of ["dry", "swapType", "slippageTolerance", "originAsset", "depositType", "destinationAsset", "amount", "refundTo", "refundType", "recipient", "recipientType", "deadline"])
      expect(r).toHaveProperty(k);
    expect(new Date(r.deadline).getTime() - base.now.getTime()).toBe(QUOTE_DEADLINE_MS);
    expect(r.depositMode).toBeUndefined();
  });
  it("requests MEMO deposit mode for Stellar", () => {
    expect(buildQuoteRequest({ ...base, originChain: "stellar" }).depositMode).toBe("MEMO");
  });
  it("rejects non-integer or zero amounts", () => {
    expect(() => buildQuoteRequest({ ...base, amountBaseUnits: "5.0" })).toThrow();
    expect(() => buildQuoteRequest({ ...base, amountBaseUnits: "0" })).toThrow();
  });
});
