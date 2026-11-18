-- Dynamic investment plan catalogue and admin controls.
-- Applied to Supabase project wofniiyglygkpqfnjmnc.
create table if not exists public.investment_plans (
 id integer primary key check (id between 1 and 10),
 name text not null,
 price numeric(18,2) not null check (price > 0),
 duration_days integer not null check (duration_days > 0),
 profit_percent numeric(8,3) not null default 0 check (profit_percent >= 0 and profit_percent <= 10000),
 flex_enabled boolean not null default false,
 flex_profit_percent numeric(8,3) not null default 0 check (flex_profit_percent >= 0 and flex_profit_percent <= 10000),
 profit_interval_value integer not null default 1 check (profit_interval_value > 0),
 profit_interval_unit text not null default 'day' check (profit_interval_unit in ('hour','day')),
 is_active boolean not null default false,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
alter table public.investment_plans enable row level security;
revoke all on public.investment_plans from anon, authenticated;
grant select on public.investment_plans to anon, authenticated;
drop policy if exists "Public read active investment plans" on public.investment_plans;
create policy "Public read active investment plans" on public.investment_plans for select to anon, authenticated using (is_active = true);
drop policy if exists "Admins read all investment plans" on public.investment_plans;
create policy "Admins read all investment plans" on public.investment_plans for select to authenticated using (private.is_admin());
insert into public.investment_plans (id,name,price,duration_days,profit_percent,flex_enabled,flex_profit_percent,profit_interval_value,profit_interval_unit,is_active) values
(1,'Plan 1',7150,30,28,true,18,1,'day',true),(2,'Plan 2',18000,30,40,true,30,1,'day',true),(3,'Plan 3',42800,45,43,true,33,1,'day',true),(4,'Plan 4',76500,60,51,true,41,1,'day',true),(5,'Plan 5',168000,90,53,true,43,1,'day',true),(6,'Plan 6',320000,120,60,true,45,1,'day',true),(7,'Agri Growth 7',450000,150,65,false,0,1,'day',false),(8,'Agri Growth 8',600000,180,70,false,0,1,'day',false),(9,'Agri Growth 9',800000,210,75,false,0,1,'day',false),(10,'Agri Growth 10',1000000,240,80,false,0,1,'day',false) on conflict(id) do nothing;
create or replace function private.save_investment_plan(p_id integer,p_name text,p_price numeric,p_duration_days integer,p_profit_percent numeric,p_flex_enabled boolean,p_flex_profit_percent numeric,p_profit_interval_value integer,p_profit_interval_unit text,p_is_active boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if p_id < 1 or p_id > 10 or trim(coalesce(p_name,'')) = '' then raise exception 'A valid plan number and name are required'; end if;
 if p_price <= 0 or p_duration_days <= 0 or p_profit_percent < 0 or p_profit_percent > 10000 then raise exception 'Enter valid price, duration and profit values'; end if;
 if p_flex_enabled and (p_flex_profit_percent < 0 or p_flex_profit_percent > 10000) then raise exception 'Enter a valid flexible profit percentage'; end if;
 if p_profit_interval_value <= 0 or p_profit_interval_unit not in ('hour','day') then raise exception 'Choose a valid profit increment interval'; end if;
 insert into public.investment_plans(id,name,price,duration_days,profit_percent,flex_enabled,flex_profit_percent,profit_interval_value,profit_interval_unit,is_active,updated_at,updated_by) values(p_id,trim(p_name),p_price,p_duration_days,p_profit_percent,p_flex_enabled,case when p_flex_enabled then p_flex_profit_percent else 0 end,p_profit_interval_value,p_profit_interval_unit,p_is_active,now(),auth.uid()) on conflict(id) do update set name=excluded.name,price=excluded.price,duration_days=excluded.duration_days,profit_percent=excluded.profit_percent,flex_enabled=excluded.flex_enabled,flex_profit_percent=excluded.flex_profit_percent,profit_interval_value=excluded.profit_interval_value,profit_interval_unit=excluded.profit_interval_unit,is_active=excluded.is_active,updated_at=now(),updated_by=auth.uid();
 insert into public.admin_audit_logs(actor_id,action,target,details) values(auth.uid(),'investment_plan.updated',p_id::text,jsonb_build_object('name',trim(p_name),'price',p_price,'duration_days',p_duration_days,'active',p_is_active));
end; $$;
revoke all on function private.save_investment_plan(integer,text,numeric,integer,numeric,boolean,numeric,integer,text,boolean) from public,anon,authenticated;
grant execute on function private.save_investment_plan(integer,text,numeric,integer,numeric,boolean,numeric,integer,text,boolean) to authenticated;
create or replace function public.admin_save_investment_plan(p_id integer,p_name text,p_price numeric,p_duration_days integer,p_profit_percent numeric,p_flex_enabled boolean,p_flex_profit_percent numeric,p_profit_interval_value integer,p_profit_interval_unit text,p_is_active boolean) returns void language sql security invoker set search_path='' as $$ select private.save_investment_plan(p_id,p_name,p_price,p_duration_days,p_profit_percent,p_flex_enabled,p_flex_profit_percent,p_profit_interval_value,p_profit_interval_unit,p_is_active) $$;
revoke all on function public.admin_save_investment_plan(integer,text,numeric,integer,numeric,boolean,numeric,integer,text,boolean) from public,anon;
grant execute on function public.admin_save_investment_plan(integer,text,numeric,integer,numeric,boolean,numeric,integer,text,boolean) to authenticated;
notify pgrst,'reload schema';
