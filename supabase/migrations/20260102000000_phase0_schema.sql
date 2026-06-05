-- ============================================================
-- Kadhaisolai Phase 0 Schema Additions
-- Voice Architecture, Model Registry, and Dataset Architecture
-- ============================================================

-- VOICE ARCHITECTURE
create table if not exists voice_profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  base_provider text not null,
  is_proprietary boolean default false,
  created_at timestamptz default now()
);

create table if not exists voice_models (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references voice_profiles(id) on delete cascade not null,
  checkpoint_path text not null,
  status text default 'training' check (status in ('training', 'active', 'archived')),
  created_at timestamptz default now()
);

create table if not exists voice_versions (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid references voice_models(id) on delete cascade not null,
  version_tag text not null,
  created_at timestamptz default now()
);

create table if not exists voice_traits (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references voice_profiles(id) on delete cascade not null,
  trait_name text not null,
  trait_value text not null
);

-- MODEL REGISTRY
create table if not exists models (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  architecture text not null,
  created_at timestamptz default now()
);

create table if not exists model_versions (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid references models(id) on delete cascade not null,
  version text not null,
  weights_url text not null,
  created_at timestamptz default now()
);

create table if not exists model_evaluations (
  id uuid primary key default uuid_generate_v4(),
  version_id uuid references model_versions(id) on delete cascade not null,
  cer float, -- Character Error Rate
  wer float, -- Word Error Rate
  mos float, -- Mean Opinion Score
  evaluated_at timestamptz default now()
);

create table if not exists training_runs (
  id uuid primary key default uuid_generate_v4(),
  model_id uuid references models(id) on delete cascade not null,
  dataset_version_id uuid not null,
  epochs integer not null,
  status text default 'queued',
  started_at timestamptz,
  completed_at timestamptz
);

-- DATASET ARCHITECTURE
create table if not exists dataset_metadata (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  total_hours float default 0,
  created_at timestamptz default now()
);

create table if not exists dataset_versions (
  id uuid primary key default uuid_generate_v4(),
  dataset_id uuid references dataset_metadata(id) on delete cascade not null,
  version_tag text not null,
  commit_hash text,
  created_at timestamptz default now()
);

create table if not exists dataset_exports (
  id uuid primary key default uuid_generate_v4(),
  version_id uuid references dataset_versions(id) on delete cascade not null,
  export_format text not null,
  s3_path text not null,
  exported_at timestamptz default now()
);
