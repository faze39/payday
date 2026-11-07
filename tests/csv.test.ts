import { describe, expect, it } from "vitest";
import { buildDashboardCsv, CSV_HEADERS } from "@/lib/csv";
import type { PaymentAttempt, PaymentLink } from "@/lib/store/types";

const link: PaymentLink = {
  id: "pl_1",
  ownerTokenHash: "abc",
  recipientAddress: "0x2527D02599Ba641c19FEa793cD0F167589a0f10D",
  payoutChain: "base",
  destAssetId: "nep141:base.usd",
  amountUsd: "2.00",
  amountBaseUnits: "2000000",
  description: "Test invoice",
  clientRef: "Acme",
  lineItems: [],
  expiresAt: "2026-12-01T00:00:00.000Z",
  createdAt: "2026-11-01T00:00:00.000Z",
  paidAt: "2026-11-03T00:00:00.000Z",
  nearRecordTx: null,
};

const successAttempt: PaymentAttempt = {
  id: "att_1",
  linkId: "pl_1",
  originAssetId: "sol.usdc",
  originChain: "sol",
  originSymbol: "USDC",
  refundTo: "SoLAddr",
  depositAddress: "dep",
  depositMemo: null,
  amountIn: "2020567",
  amountInFormatted: "2.020567",
  minAmountIn: "2020567",
  quoteExpiresAt: "2026-11-03T01:00:00.000Z",
  correlationId: "c1",
  status: "SUCCESS",
  amountOutFormatted: "2.00",
  originTxs: [{ hash: "547PEU3gUVs6qXJiJCPDniw64XRb8TicPRcZiymfpoD4MkPLobvvQ8XCMzB4ewkEuNeATda5uwTpRMxLZ2WMj61W", explorerUrl: "" }],
  destinationTxs: [{ hash: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef", explorerUrl: "https://basescan.org/tx/0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" }],
  refundReason: null,
  refundedAmountFormatted: null,
  createdAt: "2026-11-03T00:00:00.000Z",
  updatedAt: "2026-11-03T00:01:00.000Z",
};

describe("buildDashboardCsv", () => {
  it("includes headers and SUCCESS status with explorer URLs", () => {
    const csv = buildDashboardCsv([{ link, attempts: [successAttempt] }], new Date("2026-11-06T00:00:00Z"));
    const [header, row] = csv.trim().split("\n");
    expect(header.split(",")).toEqual([...CSV_HEADERS]);
    expect(row).toContain("SUCCESS");
    expect(row).toContain("delivered");
    expect(row).toContain("Delivered");
    expect(row).toContain("https://solscan.io/tx/");
    expect(row).toContain("https://basescan.org/tx/");
    expect(row).toContain("paid");
  });

  it("maps REFUNDED and emits a row with no attempts", () => {
    const refunded = { ...successAttempt, id: "att_2", status: "REFUNDED" as const, originTxs: [], destinationTxs: [], refundReason: "INCOMPLETE_DEPOSIT" };
    const csv = buildDashboardCsv([{ link: { ...link, paidAt: null }, attempts: [refunded] }]);
    expect(csv).toContain("REFUNDED");
    expect(csv).toContain("refunded");
    const empty = buildDashboardCsv([{ link: { ...link, paidAt: null, id: "pl_empty" }, attempts: [] }]);
    expect(empty).toContain("pl_empty");
    expect(empty.trim().split("\n")).toHaveLength(2);
  });
});
