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
