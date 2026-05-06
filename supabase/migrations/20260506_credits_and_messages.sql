-- ============================================================
-- KadhaiSolai — Credits & Messaging System
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Credits Ledger ─────────────────────────────────────────
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

-- ── 2. Author Messages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.author_messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_fingerprint      TEXT NOT NULL,
  to_fingerprint        TEXT NOT NULL,     -- author's fingerprint
  story_id              UUID REFERENCES public.stories(id) ON DELETE SET NULL,
  from_name             TEXT NOT NULL DEFAULT 'Anonymous',
  message_text          TEXT NOT NULL,
  credits_spent         INTEGER NOT NULL DEFAULT 100,
  author_credits_earned INTEGER NOT NULL DEFAULT 70,
  status                TEXT NOT NULL DEFAULT 'unread',  -- unread | read
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS author_messages_to_fp_idx   ON public.author_messages (to_fingerprint);
CREATE INDEX IF NOT EXISTS author_messages_from_fp_idx ON public.author_messages (from_fingerprint);

-- ── 3. Row Level Security ─────────────────────────────────────
-- Both tables are accessed exclusively via service-role key in API routes,
-- so we enable RLS but add no policies — the service role bypasses RLS.
ALTER TABLE public.credits_ledger   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_messages  ENABLE ROW LEVEL SECURITY;

-- ── Done ──────────────────────────────────────────────────────
-- After running this migration:
--   1. Deploy to Vercel (git push)
--   2. New users automatically receive 100 welcome credits
--      on their first visit to any page that calls /api/credits
