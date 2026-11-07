# Payday invoice-registry (NEAR)

Small [near-sdk](https://docs.near.org/sdk/rust/introduction) contract that **records** invoice fingerprints after a Payday payment settles. It **never holds funds**.

## What it stores

`invoice_id`, `amount_usd`, `recipient`, `payout_chain`, `status` (e.g. `SUCCESS`), `origin_tx`, `destination_tx`, `attempt_id`, plus block timestamp and caller.

## Estimated cost (UNVERIFIED — check live prices)

| Item | Rough NEAR |
| --- | --- |
| Create named account (optional) | ~0.1–0.2 NEAR storage stake (refundable on delete) |
| Deploy WASM (~few hundred KB) | ~0.5–2 NEAR storage (depends on final binary size) |
| Each `record_invoice` | gas only if storage already reserved; small storage growth per record |

Bring **~5 NEAR** on the deployer account so you have headroom; unused storage stake can be recovered later. Prices move — treat this as a planning figure only.

## Toolchain note

`near-sdk` 5.x needs **rustc >= 1.88**. On 2026-11-07 the box was moved to rustc 1.99.1 via rustup: `cargo test` passes (3/3) and `cargo build --target wasm32-unknown-unknown --release` produces a ~130 KB wasm. Use `cargo near build` for the deploy artifact, since newer rustc wasm output can include features the NEAR runtime rejects.

There is no separate relayer list: the owner account is the relayer. Init with `restrict_to_owner: true` and use the owner's key as `NEAR_RELAYER_KEY`.

## Deploy (you must run this)

1. Install [cargo-near](https://github.com/near/cargo-near) and a NEAR wallet (Meteor / NEAR CLI).
2. Create an account you control, e.g. `invoice-registry.<your>.near` or an implicit account.
3. From this directory:

```bash
rustup target add wasm32-unknown-unknown
cargo test
cargo near build
# or: cargo build --target wasm32-unknown-unknown --release
```

4. Deploy + init (NEAR CLI example — adjust account names):

```bash
near contract deploy <CONTRACT_ID> use-file target/near/invoice_registry.wasm \
  without-init-call network-config mainnet sign-with-keychain
near contract call-function as-transaction <CONTRACT_ID> new \
  json-args '{"owner":"<YOUR_ACCOUNT>","restrict_to_owner":true}' prepaid-gas '30.0 Tgas' \
  attached-deposit '0 NEAR' \
  sign-as <YOUR_ACCOUNT> network-config mainnet
```

Exact `near` CLI flags change between versions — verify against current docs: https://docs.near.org/tools/near-cli

5. Put in Vercel env (never commit):

```
NEAR_INVOICE_CONTRACT_ID=<CONTRACT_ID>
NEAR_RELAYER_ACCOUNT_ID=<RELAYER_ACCOUNT>
NEAR_RELAYER_KEY=ed25519:...
NEAR_NETWORK=mainnet
```

Payday calls `record_invoice` from the server after a `SUCCESS` 1Click status when those env vars are set (`src/lib/near-registry.ts`). Soft-fails if unset.

## Status

- Contract compiles, unit tests pass (3/3) after a serializer fix on 2026-11-07
- Mainnet deploy: **not done from this environment** (needs your keys)
- Relayer live call: **UNVERIFIED**
