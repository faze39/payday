# AI agent payments on Payday

Agents can pay an existing Payday invoice through the same NEAR Intents **1Click** flow humans use. Payday does **not** invent a partner API and does **not** require a PingPay key for this path.

## Verified surface (this repo)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/invoices/:id` | Machine-readable invoice JSON (`schema: payday.invoice.v1`) with amount, recipient, line items, `quoteUrl` |
| `POST` | `/api/invoices/:id/pay` | Create a live 1Click quote (`originAsset`, `refundTo`) → deposit address |
| `GET` | `/api/attempts/:attemptId` | Poll status until `phase.terminal` |

CORS: `Access-Control-Allow-Origin: *` on the invoice routes so browser/agent tools can read them.

Human pay page remains `/pay/:id`.

## Research citations (not integrated — keys required)

PingPay hosts an **x402 v2** facilitator that also settles via NEAR Intents / 1Click:

- Facilitator overview: https://pingpay.gitbook.io/docs/pingpay-api/agent-pay-facilitator
- x402 integration (verify quote → deposit → settle): https://pingpay.gitbook.io/docs/pingpay-api/agent-pay-facilitator/x402-integration
- Getting started (needs `X-Api-Key`): https://pingpay.gitbook.io/docs/pingpay-api/agent-pay-facilitator/getting-started
- Agent Connect payer path: https://pingpay.gitbook.io/docs/pingpay-api/agent-pay-facilitator/pay-with-agent-connect
- Spec reference called out by Ping: x402-foundation/x402#3370 (`near-intents`, upfront)

**UNVERIFIED here:** Payday is not registered as a Ping merchant and has no Ping API key, so we do not call `/agentpay/x402/*`. Agents use Payday's native JSON + 1Click instead.

Bitte / other NEAR agent wallets can follow the same deposit-address pattern once they can transfer to the quoted address on the origin chain.

## Demo script (curl)

Replace `BASE`, `INVOICE_ID`, `ORIGIN_ASSET` (from `GET /api/tokens`), and `REFUND`.

```bash
BASE=https://payday-near.vercel.app   # or your preview URL
INVOICE_ID=pl_...

# 1. Read invoice
curl -s "$BASE/api/invoices/$INVOICE_ID" | jq .

# 2. List tokens (pick an assetId the agent can spend)
curl -s "$BASE/api/tokens" | jq '.tokens[:3]'

# 3. Create quote (agent pay)
curl -s -X POST "$BASE/api/invoices/$INVOICE_ID/pay" \
  -H 'content-type: application/json' \
  -d "{\"originAsset\":\"$ORIGIN_ASSET\",\"refundTo\":\"$REFUND\"}" | tee quote.json | jq .

# 4. Agent sends amountInFormatted to depositAddress on originChain (wallet / Intents withdraw)
# 5. Poll
ATTEMPT=$(jq -r .attemptId quote.json)
watch -n 5 "curl -s $BASE/api/attempts/$ATTEMPT | jq '{status:.attempt.status, phase:.phase}'"
```

Do not claim a full autonomous agent paid end-to-end until you have run steps 3–5 with real funds.
