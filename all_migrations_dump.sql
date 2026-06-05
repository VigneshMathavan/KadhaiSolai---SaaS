-- ============================================================
-- KadhaiSolai -- Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (extends Supabase auth.users)
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  avatar_url  text,
  role        text default 'listener' check (role in ('listener', 'author', 'admin')),
  bio         text,
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- BOOKS
create table if not exists books (
  id               uuid primary key default uuid_generate_v4(),
  author_id        uuid references profiles(id) on delete cascade not null,
  title            text not null,
  description      text,
  genre            text default 'Fiction',
  language         text default 'Tamil',
  cover_url        text,
  txt_path         text,
  audio_path       text,
  audio_duration   integer,
  youtube_video_id text,
  status           text default 'processing'
                   check (status in ('processing', 'ready', 'failed')),
  tts_voice        text default 'anand',
  tts_pace         float default 1.0,
  plays_count      integer default 0,
  is_public        boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- TTS JOBS
create table if not exists tts_jobs (
  id           uuid primary key default uuid_generate_v4(),
  book_id      uuid references books(id) on delete cascade not null,
  status       text default 'queued'
               check (status in ('queued', 'processing', 'done', 'failed')),
  progress     integer default 0,
  chunks_done  integer default 0,
  chunks_total integer default 0,
  error        text,
  started_at   timestamptz,
  completed_at timestamptz,
  created_at   timestamptz default now()
);

-- LISTENING PROGRESS
create table if not exists listening_progress (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references profiles(id) on delete cascade not null,
  book_id       uuid references books(id) on delete cascade not null,
  position_sec  float default 0,
  completed     boolean default false,
  last_played   timestamptz default now(),
  unique(user_id, book_id)
);

-- LIBRARY (saved books)
create table if not exists library (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade not null,
  book_id    uuid references books(id) on delete cascade not null,
  added_at   timestamptz default now(),
  unique(user_id, book_id)
);

-- FOLLOWS
create table if not exists follows (
  id          uuid primary key default uuid_generate_v4(),
  follower_id uuid references profiles(id) on delete cascade not null,
  author_id   uuid references profiles(id) on delete cascade not null,
  followed_at timestamptz default now(),
  unique(follower_id, author_id)
);

-- RLS
alter table profiles enable row level security;
alter table books enable row level security;
alter table tts_jobs enable row level security;
alter table listening_progress enable row level security;
alter table library enable row level security;
alter table follows enable row level security;

-- Profiles policies
create policy "Profiles viewable by all"
  on profiles for select using (true);

create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- Books policies
create policy "Public books visible to all"
  on books for select using (is_public = true or auth.uid() = author_id);

create policy "Authors insert own books"
  on books for insert with check (auth.uid() = author_id);

create policy "Authors update own books"
  on books for update using (auth.uid() = author_id);

create policy "Authors delete own books"
  on books for delete using (auth.uid() = author_id);

-- TTS Jobs policies
create policy "Authors view own jobs"
  on tts_jobs for select
  using (book_id in (select id from books where author_id = auth.uid()));

-- Listening progress policies
create policy "Users manage own progress"
  on listening_progress for all using (auth.uid() = user_id);

-- Library policies
create policy "Users manage own library"
  on library for all using (auth.uid() = user_id);

-- Follows policies
create policy "Follows viewable by all"
  on follows for select using (true);

create policy "Users manage own follows"
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users delete own follows"
  on follows for delete using (auth.uid() = follower_id);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public)
  values ('books-txt', 'books-txt', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('books-audio', 'books-audio', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('covers', 'covers', true)
  on conflict (id) do nothing;

-- Storage policies
create policy "Authors upload txt"
  on storage.objects for insert
  with check (bucket_id = 'books-txt' and auth.role() = 'authenticated');

create policy "Authors read own txt"
  on storage.objects for select
  using (bucket_id = 'books-txt' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Audio publicly readable"
  on storage.objects for select
  using (bucket_id = 'books-audio');

create policy "Service role uploads audio"
  on storage.objects for insert
  with check (bucket_id = 'books-audio');

create policy "Covers publicly readable"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "Authors upload covers"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.role() = 'authenticated');

-- VIEW
create or replace view books_with_author as
select
  b.*,
  p.name as author_name,
  p.avatar_url as author_avatar,
  p.bio as author_bio
from books b
join profiles p on b.author_id = p.id
where b.is_public = true and b.status = 'ready';

-- INDEXES
create index if not exists idx_books_author on books(author_id);
create index if not exists idx_books_status on books(status);
create index if not exists idx_tts_jobs_book on tts_jobs(book_id);
create index if not exists idx_listening_user on listening_progress(user_id);
create index if not exists idx_library_user on library(user_id);
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
-- ============================================================
-- KadhaiSolai â€” Credits & Messaging System
-- Run this in Supabase Dashboard â†’ SQL Editor
-- ============================================================

-- â”€â”€ 1. Credits Ledger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS public.credits_ledger (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint   TEXT NOT NULL,
  amount        INTEGER NOT NULL,          -- positive = credit, negative = debit
  type          TEXT NOT NULL,             -- welcome | subscription | purchase | message_sent | message_received | listen_earn
  reference_id  TEXT,                      -- story_id, pack_id, message_id, etc.
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credits_ledger_fp_idx ON public.credits_ledger (fingerprint);
CREATE INDEX IF NOT EXISTS credits_ledger_type_idx ON public.credits_ledger (type);
CREATE INDEX IF NOT EXISTS credits_ledger_ref_idx  ON public.credits_ledger (reference_id);

-- â”€â”€ 2. Author Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS public.author_messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_fingerprint      TEXT NOT NULL,
  to_fingerprint        TEXT NOT NULL,     -- author's fingerprint
  book_id               UUID REFERENCES public.books(id) ON DELETE SET NULL,
  from_name             TEXT NOT NULL DEFAULT 'Anonymous',
  message_text          TEXT NOT NULL,
  credits_spent         INTEGER NOT NULL DEFAULT 100,
  author_credits_earned INTEGER NOT NULL DEFAULT 70,
  status                TEXT NOT NULL DEFAULT 'unread',  -- unread | read
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS author_messages_to_fp_idx   ON public.author_messages (to_fingerprint);
CREATE INDEX IF NOT EXISTS author_messages_from_fp_idx ON public.author_messages (from_fingerprint);

-- â”€â”€ 3. Row Level Security â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- Both tables are accessed exclusively via service-role key in API routes,
-- so we enable RLS but add no policies â€” the service role bypasses RLS.
ALTER TABLE public.credits_ledger   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_messages  ENABLE ROW LEVEL SECURITY;

-- â”€â”€ Done â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
-- After running this migration:
--   1. Deploy to Vercel (git push)
--   2. New users automatically receive 100 welcome credits
--      on their first visit to any page that calls /api/credits
-- ============================================================
-- Kadhaisolai Phase 1.1.1 Book Persistence Schema Additions
-- ============================================================

-- Add new columns to existing books table to support BookMetadata and BookSource
alter table books 
add column if not exists original_file_name text,
add column if not exists mime_type text,
add column if not exists publisher text,
add column if not exists isbn text,
add column if not exists source_type text,
add column if not exists processing_status text default 'pending' check (processing_status in ('pending', 'processing', 'ready', 'failed')),
add column if not exists ingested_at timestamptz default now();

-- Update indexes for performance on the new domain queries
create index if not exists idx_books_processing_status on books(processing_status);
create index if not exists idx_books_ingested_at on books(ingested_at);
-- ============================================================
-- Kadhaisolai Phase 1.2 Chapter Detection Schema
-- ============================================================

create table if not exists chapters (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    parent_id uuid references chapters(id) on delete set null,
    chapter_number integer,
    chapter_title text not null,
    chapter_type text not null,
    order_index integer not null,
    start_position integer not null,
    end_position integer not null,
    start_line integer,
    end_line integer,
    content_length integer not null,
    word_count integer not null,
    character_count integer not null,
    detection_strategy text not null,
    confidence_score numeric(4,3) not null,
    language_detected text,
    is_roman_numeral boolean default false,
    is_tamil_numeral boolean default false,
    created_at timestamptz default now()
);

create index if not exists idx_chapters_book_id on chapters(book_id);
create index if not exists idx_chapters_order on chapters(book_id, order_index);
-- ============================================================
-- Kadhaisolai Phase 1.2 Hotfix - Chapter Fusion & Quality
-- ============================================================

alter table chapters 
add column if not exists detection_evidence jsonb,
add column if not exists fusion_confidence numeric(4,3),
add column if not exists quality_score numeric(4,3);

-- Create a dedicated table to store book-level quality reports if needed, 
-- but storing quality_score on chapters is sufficient for now based on requirements.
-- ============================================================
-- Kadhaisolai Phase 2 Character Intelligence Schema
-- ============================================================

create table if not exists characters (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    name text not null,
    normalized_name text not null,
    confidence_score numeric(4,3) not null default 0,
    importance_score numeric(4,3) not null default 0,
    mention_count integer not null default 0,
    first_appearance integer,
    last_appearance integer,
    created_at timestamptz default now()
);

create table if not exists character_aliases (
    id uuid primary key default gen_random_uuid(),
    character_id uuid references characters(id) on delete cascade not null,
    alias_name text not null,
    confidence_score numeric(4,3) not null default 0,
    source_strategy text not null
);

create table if not exists character_mentions (
    id uuid primary key default gen_random_uuid(),
    character_id uuid references characters(id) on delete cascade not null,
    chapter_id uuid references chapters(id) on delete cascade not null,
    start_position integer not null,
    end_position integer not null,
    context_text text
);

create table if not exists character_relationships (
    id uuid primary key default gen_random_uuid(),
    character_a_id uuid references characters(id) on delete cascade not null,
    character_b_id uuid references characters(id) on delete cascade not null,
    relationship_type text not null,
    confidence_score numeric(4,3) not null default 0,
    evidence text
);

create table if not exists character_attributes (
    id uuid primary key default gen_random_uuid(),
    character_id uuid references characters(id) on delete cascade not null,
    attribute_type text not null,
    attribute_value text not null,
    confidence_score numeric(4,3) not null default 0
);

create table if not exists character_timelines (
    id uuid primary key default gen_random_uuid(),
    character_id uuid references characters(id) on delete cascade not null,
    chapter_id uuid references chapters(id) on delete cascade not null,
    appearance_count integer not null default 0,
    narrative_weight numeric(4,3) not null default 0
);

create index if not exists idx_characters_book_id on characters(book_id);
create index if not exists idx_character_mentions_char_id on character_mentions(character_id);
create index if not exists idx_character_mentions_chapter_id on character_mentions(chapter_id);
create index if not exists idx_character_relationships_a on character_relationships(character_a_id);
-- ============================================================
-- Kadhaisolai Phase 2 Backlog - Character Evaluation & Graph
-- ============================================================

-- Extend character_relationships
alter table character_relationships
add column if not exists frequency integer default 1,
add column if not exists directionality text default 'BIDIRECTIONAL',
add column if not exists source_chapters uuid[] default '{}';

-- Create character_quality_reports
create table if not exists character_quality_reports (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    trace_id text not null,
    character_count integer not null default 0,
    alias_count integer not null default 0,
    relationship_count integer not null default 0,
    quality_score numeric(4,3) not null default 0,
    confidence_distribution jsonb,
    validation_issues jsonb,
    processing_time_ms integer not null,
    created_at timestamptz default now()
);

create index if not exists idx_character_reports_book_id on character_quality_reports(book_id);
-- ============================================================
-- Kadhaisolai Phase 3 Dialogue Intelligence Schema
-- ============================================================

create table if not exists conversations (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    chapter_id uuid references chapters(id) on delete cascade not null,
    start_position integer not null,
    end_position integer not null,
    confidence_score numeric(4,3) not null default 0,
    created_at timestamptz default now()
);

create table if not exists conversation_participants (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid references conversations(id) on delete cascade not null,
    character_id uuid references characters(id) on delete cascade not null
);

create table if not exists dialogues (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    chapter_id uuid references chapters(id) on delete cascade not null,
    conversation_id uuid references conversations(id) on delete cascade,
    dialogue_text text not null,
    start_position integer not null,
    end_position integer not null,
    confidence_score numeric(4,3) not null default 0,
    created_at timestamptz default now()
);

create table if not exists dialogue_speakers (
    id uuid primary key default gen_random_uuid(),
    dialogue_id uuid references dialogues(id) on delete cascade not null,
    character_id uuid references characters(id) on delete cascade not null,
    confidence_score numeric(4,3) not null default 0,
    evidence text
);

create table if not exists dialogue_listeners (
    id uuid primary key default gen_random_uuid(),
    dialogue_id uuid references dialogues(id) on delete cascade not null,
    character_id uuid references characters(id) on delete cascade not null,
    confidence_score numeric(4,3) not null default 0,
    evidence text
);

create table if not exists dialogue_segments (
    id uuid primary key default gen_random_uuid(),
    dialogue_id uuid references dialogues(id) on delete cascade not null,
    segment_text text not null,
    start_position integer not null,
    end_position integer not null
);

create table if not exists conversation_turns (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid references conversations(id) on delete cascade not null,
    dialogue_id uuid references dialogues(id) on delete cascade not null,
    turn_index integer not null
);

create table if not exists dialogue_quality_reports (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    trace_id text not null,
    dialogue_count integer not null default 0,
    conversation_count integer not null default 0,
    quality_score numeric(4,3) not null default 0,
    validation_issues jsonb,
    processing_time_ms integer not null,
    created_at timestamptz default now()
);

create index if not exists idx_dialogues_book_id on dialogues(book_id);
create index if not exists idx_dialogues_chapter_id on dialogues(chapter_id);
create index if not exists idx_conversations_book_id on conversations(book_id);
-- ============================================================
-- Kadhaisolai Phase 3 Agentic Dialogue Layer Schema
-- ============================================================

create table if not exists conversation_states (
    id uuid primary key default gen_random_uuid(),
    conversation_id uuid references conversations(id) on delete cascade not null,
    state text not null check (state in ('STARTED', 'ACTIVE', 'INTERRUPTED', 'PAUSED', 'RESUMED', 'ENDED', 'ABANDONED')),
    transition_reason text,
    updated_at timestamptz default now()
);

create table if not exists conversation_memories (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    conversation_id uuid references conversations(id) on delete cascade not null,
    current_speaker_id uuid references characters(id) on delete set null,
    current_listener_id uuid references characters(id) on delete set null,
    turn_count integer not null default 0,
    last_dialogue_id uuid references dialogues(id) on delete set null,
    memory_snapshot jsonb not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists long_range_references (
    id uuid primary key default gen_random_uuid(),
    source_dialogue_id uuid references dialogues(id) on delete cascade not null,
    target_dialogue_id uuid references dialogues(id) on delete cascade,
    target_conversation_id uuid references conversations(id) on delete cascade,
    confidence_score numeric(4,3) not null default 0,
    reference_distance integer not null,
    evidence text not null,
    created_at timestamptz default now()
);

create table if not exists dialogue_memory_reports (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    trace_id text not null,
    memory_continuity_score numeric(4,3) not null default 0,
    long_range_recall numeric(4,3) not null default 0,
    report_data jsonb not null,
    created_at timestamptz default now()
);

create index if not exists idx_conversation_states_conversation_id on conversation_states(conversation_id);
create index if not exists idx_conversation_memories_book_id on conversation_memories(book_id);
create index if not exists idx_long_range_references_source on long_range_references(source_dialogue_id);
-- ============================================================
-- Kadhaisolai Phase 4 Emotion Director Agent Schema
-- ============================================================

create table if not exists emotions (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    chapter_id uuid references chapters(id) on delete cascade not null,
    character_id uuid references characters(id) on delete cascade,
    conversation_id uuid references conversations(id) on delete cascade,
    dialogue_id uuid references dialogues(id) on delete cascade,
    emotion_type text not null,
    intensity numeric(4,3) not null,
    confidence_score numeric(4,3) not null,
    start_position integer not null,
    end_position integer not null,
    reasoning jsonb not null,
    created_at timestamptz default now()
);

create table if not exists emotion_profiles (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    chapter_id uuid references chapters(id) on delete cascade not null,
    target_type text not null check (target_type in ('CHARACTER', 'SCENE', 'CONVERSATION')),
    target_id uuid not null,
    dominant_emotion text not null,
    volatility numeric(4,3) not null default 0,
    emotional_state jsonb not null,
    created_at timestamptz default now()
);

create table if not exists emotion_transitions (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    target_id uuid not null, -- could be character or conversation
    from_emotion text not null,
    to_emotion text not null,
    transition_reason text not null,
    transition_timestamp integer not null,
    created_at timestamptz default now()
);

create table if not exists emotion_directives (
    id uuid primary key default gen_random_uuid(),
    emotion_id uuid references emotions(id) on delete cascade not null,
    dialogue_id uuid references dialogues(id) on delete cascade,
    speech_pace text not null,
    pause_intensity text not null,
    emphasis_level numeric(4,3) not null,
    energy_level numeric(4,3) not null,
    voice_tension numeric(4,3) not null,
    dramatic_intensity numeric(4,3) not null,
    emotional_weight text not null,
    created_at timestamptz default now()
);

create table if not exists emotion_timelines (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    target_id uuid not null,
    timeline_data jsonb not null,
    created_at timestamptz default now()
);

create table if not exists emotion_quality_reports (
    id uuid primary key default gen_random_uuid(),
    book_id uuid references books(id) on delete cascade not null,
    trace_id text not null,
    emotions_detected integer not null default 0,
    transitions_detected integer not null default 0,
    quality_score numeric(4,3) not null default 0,
    processing_time_ms integer not null,
    validation_issues jsonb,
    created_at timestamptz default now()
);

create index if not exists idx_emotions_book_id on emotions(book_id);
create index if not exists idx_emotions_chapter_id on emotions(chapter_id);
create index if not exists idx_emotion_profiles_target on emotion_profiles(target_type, target_id);
-- Phase 5: Narration Intelligence Layer

CREATE TABLE narration_plans (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  total_scenes INTEGER NOT NULL,
  pacing_score FLOAT NOT NULL,
  complexity_score FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE narration_directives (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES narration_plans(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  directive_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scene_directives (
  id UUID PRIMARY KEY,
  directive_id UUID REFERENCES narration_directives(id) ON DELETE CASCADE,
  mood VARCHAR(50) NOT NULL,
  energy FLOAT NOT NULL,
  tension FLOAT NOT NULL,
  pacing VARCHAR(50) NOT NULL
);

CREATE TABLE pause_directives (
  id UUID PRIMARY KEY,
  directive_id UUID REFERENCES narration_directives(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  pause_type VARCHAR(50) NOT NULL
);

CREATE TABLE emphasis_directives (
  id UUID PRIMARY KEY,
  directive_id UUID REFERENCES narration_directives(id) ON DELETE CASCADE,
  start_position INTEGER NOT NULL,
  end_position INTEGER NOT NULL,
  emphasis_level FLOAT NOT NULL,
  emphasis_type VARCHAR(50) NOT NULL
);

CREATE TABLE transition_directives (
  id UUID PRIMARY KEY,
  directive_id UUID REFERENCES narration_directives(id) ON DELETE CASCADE,
  from_scene UUID,
  to_scene UUID,
  transition_type VARCHAR(50) NOT NULL,
  duration_ms INTEGER NOT NULL
);

CREATE TABLE narration_timelines (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES narration_plans(id) ON DELETE CASCADE,
  timeline_data JSONB NOT NULL
);

CREATE TABLE narration_quality_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL,
  trace_id UUID NOT NULL,
  pacing_quality FLOAT NOT NULL,
  pause_quality FLOAT NOT NULL,
  transition_quality FLOAT NOT NULL,
  performance_quality FLOAT NOT NULL,
  overall_score FLOAT NOT NULL,
  validation_issues JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Phase 5.1: Director Readiness

CREATE TABLE narrative_arcs (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  arc_type VARCHAR(50) NOT NULL,
  arc_position FLOAT NOT NULL,
  arc_confidence FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scene_graphs (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  graph_snapshot JSONB NOT NULL,
  connectivity_score FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scene_relationships (
  id UUID PRIMARY KEY,
  graph_id UUID REFERENCES scene_graphs(id) ON DELETE CASCADE,
  source_scene UUID NOT NULL,
  target_scene UUID NOT NULL,
  relationship_type VARCHAR(50) NOT NULL,
  weight FLOAT NOT NULL
);

CREATE TABLE directorial_intents (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  scene_id UUID NOT NULL,
  intent_type VARCHAR(50) NOT NULL,
  confidence FLOAT NOT NULL,
  reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE momentum_profiles (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  momentum_score FLOAT NOT NULL,
  momentum_direction VARCHAR(50) NOT NULL,
  momentum_trend VARCHAR(50) NOT NULL,
  momentum_velocity FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scene_importance_reports (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  scene_id UUID NOT NULL,
  importance_score FLOAT NOT NULL,
  reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Phase 6: Audiobook Director Master Layer

CREATE TABLE audiobook_master_plans (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  global_objectives JSONB NOT NULL,
  continuity_rules JSONB NOT NULL,
  performance_rules JSONB NOT NULL,
  quality_rules JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_blueprints (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  chapter_plans JSONB NOT NULL,
  scene_plans JSONB NOT NULL,
  character_plans JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_directives (
  id UUID PRIMARY KEY,
  blueprint_id UUID REFERENCES production_blueprints(id) ON DELETE CASCADE,
  target_id UUID NOT NULL,
  directive_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL
);

CREATE TABLE voice_casting_plans (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  character_id UUID NOT NULL,
  voice_archetype VARCHAR(100) NOT NULL,
  casting_confidence FLOAT NOT NULL,
  casting_reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_timelines (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  timeline_data JSONB NOT NULL
);

CREATE TABLE director_decisions (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  decision_type VARCHAR(50) NOT NULL,
  confidence FLOAT NOT NULL,
  reasoning JSONB NOT NULL,
  evidence JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE director_reviews (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  review_status VARCHAR(50) NOT NULL,
  feedback JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_risks (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  risk_type VARCHAR(50) NOT NULL,
  severity FLOAT NOT NULL,
  description TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE production_quality_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES audiobook_master_plans(id) ON DELETE CASCADE,
  trace_id UUID NOT NULL,
  casting_quality FLOAT NOT NULL,
  consistency_quality FLOAT NOT NULL,
  resolution_quality FLOAT NOT NULL,
  overall_score FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Phase 7: Dataset Factory

CREATE TABLE training_corpora (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  version_id UUID NOT NULL,
  total_samples INTEGER NOT NULL,
  quality_score FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_samples (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  sample_id VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  speaker VARCHAR(255) NOT NULL,
  emotion VARCHAR(50) NOT NULL,
  emotion_intensity FLOAT NOT NULL,
  emotion_persistence FLOAT NOT NULL,
  pacing VARCHAR(50) NOT NULL,
  pauses JSONB NOT NULL,
  emphasis JSONB NOT NULL,
  narrative_arc VARCHAR(100) NOT NULL,
  directorial_intent VARCHAR(100) NOT NULL,
  voice_archetype VARCHAR(100) NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS dataset_versions CASCADE;
CREATE TABLE dataset_versions (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  version_tag VARCHAR(50) NOT NULL,
  diff_metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_manifests (
  id UUID PRIMARY KEY,
  version_id UUID REFERENCES dataset_versions(id) ON DELETE CASCADE,
  manifest_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS dataset_exports CASCADE;
CREATE TABLE dataset_exports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  export_format VARCHAR(50) NOT NULL,
  export_profile JSONB NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_registry (
  id UUID PRIMARY KEY,
  book_id UUID NOT NULL,
  registry_snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_quality_reports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  quality_score FLOAT NOT NULL,
  reasoning JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_balance_reports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  balance_score FLOAT NOT NULL,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dataset_coverage_reports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  coverage_score FLOAT NOT NULL,
  gaps JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Phase 7 Provenance Patch: Dataset Lineage

CREATE TABLE dataset_lineage (
  id UUID PRIMARY KEY,
  sample_id UUID REFERENCES training_samples(id) ON DELETE CASCADE,
  book_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  scene_id UUID NOT NULL,
  dialogue_id UUID,
  character_id UUID NOT NULL,
  emotion_id UUID,
  narration_id UUID,
  director_decision_id UUID,
  dataset_version_id UUID NOT NULL,
  corpus_version_id UUID NOT NULL,
  trace_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_usage (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  model_id VARCHAR(255) NOT NULL,
  usage_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_history (
  id UUID PRIMARY KEY,
  model_id VARCHAR(255) NOT NULL,
  history_metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE version_diffs (
  id UUID PRIMARY KEY,
  previous_version_id UUID REFERENCES dataset_versions(id) ON DELETE CASCADE,
  current_version_id UUID REFERENCES dataset_versions(id) ON DELETE CASCADE,
  diff_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE corpus_lineage_reports (
  id UUID PRIMARY KEY,
  corpus_id UUID REFERENCES training_corpora(id) ON DELETE CASCADE,
  lineage_coverage FLOAT NOT NULL,
  missing_links INTEGER NOT NULL,
  broken_references INTEGER NOT NULL,
  orphan_samples INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Phase 7.5: Platform Certification

CREATE TABLE platform_certifications (
  id UUID PRIMARY KEY,
  certification_status VARCHAR(50) NOT NULL,
  certification_score FLOAT NOT NULL,
  production_approval BOOLEAN NOT NULL,
  phase8_approval BOOLEAN NOT NULL,
  required_fixes JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_reports (
  id UUID PRIMARY KEY,
  certification_id UUID REFERENCES platform_certifications(id) ON DELETE CASCADE,
  audit_type VARCHAR(100) NOT NULL,
  health_score FLOAT NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stress_test_reports (
  id UUID PRIMARY KEY,
  certification_id UUID REFERENCES platform_certifications(id) ON DELETE CASCADE,
  word_count INTEGER NOT NULL,
  cpu_usage FLOAT NOT NULL,
  memory_usage FLOAT NOT NULL,
  throughput FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE readiness_reports (
  id UUID PRIMARY KEY,
  certification_id UUID REFERENCES platform_certifications(id) ON DELETE CASCADE,
  readiness_score FLOAT NOT NULL,
  blockers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
