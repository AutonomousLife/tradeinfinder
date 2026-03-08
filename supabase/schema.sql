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

create table if not exists raw_ingest (
  id text primary key,
  merchant_id text references merchants(id),
  source_name text not null,
  fetch_url text not null,
  source_url text not null,
  payload jsonb not null,
  retrieved_at timestamptz not null,
  parse_status text not null,
  parse_errors jsonb not null default '[]'::jsonb,
  merchant_parser_version text not null,
  capture_mode text not null
);

create table if not exists value_records (
  id text primary key,
  slug text unique not null,
  device_id text references devices(id),
  merchant_id text references merchants(id),
  storage_variant text not null,
  condition text not null,
  value_amount integer not null,
  currency text not null default 'USD',
  value_type text not null,
  source_name text not null,
  source_url text not null,
  raw_source_id text references raw_ingest(id),
  retrieved_at timestamptz not null,
  stale_after_hours integer not null,
  verification_status text not null,
  confidence_score numeric not null,
  notes text not null default '',
  manual_override boolean not null default false,
  active boolean not null default true,
  target_device_slug text,
  condition_notes text,
  exact_storage_match boolean not null default true,
  origin text not null,
  public_visible boolean not null default false,
  quote_captured_at timestamptz
);

create table if not exists resale_estimates (
  id text primary key,
  device_id text references devices(id),
  source_type text not null,
  condition text not null,
  estimated_sale_price integer not null,
  estimated_fees integer not null,
  net_estimated_value integer not null,
  confidence_score numeric not null,
  last_checked_at timestamptz not null,
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

create table if not exists quote_artifacts (
  id text primary key,
  merchant_id text references merchants(id),
  device_slug text not null,
  target_device_slug text,
  condition text not null,
  source_url text not null,
  artifact_type text not null,
  payload text not null,
  captured_at timestamptz not null,
  parser_version text not null
);

create table if not exists quote_runs (
  id text primary key,
  merchant_id text references merchants(id),
  device_slug text not null,
  target_device_slug text,
  condition text not null,
  status text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  error text,
  artifact_id text references quote_artifacts(id),
  value_record_id text references value_records(id)
);

create table if not exists quote_jobs (
  id text primary key,
  merchant_id text references merchants(id),
  target_device_slug text,
  cadence text not null,
  priority text not null,
  status text not null,
  last_run_at timestamptz,
  next_run_at timestamptz,
  note text not null default ''
);

create index if not exists value_records_public_visible_idx on value_records(public_visible);
create index if not exists value_records_device_idx on value_records(device_id, merchant_id, condition);
create index if not exists quote_runs_lookup_idx on quote_runs(merchant_id, device_slug, condition, started_at desc);
create index if not exists raw_ingest_merchant_retrieved_idx on raw_ingest(merchant_id, retrieved_at desc);