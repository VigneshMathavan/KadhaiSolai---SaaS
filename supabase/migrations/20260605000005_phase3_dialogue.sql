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
