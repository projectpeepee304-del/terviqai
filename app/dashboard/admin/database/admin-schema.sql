-- Run after app/dashboard/database/schema.sql in Supabase SQL Editor.
alter table public.profiles add column if not exists account_status text not null default 'active' check(account_status in ('active','suspended'));
create table if not exists public.app_settings(key text primary key,value jsonb not null default '{}'::jsonb,updated_by uuid references auth.users(id) on delete set null,updated_at timestamptz not null default now());
create table if not exists public.admin_audit_logs(id uuid primary key default gen_random_uuid(),actor_id uuid references auth.users(id) on delete set null,action text not null,target text not null,details jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
alter table public.app_settings enable row level security;alter table public.admin_audit_logs enable row level security;
insert into public.app_settings(key,value) values('referral_rate_percent','{"percent":10}'::jsonb) on conflict(key) do nothing;
-- Grant admin role in Supabase Auth app_metadata, or configure server-only ADMIN_EMAILS as a comma-separated Vercel env var.
-- update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||'{"role":"admin"}'::jsonb where lower(email)=lower('admin@example.com');