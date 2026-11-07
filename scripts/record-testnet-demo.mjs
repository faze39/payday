/** Operator-only testnet metadata demo. Dry-run by default; never requests a quote. */
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

export const CONTRACT_ID = "payday-registry-1794060636.testnet";
const SITE = "https://payday-near.vercel.app";
const DESCRIPTION = "TESTNET REGISTRY DEMO - DO NOT PAY";

export function demoArguments(invoice, id) {
  if (!/^[A-Za-z0-9_-]{8}$/.test(id) || invoice.schema !== "payday.invoice.v1" || invoice.id !== id) {
    throw new Error("Unexpected invoice identity.");
  }
  if (invoice.description !== DESCRIPTION || invoice.clientRef !== "testnet-registry-demo") {
    throw new Error("Only an explicitly labelled demo invoice can be recorded.");
  }
  if (invoice.status !== "pending" || invoice.latestAttempt !== null || invoice.nearRecordTx !== null) {
    throw new Error("Demo must be unpaid, unquoted, and not previously recorded.");
  }
  if (!invoice.recipient || !["base", "arb", "near", "sol"].includes(invoice.amount?.payoutChain) ||
      !/^\d+\.\d{2}$/.test(invoice.amount?.usd) || Number(invoice.amount.usd) <= 0 || Number(invoice.amount.usd) > 2) {
    throw new Error("Unexpected demo amount or payout fields.");
  }
  return {
    // Separate namespace: never consumes the append-only settlement record for this invoice.
    invoice_id: `demo:${id}`,
    amount_usd: invoice.amount.usd,
    recipient: invoice.recipient,
    payout_chain: invoice.amount.payoutChain,
    status: "DEMO_UNPAID",
    origin_tx: "",
    destination_tx: "",
    attempt_id: "",
  };
}

export async function recordDemo(account, args) {
  const view = () => account.viewFunction({
    contractId: CONTRACT_ID,
    methodName: "get_invoice",
    args: { invoice_id: args.invoice_id },
    blockQuery: { finality: "final" },
  });
  // A retry never submits a second record if the first write already landed.
  if (await view()) throw new Error("Demo record already exists. Inspect it instead of resubmitting.");
  const result = await account.functionCall({
    contractId: CONTRACT_ID,
    methodName: "record_invoice",
    args,
    gas: 30_000_000_000_000n,
    attachedDeposit: 0n,
  });
  const txHash = result.transaction?.hash ?? result.transaction_outcome?.id;
  if (!result.status || typeof result.status !== "object" || !("SuccessValue" in result.status) || !txHash) {
    throw new Error("Record transaction was not confirmed successful.");
  }
  const record = await view();
  if (!record || record.recorded_by !== CONTRACT_ID ||
      Object.entries(args).some(([key, value]) => record[key] !== value)) {
    throw new Error("Read-only get_invoice verification did not match the demo.");
  }
  return {
    network: "testnet", contractId: CONTRACT_ID, invoiceId: args.invoice_id.slice(5),
    recordId: args.invoice_id, txHash,
    explorerUrl: `https://testnet.nearblocks.io/txns/${txHash}`,
    record, paymentCreated: false, paymentFundsTransferred: false, testnetGasConsumed: true,
  };
}

async function main() {
  let stage = "arguments";
  try {
    const { values } = parseArgs({ options: {
      "invoice-id": { type: "string" }, "credential-file": { type: "string" },
      submit: { type: "boolean", default: false }, help: { type: "boolean", default: false },
    } });
    if (values.help) {
      console.log("Dry run: node scripts/record-testnet-demo.mjs --invoice-id ID\nSubmit: add --submit --credential-file /exact/path/payday-registry-1794060636.testnet.json\nNever requests quotes, changes invoice status, or sends payment funds. Uses testnet gas only.");
      return;
    }
    const id = values["invoice-id"];
    if (!id || !/^[A-Za-z0-9_-]{8}$/.test(id)) throw new Error("Invalid invoice id.");
    stage = "invoice_read";
    const response = await fetch(`${SITE}/api/invoices/${id}`, { signal: AbortSignal.timeout(20000), cache: "no-store", redirect: "error" });
    if (!response.ok) throw new Error("Cannot read live invoice.");
    const args = demoArguments(await response.json(), id);
    if (!values.submit) {
      console.log(JSON.stringify({ dryRun: true, network: "testnet", contractId: CONTRACT_ID, args }, null, 2));
      return;
    }
    stage = "credential_validation";
    const file = values["credential-file"];
    if (!file || basename(file) !== `${CONTRACT_ID}.json`) throw new Error("Matching account credential file required.");
    // Read only this explicitly named testnet account file. Never print its contents or SDK errors.
    const credential = JSON.parse(await readFile(file, "utf8"));
    if (credential.account_id !== CONTRACT_ID) throw new Error("Wrong signer account.");
    const { connect, keyStores, utils } = await import("near-api-js");
    const keyPair = utils.KeyPair.fromString(credential.private_key ?? credential.secret_key);
    if (credential.public_key && credential.public_key !== keyPair.getPublicKey().toString()) throw new Error("Key mismatch.");
    const keyStore = new keyStores.InMemoryKeyStore();
    await keyStore.setKey("testnet", CONTRACT_ID, keyPair);
    const near = await connect({ networkId: "testnet", nodeUrl: "https://rpc.testnet.near.org", keyStore, headers: {} });
    // Prove the derived public key is authorized on the actual testnet account before writing.
    await near.connection.provider.query({ request_type: "view_access_key", finality: "final", account_id: CONTRACT_ID, public_key: keyPair.getPublicKey().toString() });
    stage = "record_and_view_verification";
    const proof = await recordDemo(await near.account(CONTRACT_ID), args);
    console.log(JSON.stringify(proof, null, 2));
  } catch {
    console.error(`Testnet demo stopped at ${stage}. Raw errors suppressed to protect credentials. If submission began, inspect get_invoice before any retry.`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
