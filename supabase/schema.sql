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
