create table if not exists devices (
  id text primary key,
  slug text unique not null,
  brand text not null,
  model text not null,
  year integer not null,
  storage_variants jsonb not null,
  msrp integer not null,
  image_url text not null,
  release_date date not null,
  category text not null,
  supported_conditions jsonb not null,
  deprecated boolean not null default false,
  notes text not null default ''
);

create table if not exists merchants (
  id text primary key,
  slug text unique not null,
  name text not null,
  type text not null,
  logo_url text not null,
  site_url text not null,
  affiliate_capable boolean not null default false,
  default_link_type text not null,
  trust_score numeric not null,
  notes text not null default ''
);

create table if not exists offers (
  id text primary key,
  slug text unique not null,
  merchant_id text references merchants(id),
  carrier_name text,
  target_device text not null,
  target_device_slug text not null,
  accepted_trade_in_devices jsonb not null,
  accepted_conditions jsonb not null,
  trade_in_type text not null,
  trade_in_value integer not null,
  monthly_credit_amount numeric,
  months integer,
  new_line_required boolean not null default false,
  installment_required boolean not null default false,
  eligible_plan_required boolean not null default false,
  online_only boolean not null default false,
  in_store_only boolean not null default false,
  unlocked_required boolean not null default false,
  activation_required boolean not null default false,
  start_date date not null,
  end_date date not null,
  source_url text not null,
  source_type text not null,
  confidence_score numeric not null,
  last_verified_at timestamptz not null,
  fine_print_summary text not null,
  notes text not null default ''
);

create table if not exists acquisition_sources (
  id text primary key,
  device_id text references devices(id),
  merchant_id text references merchants(id),
  source_type text not null,
  title text not null,
  url text not null,
  affiliate_url text,
  estimated_price integer not null,
  condition text not null,
  seller_rating_or_confidence numeric not null,
  last_checked_at timestamptz not null
);

create table if not exists saved_scenarios (
  id text primary key,
  user_id uuid not null,
  current_device text not null,
  target_device text not null,
  condition text not null,
  preferences jsonb not null default '{}'::jsonb,
  result_snapshot jsonb not null
);

create table if not exists raw_ingest (
  id text primary key,
  source_name text not null,
  source_url text not null,
  payload jsonb not null,
  parsed_at timestamptz not null,
  status text not null,
  errors text not null default ''
);
