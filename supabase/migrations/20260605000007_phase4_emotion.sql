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
