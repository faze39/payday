//! Payday invoice registry — records invoice fingerprints on NEAR.
//! This contract NEVER holds funds or tokens. It is an append-only log.
//!
//! Build (needs rustc >= 1.88 / recent near-sdk):
//!   rustup update && cargo test && cargo build --target wasm32-unknown-unknown --release
//!
//! UNVERIFIED on mainnet until you deploy and set NEAR_INVOICE_CONTRACT_ID.

use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::store::LookupMap;
use near_sdk::{env, near, require, AccountId, NearToken, PanicOnDefault};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct InvoiceRecord {
    pub invoice_id: String,
    pub amount_usd: String,
    pub recipient: String,
    pub payout_chain: String,
    pub status: String,
    pub origin_tx: String,
    pub destination_tx: String,
    pub attempt_id: String,
    pub recorded_at: u64,
    pub recorded_by: AccountId,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    invoices: LookupMap<String, InvoiceRecord>,
    /// When true, only `owner` may call record_invoice.
    restrict_to_owner: bool,
    owner: AccountId,
}

#[near]
impl Contract {
    #[init]
    pub fn new(owner: Option<AccountId>, restrict_to_owner: Option<bool>) -> Self {
        Self {
            invoices: LookupMap::new(b"i"),
            restrict_to_owner: restrict_to_owner.unwrap_or(false),
            owner: owner.unwrap_or_else(env::predecessor_account_id),
        }
    }

    pub fn set_restrict_to_owner(&mut self, value: bool) {
        require!(env::predecessor_account_id() == self.owner, "owner only");
        self.restrict_to_owner = value;
    }

    /// Record an invoice fingerprint. Never accepts deposit / never holds funds.
    #[payable]
    pub fn record_invoice(
        &mut self,
        invoice_id: String,
        amount_usd: String,
        recipient: String,
        payout_chain: String,
        status: String,
        origin_tx: String,
        destination_tx: String,
        attempt_id: String,
    ) {
        require!(
            env::attached_deposit() == NearToken::from_yoctonear(0),
            "do not attach deposit; this contract never holds funds"
        );
        let caller = env::predecessor_account_id();
        if self.restrict_to_owner {
            require!(caller == self.owner, "owner/relayer only");
        }
        require!(!invoice_id.is_empty(), "invoice_id required");
        require!(!self.invoices.contains_key(&invoice_id), "invoice already recorded");

        let record = InvoiceRecord {
            invoice_id: invoice_id.clone(),
            amount_usd,
            recipient,
            payout_chain,
            status,
            origin_tx,
            destination_tx,
            attempt_id,
            recorded_at: env::block_timestamp(),
            recorded_by: caller,
        };
        self.invoices.insert(invoice_id, record);
    }

    pub fn get_invoice(&self, invoice_id: String) -> Option<InvoiceRecord> {
        self.invoices.get(&invoice_id).cloned()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn ctx(predecessor: AccountId, deposit: u128) {
        testing_env!(VMContextBuilder::new()
            .predecessor_account_id(predecessor)
            .attached_deposit(NearToken::from_yoctonear(deposit))
            .build());
    }

    #[test]
    fn records_and_reads() {
        ctx(accounts(0), 0);
        let mut c = Contract::new(Some(accounts(0)), Some(false));
        ctx(accounts(1), 0);
        c.record_invoice(
            "pl_test".into(),
            "2.00".into(),
            "0xabc".into(),
            "base".into(),
            "SUCCESS".into(),
            "soltx".into(),
            "basetx".into(),
            "att_1".into(),
        );
        let got = c.get_invoice("pl_test".into()).expect("stored");
        assert_eq!(got.amount_usd, "2.00");
        assert_eq!(got.status, "SUCCESS");
    }

    #[test]
    #[should_panic(expected = "do not attach deposit")]
    fn rejects_deposit() {
        ctx(accounts(0), 0);
        let mut c = Contract::new(Some(accounts(0)), Some(false));
        ctx(accounts(1), 1);
        c.record_invoice(
            "pl_x".into(),
            "1".into(),
            "r".into(),
            "base".into(),
            "SUCCESS".into(),
            "".into(),
            "".into(),
            "a".into(),
        );
    }

    #[test]
    #[should_panic(expected = "owner/relayer only")]
    fn respects_restrict() {
        ctx(accounts(0), 0);
        let mut c = Contract::new(Some(accounts(0)), Some(true));
        ctx(accounts(1), 0);
        c.record_invoice(
            "pl_y".into(),
            "1".into(),
            "r".into(),
            "base".into(),
            "SUCCESS".into(),
            "".into(),
            "".into(),
            "a".into(),
        );
    }
}
