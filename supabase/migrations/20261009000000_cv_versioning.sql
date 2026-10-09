-- CV content versioning (schema only, no content).
-- Adds a `version` column to `resumes` and `chatbot`; existing rows become 'v1'.
-- The active version is selected by the server-side CV_VERSION env var.
-- Applied to the hosted project on 2026-10-09.

-- Point-in-time snapshot of both tables (RLS on, no policies = not readable via anon).
create table if not exists public.resumes_backup_20261009 as table public.resumes;
create table if not exists public.chatbot_backup_20261009 as table public.chatbot;
alter table public.resumes_backup_20261009 enable row level security;
alter table public.chatbot_backup_20261009 enable row level security;

alter table public.resumes add column if not exists version text not null default 'v1';
alter table public.resumes drop constraint if exists resumes_slug_key;
alter table public.resumes add constraint resumes_slug_version_key unique (slug, version);
alter table public.resumes add constraint resumes_version_format check (version ~ '^v[0-9]{1,3}$');

alter table public.chatbot add column if not exists version text not null default 'v1';
alter table public.chatbot add constraint chatbot_version_key unique (version);
alter table public.chatbot add constraint chatbot_version_format check (version ~ '^v[0-9]{1,3}$');
