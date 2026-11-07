#!/usr/bin/env bash
# Demo: fetch a Payday invoice as an agent would. Does not send funds.
set -euo pipefail
BASE="${1:-https://payday-near.vercel.app}"
ID="${2:?usage: agent-pay-demo.sh [baseUrl] <invoiceId>}"
echo "== GET $BASE/api/invoices/$ID =="
curl -fsS "$BASE/api/invoices/$ID" | python3 -m json.tool
