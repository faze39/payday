/**
 * Optional gasless write to the NEAR invoice-registry contract after a SUCCESS settlement.
 *
 * The contract only RECORDS invoice fingerprints. It never holds funds.
 * Freelancers do not need NEAR: the server uses a relayer account from env vars.
 *
 * Env (Vercel secrets only — never commit):
 *   NEAR_INVOICE_CONTRACT_ID   payday-registry-1794060636.testnet
 *   NEAR_RELAYER_ACCOUNT_ID    authorized testnet signer
 *   NEAR_RELAYER_KEY           ed25519:… secret key for that account
 *   NEAR_NETWORK               testnet only (default testnet)
 *
 * Invoice records are TESTNET metadata, not mainnet payment or settlement proof.
 * This network setting does not change the independent 1Click payment network.
 */

import type { PaymentAttempt, PaymentLink } from "./store/types";

export interface RecordResult {
  ok: boolean;
  txHash?: string;
  skipped?: string;
  error?: string;
}

/** Soft-fail wrapper: never throws into the payment path. */
export async function recordInvoiceSettlement(link: PaymentLink, attempt: PaymentAttempt): Promise<RecordResult> {
  const contractId = process.env.NEAR_INVOICE_CONTRACT_ID?.trim();
  const accountId = process.env.NEAR_RELAYER_ACCOUNT_ID?.trim();
  const privateKey = process.env.NEAR_RELAYER_KEY?.trim();
  const network = (process.env.NEAR_NETWORK ?? "testnet").trim();

  if (!contractId || !accountId || !privateKey) {
    return {
      ok: false,
      skipped:
        "NEAR_INVOICE_CONTRACT_ID, NEAR_RELAYER_ACCOUNT_ID, and NEAR_RELAYER_KEY are not all set. Configure the testnet registry relayer to enable invoice records.",
    };
  }
  if (network !== "testnet" || !contractId.endsWith(".testnet") || !accountId.endsWith(".testnet")) {
    return { ok: false, error: "Invoice records require NEAR testnet and testnet contract/relayer accounts." };
  }
  if (attempt.status !== "SUCCESS") {
    return { ok: false, skipped: "Only confirmed settlements are recorded automatically." };
  }
  if (link.nearRecordTx) return { ok: true, txHash: link.nearRecordTx, skipped: "already recorded" };

  const originHash = attempt.originTxs[0]?.hash ?? "";
  const destHash = attempt.destinationTxs[0]?.hash ?? "";
  const args = {
    invoice_id: link.id,
    amount_usd: link.amountUsd,
    recipient: link.recipientAddress,
    payout_chain: link.payoutChain,
    status: attempt.status,
    origin_tx: originHash,
    destination_tx: destHash,
    attempt_id: attempt.id,
  };

  try {
    // Dynamic import so builds without keys stay light and tests do not load the SDK.
    const nearAPI = await import("near-api-js");
    const keyPair = nearAPI.utils.KeyPair.fromString(privateKey as `ed25519:${string}`);
    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
    await keyStore.setKey(network, accountId, keyPair);
    const near = await nearAPI.connect({
      networkId: network,
      nodeUrl: "https://rpc.testnet.near.org",
      keyStore,
      headers: {},
    });
    const account = await near.account(accountId);
    const result = await account.functionCall({
      contractId,
      methodName: "record_invoice",
      args,
      gas: BigInt("30000000000000"),
      attachedDeposit: BigInt("0"),
    });
    if (typeof result.status !== "object" || !("SuccessValue" in result.status)) {
      return { ok: false, error: "The testnet registry transaction did not complete successfully." };
    }
    const txHash =
      typeof result?.transaction_outcome?.id === "string"
        ? result.transaction_outcome.id
        : typeof result?.transaction?.hash === "string"
          ? result.transaction.hash
          : undefined;
    if (!txHash) return { ok: false, error: "NEAR call returned no transaction hash (UNVERIFIED shape)." };
    return { ok: true, txHash };
  } catch {
    // SDK/provider errors can include request data. Never log or return raw errors.
    return { ok: false, error: "Testnet invoice registry write failed. Payment settlement is unaffected." };
  }
}
