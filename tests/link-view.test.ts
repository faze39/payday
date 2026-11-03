import { describe, expect, it } from "vitest";
import { getLinkView } from "@/lib/payments";
import { LocalStore } from "@/lib/store/memory";
import type { PaymentAttempt, PaymentLink } from "@/lib/store/types";

const link: PaymentLink = {
  id: "L1", ownerTokenHash: "h", recipientAddress: "0x2527D02599Ba641c19FEa793cD0F167589a0f10D", payoutChain: "base",
  destAssetId: "x", amountUsd: "2", amountBaseUnits: "2000000", description: "d", clientRef: "", 
  expiresAt: "2099-01-01T00:00:00.000Z", createdAt: "2026-01-01T00:00:00.000Z", paidAt: null,
};
const attempt = (id: string, status: PaymentAttempt["status"], createdAt: string): PaymentAttempt => ({
  id, linkId: "L1", originAssetId: "a", originChain: "sol", originSymbol: "USDC", refundTo: "r", depositAddress: "d",
  depositMemo: null, amountIn: "1", amountInFormatted: "1", minAmountIn: "1", quoteExpiresAt: createdAt, correlationId: "c",
  status, amountOutFormatted: null, originTxs: [], destinationTxs: [], refundReason: null, refundedAmountFormatted: null,
  createdAt, updatedAt: createdAt,
});

describe("getLinkView", () => {
  it("returns null for a missing link", async () => {
    expect(await getLinkView("nope", new LocalStore())).toBeNull();
  });
  it("has no receipt while pending", async () => {
    const s = new LocalStore();
    await s.createLink(link);
    await s.createAttempt(attempt("A1", "PENDING_DEPOSIT", "2026-01-01T00:01:00.000Z"));
    const v = await getLinkView("L1", s);
    expect(v).toMatchObject({ status: "pending", receiptId: null });
    expect(v).not.toHaveProperty("ownerTokenHash");
  });
  it("points a paid link to the successful attempt", async () => {
    const s = new LocalStore();
    await s.createLink({ ...link, paidAt: "2026-01-01T00:05:00.000Z" });
    await s.createAttempt(attempt("A1", "REFUNDED", "2026-01-01T00:01:00.000Z"));
    await s.createAttempt(attempt("A2", "SUCCESS", "2026-01-01T00:02:00.000Z"));
    expect(await getLinkView("L1", s)).toMatchObject({ status: "paid", receiptId: "A2" });
  });
});
