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
