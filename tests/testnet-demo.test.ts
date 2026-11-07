import { describe, expect, it, vi } from "vitest";
import { CONTRACT_ID, demoArguments, recordDemo } from "../scripts/record-testnet-demo.mjs";

const id = "DEMO0001";
const invoice = {
  schema: "payday.invoice.v1", id, status: "pending", description: "TESTNET REGISTRY DEMO - DO NOT PAY",
  clientRef: "testnet-registry-demo", amount: { usd: "1.00", payoutChain: "base" },
  recipient: "controlled-wallet", latestAttempt: null, nearRecordTx: null,
};
const args = demoArguments(invoice, id);
const recorded = { ...args, recorded_by: CONTRACT_ID, recorded_at_ns: "123" };

describe("operator-only, unpaid testnet demo", () => {
  it("uses a separate append-only record slot and never invents payment success", () => {
    expect(args).toMatchObject({ invoice_id: `demo:${id}`, status: "DEMO_UNPAID", origin_tx: "", destination_tx: "", attempt_id: "" });
  });
  for (const changed of [
    { schema: "other" }, { id: "OTHER001" }, { description: "Ordinary invoice" },
    { clientRef: "customer" }, { status: "paid" }, { latestAttempt: { id: "attempt" } },
    { nearRecordTx: "existing" }, { amount: { usd: "100.00", payoutChain: "base" } },
  ]) {
    it(`rejects unsafe demo state ${JSON.stringify(changed)}`, () => {
      expect(() => demoArguments({ ...invoice, ...changed }, id)).toThrow();
    });
  }
  for (const payoutChain of ["base", "arb", "near", "sol"]) {
    it(`preserves Payday payout chain id ${payoutChain}`, () => {
      expect(demoArguments({ ...invoice, amount: { usd: "1.00", payoutChain } }, id).payout_chain).toBe(payoutChain);
    });
  }
  it("submits once with zero attached deposit, verifies final view data, and returns the actual tx URL", async () => {
    const account = {
      viewFunction: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(recorded),
      functionCall: vi.fn().mockResolvedValue({ status: { SuccessValue: "" }, transaction: { hash: "actual-hash" } }),
    };
    expect(await recordDemo(account, args)).toMatchObject({
      network: "testnet", recordId: `demo:${id}`, txHash: "actual-hash",
      explorerUrl: "https://testnet.nearblocks.io/txns/actual-hash", paymentCreated: false, paymentFundsTransferred: false, testnetGasConsumed: true,
    });
    expect(account.functionCall).toHaveBeenCalledTimes(1);
    expect(account.functionCall).toHaveBeenCalledWith(expect.objectContaining({ contractId: CONTRACT_ID, methodName: "record_invoice", args, attachedDeposit: BigInt(0) }));
    expect(account.viewFunction).toHaveBeenLastCalledWith(expect.objectContaining({ methodName: "get_invoice", args: { invoice_id: `demo:${id}` }, blockQuery: { finality: "final" } }));
  });
  it("does not resubmit a demo already on-chain", async () => {
    const account = { viewFunction: vi.fn().mockResolvedValue(recorded), functionCall: vi.fn() };
    await expect(recordDemo(account, args)).rejects.toThrow("already exists");
    expect(account.functionCall).not.toHaveBeenCalled();
  });
  it("fails verification if the recorded fingerprint differs", async () => {
    const account = {
      viewFunction: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce({ ...recorded, status: "SUCCESS" }),
      functionCall: vi.fn().mockResolvedValue({ status: { SuccessValue: "" }, transaction: { hash: "hash" } }),
    };
    await expect(recordDemo(account, args)).rejects.toThrow("did not match");
  });
  it("does not declare a failed transaction successful", async () => {
    const account = {
      viewFunction: vi.fn().mockResolvedValue(null),
      functionCall: vi.fn().mockResolvedValue({ status: { Failure: {} }, transaction: { hash: "failed-hash" } }),
    };
    await expect(recordDemo(account, args)).rejects.toThrow("not confirmed successful");
  });
});
