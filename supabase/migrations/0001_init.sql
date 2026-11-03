-- Payday schema. Run it once in the Supabase SQL editor (or with `supabase db push`).
-- Only the server reads and writes these tables, using the service-role key. RLS is on with no policies, so the public anon key can read nothing.

create table if not exists payment_links (
  id                 text primary key,
  owner_token_hash   text not null,
  recipient_address  text not null,
  payout_chain       text not null check (payout_chain in ('base','arb','near','sol')),
  dest_asset_id      text not null,
  amount_usd         numeric(12,2) not null check (amount_usd > 0),
  amount_base_units  text not null,
  description        text not null,
  client_ref         text not null default '',
  expires_at         timestamptz not null,
  created_at         timestamptz not null default now(),
  paid_at            timestamptz
);
create index if not exists payment_links_owner_idx on payment_links (owner_token_hash, created_at desc);

create table if not exists payment_attempts (
  id                          text primary key,
  link_id                     text not null references payment_links(id) on delete cascade,
  origin_asset_id             text not null,
  origin_chain                text not null,
  origin_symbol               text not null,
  refund_to                   text not null,
  deposit_address             text not null,
  deposit_memo                text,
  amount_in                   text not null,
  amount_in_formatted         text not null,
  min_amount_in               text not null,
  quote_expires_at            timestamptz not null,
  correlation_id              text not null,
  status                      text not null,
  amount_out_formatted        text,
  origin_txs                  jsonb not null default '[]',
  destination_txs             jsonb not null default '[]',
  refund_reason               text,
  refunded_amount_formatted   text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
create index if not exists payment_attempts_link_idx on payment_attempts (link_id, created_at desc);

alter table payment_links enable row level security;
alter table payment_attempts enable row level security;
