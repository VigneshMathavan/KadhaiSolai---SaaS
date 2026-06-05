-- ============================================================
-- Phase 7.8: Task 1 - Foreign Key Cascade & Orphan Prevention Hardening
-- ============================================================

-- 1. Explicitly drop any remaining orphan books
DELETE FROM books WHERE author_id NOT IN (SELECT id FROM profiles);

-- 2. Add ON DELETE CASCADE to character and dialogue dependencies where missing
ALTER TABLE characters
  DROP CONSTRAINT IF EXISTS characters_book_id_fkey,
  ADD CONSTRAINT characters_book_id_fkey FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

ALTER TABLE dialogues
  DROP CONSTRAINT IF EXISTS dialogues_book_id_fkey,
  ADD CONSTRAINT dialogues_book_id_fkey FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

ALTER TABLE emotions
  DROP CONSTRAINT IF EXISTS emotions_dialogue_id_fkey,
  ADD CONSTRAINT emotions_dialogue_id_fkey FOREIGN KEY (dialogue_id) REFERENCES dialogues(id) ON DELETE CASCADE;

-- 3. Fix Broken Auth Trigger
-- The original trigger was missing public schema prefix which caused relation not found
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
