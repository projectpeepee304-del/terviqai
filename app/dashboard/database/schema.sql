-- Terviq AI member dashboard schema for Supabase (PostgreSQL)
-- Run this file in Supabase SQL Editor after creating a project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 email text,
 phone text,
 date_of_birth date,
 referral_code text not null unique default ('TVQ-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 available_balance numeric(18,2) not null default 0 check (available_balance >= 0),
 referral_balance numeric(18,2) not null default 0 check (referral_balance >= 0),
 updated_at timestamptz not null default now()
);

create table if not exists public.investments (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 plan_id integer not null check (plan_id between 1 and 6),
 option text not null check (option in ('flexible','locked')),
 principal_amount numeric(18,2) not null check (principal_amount > 0),
 duration_days integer not null,
 projected_profit numeric(18,2) not null default 0,
 profit_amount numeric(18,2) not null default 0,
 status text not null default 'active' check (status in ('active','matured','cancelled')),
 started_at timestamptz not null default now(),
 matures_at timestamptz
);

create table if not exists public.transactions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 type text not null check (type in ('deposit','investment','profit_withdrawal','referral_withdrawal','referral_commission')),
 amount numeric(18,2) not null,
 status text not null default 'pending' check (status in ('pending','processing','completed','failed','reversed')),
 description text,
 reference text unique,
 created_at timestamptz not null default now()
);

create table if not exists public.referrals (
 id uuid primary key default gen_random_uuid(),
 referrer_id uuid not null references auth.users(id) on delete cascade,
 referred_user_id uuid not null references auth.users(id) on delete cascade,
 referral_code text not null,
 first_investment_amount numeric(18,2) not null default 0,
 commission_amount numeric(18,2) not null default 0,
 status text not null default 'registered' check (status in ('registered','qualified','credited')),
 created_at timestamptz not null default now(),
 unique(referrer_id,referred_user_id)
);

create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 body text not null default '',
 read_at timestamptz,
 created_at timestamptz not null default now()
);

create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $
declare
 v_referrer_id uuid;
 v_referral_code text;
begin
 insert into public.profiles (id,full_name,email,phone)
 values (new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,new.raw_user_meta_data->>'phone')
 on conflict (id) do update set email=excluded.email;
 insert into public.wallets (user_id) values (new.id) on conflict (user_id) do nothing;
 v_referral_code := upper(trim(coalesce(new.raw_user_meta_data->>'referral_code','')));
 if v_referral_code <> '' then
  select id into v_referrer_id from public.profiles where upper(referral_code)=v_referral_code limit 1;
  if v_referrer_id is not null and v_referrer_id <> new.id then
   insert into public.referrals(referrer_id,referred_user_id,referral_code)
   values(v_referrer_id,new.id,v_referral_code) on conflict(referrer_id,referred_user_id) do nothing;
  end if;
 end if;
 return new;
end;
$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_member();

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.investments enable row level security;
alter table public.transactions enable row level security;
alter table public.referrals enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Members read own profile" on public.profiles;
create policy "Members read own profile" on public.profiles for select using (auth.uid()=id);
drop policy if exists "Members update own profile" on public.profiles;
create policy "Members update own profile" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);

drop policy if exists "Members read own wallet" on public.wallets;
create policy "Members read own wallet" on public.wallets for select using (auth.uid()=user_id);

drop policy if exists "Members read own investments" on public.investments;
create policy "Members read own investments" on public.investments for select using (auth.uid()=user_id);

drop policy if exists "Members read own transactions" on public.transactions;
create policy "Members read own transactions" on public.transactions for select using (auth.uid()=user_id);

drop policy if exists "Members read their referrals" on public.referrals;
create policy "Members read their referrals" on public.referrals for select using (auth.uid()=referrer_id or auth.uid()=referred_user_id);

drop policy if exists "Members read own notifications" on public.notifications;
create policy "Members read own notifications" on public.notifications for select using (auth.uid()=user_id);
drop policy if exists "Members update own notifications" on public.notifications;
create policy "Members update own notifications" on public.notifications for update using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- All wallet credits, debits, investment creation, referral attribution and transaction
-- writes should be performed by trusted server-side workflows after business rules,
-- idempotency and payment verification have been implemented. Never expose service-role
-- credentials to the browser.


-- Called only by a trusted server-side payment/investment workflow after the first
-- investment has been verified and committed. It credits the 10% referral reward once.
create or replace function public.record_first_investment_referral(
 p_referred_user_id uuid,
 p_first_investment_amount numeric,
 p_transaction_reference text
) returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
 v_referral public.referrals%rowtype;
 v_commission numeric(18,2);
begin
 if current_setting('request.jwt.claim.role',true) <> 'service_role' then
  raise exception 'This operation is restricted to the trusted server.';
 end if;
 if p_first_investment_amount <= 0 or coalesce(p_transaction_reference,'') = '' then
  raise exception 'A verified investment amount and reference are required.';
 end if;
 select * into v_referral from public.referrals
 where referred_user_id=p_referred_user_id and status='registered'
 for update;
 if not found then return 0; end if;
 v_commission := round(p_first_investment_amount * 0.10,2);
 update public.referrals set first_investment_amount=p_first_investment_amount,
  commission_amount=v_commission,status='credited'
 where id=v_referral.id;
 update public.wallets set referral_balance=referral_balance+v_commission,updated_at=now()
 where user_id=v_referral.referrer_id;
 insert into public.transactions(user_id,type,amount,status,description,reference)
 values(v_referral.referrer_id,'referral_commission',v_commission,'completed',
  '10% commission on first eligible referral investment','REF-'||p_transaction_reference);
 return v_commission;
end;
$$;
revoke all on function public.record_first_investment_referral(uuid,numeric,text) from public,anon,authenticated;
grant execute on function public.record_first_investment_referral(uuid,numeric,text) to service_role;
