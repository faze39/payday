-- Optional invoice line items on payment links (jsonb array).
-- Each item: { "description": string, "qty": number, "unitAmountUsd": string }
-- Empty array means the link has no line-item breakdown (description-only invoice).
-- Run in the Supabase SQL editor after 0001_init.sql.

alter table payment_links
  add column if not exists line_items jsonb not null default '[]'::jsonb;

comment on column payment_links.line_items is 'Optional invoice line items; [] when unused.';
