-- 20251103_extend_testnet_fields.sql
-- Additive migration: extend dewrk.testnets with new optional fields
-- Rules: Postgres 15+, idempotent, no breaking changes

create schema if not exists dewrk;

alter table if exists dewrk.testnets
  add column if not exists start_date timestamptz null,
  add column if not exists has_faucet boolean null,
  add column if not exists reward_category text null,
  add column if not exists reward_range_usd numeric(18,2) null;

-- Optional: index for start_date queries
create index if not exists testnets_start_date_idx on dewrk.testnets (start_date);


