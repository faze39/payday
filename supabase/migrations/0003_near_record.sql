-- Optional on-chain invoice fingerprint recorded by the NEAR invoice-registry contract.
-- Populated by the server relayer after a SUCCESS settlement. Never holds funds.

alter table payment_links
  add column if not exists near_record_tx text;

comment on column payment_links.near_record_tx is 'NEAR tx hash from invoice-registry.record_invoice after SUCCESS; null until recorded.';
