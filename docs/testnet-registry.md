# NEAR testnet invoice records

## Networks and truthfulness

Payments still use the existing mainnet NEAR Intents / 1Click flow. The optional
invoice registry stores **metadata on NEAR testnet**, not customer funds and not
mainnet payment proof. Its network setting never changes payment routing.

- Contract: [payday-registry-1794060636.testnet](https://testnet.nearblocks.io/address/payday-registry-1794060636.testnet)
- Existing standalone contract test: [59ucjgZ2VmooQaG8JiuH3zuF7chvAMkoEaWDzEMH7DK4](https://testnet.nearblocks.io/txns/59ucjgZ2VmooQaG8JiuH3zuF7chvAMkoEaWDzEMH7DK4).
  This is a synthetic contract record, not proof of a real payment or a Payday production integration.
- Testnet RPC: `https://rpc.testnet.near.org`.
- Contract reads use `get_invoice({ invoice_id })` via NEAR's documented
  [read-only contract RPC](https://docs.near.org/api/rpc/contracts).

## Production configuration (requires project access)

Set these **production-targeted** variables through the sanctioned Vercel env tool,
then redeploy the exact tested commit. Do not extract Vercel tokens to work around
project access failures. Do not send key material in chat, logs or git.

| Name | Required setting |
| --- | --- |
| `NEAR_INVOICE_CONTRACT_ID` | `payday-registry-1794060636.testnet` |
| `NEAR_RELAYER_ACCOUNT_ID` | Authorized testnet account matching the actual key; existing contract test was self-signed by the contract account |
| `NEAR_RELAYER_KEY` | Sensitive production value, securely injected from the matching account credential |
| `NEAR_NETWORK` | `testnet` |

The app fails closed for non-testnet networks or non-testnet named accounts.
SDK/provider error details are not logged or returned, because they may contain
request data. A registry failure must never break settlement.

**Lifecycle:** the existing server hook records only after real `SUCCESS` settlement.
Creating an unpaid link does not automatically make an on-chain record. The
append-only contract accepts only one record per ID, so do not record an unpaid
demo under the eventual settlement's invoice ID. No contract-build PR is needed
to call the already deployed contract.

## One no-payment live demo (operator only, not yet executed)

Do this only after production configuration and exact-SHA deployment are verified.
No new public write endpoint is exposed. The operator script below uses the
explicitly named testnet account file locally, never customer keys.

1. Create **one** invoice through the existing documented `POST /api/links` endpoint
   at `https://payday-near.vercel.app`. Use a controlled receiving wallet, an amount
   between $0.01 and $2.00, description `TESTNET REGISTRY DEMO - DO NOT PAY`, and
   client reference `testnet-registry-demo`. No unnecessary personal data.
   Save the returned dashboard token privately; never print it or include it in reports.
   Do not call either `/quote` or `/pay`, send funds, or simulate a success status.
2. Dry-run using the returned public invoice ID:

   ```sh
   node scripts/record-testnet-demo.mjs --invoice-id INVOICE_ID
   ```

   This reads only the live public invoice API, validates the explicit demo label,
   pending/unquoted status and amount, and prints the proposed testnet metadata.
3. With approval for the single demo record, submit once:

   ```sh
   node scripts/record-testnet-demo.mjs --invoice-id INVOICE_ID --submit \
     --credential-file /exact/known/path/payday-registry-1794060636.testnet.json
   ```

   The script verifies the credential account and its derived public key against
   testnet, calls only `record_invoice` with zero attached deposit (testnet gas is
   consumed), checks execution success, then reads `get_invoice` at finality `final`
   to compare every fingerprint field. A preflight existing-record check prevents
   resubmission of a landed demo. Errors suppress raw SDK/credential details.
4. Report the actual transaction URL from successful output, plus the invoice ID
   and namespaced record ID `demo:INVOICE_ID`. The record status is `DEMO_UNPAID`,
   with empty payment transaction and attempt fields. It deliberately does not
   mutate paid status or `nearRecordTx` in Payday. It does not consume the normal
   settlement record slot. Do not label it as an automatic production-server write
   or a verified payment. This operator demo alone does not prove the production
   relayer can sign; that requires a separately authorized future settlement test.

If the script stops after submission, do not create another invoice or blindly
retry. Read `get_invoice` for the same namespaced record ID first. A testnet
fingerprint is not a payment receipt.
