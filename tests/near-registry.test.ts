import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { recordInvoiceSettlement } from "@/lib/near-registry";
import type { PaymentAttempt, PaymentLink } from "@/lib/store/types";

const sdk = vi.hoisted(() => ({ call: vi.fn(), connect: vi.fn() }));
vi.mock("near-api-js", () => ({
  utils: { KeyPair: { fromString: () => ({}) } },
  keyStores: { InMemoryKeyStore: class { async setKey() {} } },
  connect: sdk.connect,
}));
const link: PaymentLink = {
  id: "DEMO0001", ownerTokenHash: "hash", recipientAddress: "example.near", payoutChain: "near",
  destAssetId: "usdc", amountUsd: "1.00", amountBaseUnits: "1000000", description: "Invoice",
  clientRef: "", lineItems: [], expiresAt: "2026-12-01", createdAt: "2026-11-01", paidAt: "2026-11-02", nearRecordTx: null,
};
const attempt: PaymentAttempt = {
  id: "attempt1", linkId: link.id, originAssetId: "usdc", originChain: "base", originSymbol: "USDC",
  refundTo: "refund", depositAddress: "deposit", depositMemo: null, amountIn: "1000000", amountInFormatted: "1.00",
  minAmountIn: "1000000", quoteExpiresAt: "2026-12-01", correlationId: "correlation", status: "SUCCESS",
  amountOutFormatted: "1.00", originTxs: [{ hash: "origin", explorerUrl: "" }],
  destinationTxs: [{ hash: "destination", explorerUrl: "" }], refundReason: null, refundedAmountFormatted: null,
  createdAt: "2026-11-01", updatedAt: "2026-11-02",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEAR_INVOICE_CONTRACT_ID", "payday-registry-1794060636.testnet");
  vi.stubEnv("NEAR_RELAYER_ACCOUNT_ID", "payday-registry-1794060636.testnet");
  vi.stubEnv("NEAR_RELAYER_KEY", "ed25519:unit-test-placeholder");
  vi.stubEnv("NEAR_NETWORK", undefined);
  sdk.connect.mockResolvedValue({ account: async () => ({ functionCall: sdk.call }) });
  sdk.call.mockResolvedValue({ status: { SuccessValue: "" }, transaction_outcome: { id: "testnet-tx" } });
});
afterEach(() => vi.unstubAllEnvs());

describe("testnet invoice registry", () => {
  it("defaults to testnet, zero deposit, and preserves the actual settlement fields", async () => {
    expect(await recordInvoiceSettlement(link, attempt)).toEqual({ ok: true, txHash: "testnet-tx" });
    expect(sdk.connect).toHaveBeenCalledWith(expect.objectContaining({ networkId: "testnet", nodeUrl: "https://rpc.testnet.near.org" }));
    expect(sdk.call).toHaveBeenCalledWith(expect.objectContaining({
      methodName: "record_invoice", attachedDeposit: BigInt(0), gas: BigInt("30000000000000"),
      args: { invoice_id: link.id, amount_usd: "1.00", recipient: "example.near", payout_chain: "near",
        status: "SUCCESS", origin_tx: "origin", destination_tx: "destination", attempt_id: attempt.id },
    }));
  });
  for (const [name, value] of [
    ["NEAR_NETWORK", "mainnet"], ["NEAR_NETWORK", "typo"],
    ["NEAR_INVOICE_CONTRACT_ID", "registry.near"], ["NEAR_RELAYER_ACCOUNT_ID", "relayer.near"],
  ]) {
    it(`fails closed for ${name}=${value}`, async () => {
      vi.stubEnv(name, value);
      expect((await recordInvoiceSettlement(link, attempt)).ok).toBe(false);
      expect(sdk.connect).not.toHaveBeenCalled();
    });
  }
  it("does not record when unconfigured or when settlement is not SUCCESS", async () => {
    expect((await recordInvoiceSettlement(link, { ...attempt, status: "PENDING_DEPOSIT" })).ok).toBe(false);
    vi.stubEnv("NEAR_RELAYER_KEY", "");
    expect((await recordInvoiceSettlement(link, attempt)).ok).toBe(false);
    expect(sdk.connect).not.toHaveBeenCalled();
  });
  it("does not resubmit an already-recorded settlement", async () => {
    expect(await recordInvoiceSettlement({ ...link, nearRecordTx: "existing" }, attempt)).toMatchObject({ ok: true, txHash: "existing" });
    expect(sdk.call).not.toHaveBeenCalled();
  });
  it("does not mistake a transaction hash for execution success", async () => {
    sdk.call.mockResolvedValue({ status: { Failure: {} }, transaction_outcome: { id: "failed-tx" } });
    expect((await recordInvoiceSettlement(link, attempt)).ok).toBe(false);
  });
  it("soft-fails without returning or logging potentially sensitive SDK errors", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    sdk.call.mockRejectedValue(new Error("sensitive SDK request data"));
    const result = await recordInvoiceSettlement(link, attempt);
    expect(result.ok).toBe(false);
    expect(result.error).not.toContain("sensitive SDK request data");
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
