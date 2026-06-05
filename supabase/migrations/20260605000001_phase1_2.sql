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
