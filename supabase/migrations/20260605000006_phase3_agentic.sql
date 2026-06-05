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
