-- CV content versioning (schema only, no content).
-- Adds a `version` column to `resumes` and `chatbot`; existing rows become 'v1'.
-- The active version is selected by the server-side CV_VERSION env var.
-- Applied to the hosted project on 2026-10-09.
-- Idempotent: safe to re-run (constraint adds are guarded).

BEGIN;

-- Point-in-time snapshot of both tables (RLS on, no policies = not readable via anon).
create table if not exists public.resumes_backup_20261009 as table public.resumes;
create table if not exists public.chatbot_backup_20261009 as table public.chatbot;
alter table public.resumes_backup_20261009 enable row level security;
alter table public.chatbot_backup_20261009 enable row level security;

alter table public.resumes add column if not exists version text not null default 'v1';
alter table public.resumes drop constraint if exists resumes_slug_key;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resumes_slug_version_key') THEN
    ALTER TABLE public.resumes ADD CONSTRAINT resumes_slug_version_key UNIQUE (slug, version);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resumes_version_format') THEN
    ALTER TABLE public.resumes ADD CONSTRAINT resumes_version_format CHECK (version ~ '^v[0-9]{1,3}$');
  END IF;
END $$;

alter table public.chatbot add column if not exists version text not null default 'v1';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chatbot_version_key') THEN
    ALTER TABLE public.chatbot ADD CONSTRAINT chatbot_version_key UNIQUE (version);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chatbot_version_format') THEN
    ALTER TABLE public.chatbot ADD CONSTRAINT chatbot_version_format CHECK (version ~ '^v[0-9]{1,3}$');
  END IF;
END $$;

COMMIT;
