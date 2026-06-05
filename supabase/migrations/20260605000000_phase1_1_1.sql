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
