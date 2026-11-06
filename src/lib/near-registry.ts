/**
 * Optional gasless write to the NEAR invoice-registry contract after a SUCCESS settlement.
 *
 * The contract only RECORDS invoice fingerprints. It never holds funds.
 * Freelancers do not need NEAR: the server uses a relayer account from env vars.
 *
 * Env (Vercel secrets only — never commit):
 *   NEAR_INVOICE_CONTRACT_ID   e.g. invoice-registry.payday.near  (UNVERIFIED until you deploy)
 *   NEAR_RELAYER_ACCOUNT_ID    e.g. payday-relayer.near
 *   NEAR_RELAYER_KEY           ed25519:… secret key for that account
 *   NEAR_NETWORK               mainnet | testnet (default mainnet)
 *
 * UNVERIFIED: live mainnet call with a real relayer key has not been run from this box.
 */

import type { PaymentAttempt, PaymentLink } from "./store/types";

export interface RecordResult {
  ok: boolean;
  txHash?: string;
  skipped?: string;
  error?: string;
}

function networkUrl(network: string): string {
  return network === "testnet" ? "https://rpc.testnet.near.org" : "https://rpc.mainnet.near.org";
}

/** Soft-fail wrapper: never throws into the payment path. */
export async function recordInvoiceSettlement(link: PaymentLink, attempt: PaymentAttempt): Promise<RecordResult> {
  const contractId = process.env.NEAR_INVOICE_CONTRACT_ID?.trim();
  const accountId = process.env.NEAR_RELAYER_ACCOUNT_ID?.trim();
  const privateKey = process.env.NEAR_RELAYER_KEY?.trim();
  const network = (process.env.NEAR_NETWORK ?? "mainnet").trim();

  if (!contractId || !accountId || !privateKey) {
    return {
      ok: false,
      skipped:
        "NEAR_INVOICE_CONTRACT_ID, NEAR_RELAYER_ACCOUNT_ID, and NEAR_RELAYER_KEY are not all set. Deploy contracts/invoice-registry and add the env vars to record on-chain.",
    };
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
      nodeUrl: networkUrl(network),
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
    const txHash =
      typeof result?.transaction_outcome?.id === "string"
        ? result.transaction_outcome.id
        : typeof result?.transaction?.hash === "string"
          ? result.transaction.hash
          : undefined;
    if (!txHash) return { ok: false, error: "NEAR call returned no transaction hash (UNVERIFIED shape)." };
    return { ok: true, txHash };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[near-registry]", message);
    return { ok: false, error: message };
  }
}
