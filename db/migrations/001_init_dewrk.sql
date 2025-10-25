-- 001_init_dewrk.sql
-- Base schema for Dewrk testnet database (Postgres 15+ compatible)

create schema if not exists dewrk;

create extension if not exists "pgcrypto";

create table if not exists dewrk.testnets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  network text not null,
  status text not null default 'UPCOMING',
  difficulty text not null default 'MEDIUM',
  short_description text,
  description text,
  hero_image_url text,
  logo_url text,
  est_time_minutes integer,
  reward_type text,
  reward_note text,
  kyc_required boolean not null default false,
  requires_wallet boolean not null default true,
  tags jsonb not null default '[]'::jsonb,
  categories jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  prerequisites jsonb not null default '[]'::jsonb,
  getting_started jsonb not null default '[]'::jsonb,
  website_url text,
  github_url text,
  twitter_url text,
  discord_url text,
  dashboard_url text,
  has_dashboard boolean not null default false,
  total_raised_usd numeric(18,2),
  discord_roles jsonb not null default '[]'::jsonb,
  tasks_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint difficulty_check check (difficulty in ('EASY','MEDIUM','HARD')),
  constraint status_check check (status in ('LIVE','PAUSED','ENDED','UPCOMING'))
);

create table if not exists dewrk.tasks (
  id uuid primary key default gen_random_uuid(),
  testnet_id uuid not null references dewrk.testnets(id) on delete cascade,
  title text not null,
  description text,
  url text,
  reward text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_testnet_idx on dewrk.tasks(testnet_id);

create table if not exists dewrk.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  resource text not null,
  resource_id text,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_resource_idx on dewrk.audit_logs(resource, resource_id);
create index if not exists audit_logs_created_at_idx on dewrk.audit_logs(created_at);

create or replace function dewrk.tg_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_timestamp on dewrk.testnets;
create trigger set_timestamp
before update on dewrk.testnets
for each row
execute procedure dewrk.tg_set_timestamp();

drop trigger if exists set_timestamp on dewrk.tasks;
create trigger set_timestamp
before update on dewrk.tasks
for each row
execute procedure dewrk.tg_set_timestamp();
