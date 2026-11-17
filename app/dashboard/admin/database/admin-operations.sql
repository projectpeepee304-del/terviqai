-- Terviq AI: production admin controls, account security, UID and private KYC.
-- Applied to Supabase project wofniiyglygkpqfnjmnc. Keep this file in source control.
-- KYC files are stored in Cloudinary; Supabase stores only document references/metadata.

alter table public.profiles add column if not exists uid text;
update public.profiles set uid='TVQ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)) where uid is null;
alter table public.profiles alter column uid set default ('TVQ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)));
alter table public.profiles alter column uid set not null;
create unique index if not exists profiles_uid_key on public.profiles(uid);
alter table public.profiles add column if not exists kyc_status text not null default 'not_requested';
alter table public.profiles add column if not exists kyc_country text;
alter table public.profiles add column if not exists kyc_submitted_at timestamptz;
alter table public.profiles drop constraint if exists profiles_kyc_status_check;
alter table public.profiles add constraint profiles_kyc_status_check check(kyc_status in ('not_requested','requested','submitted','approved','rejected'));

create table if not exists public.kyc_submissions(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 document_type text not null check(document_type in ('drivers_license','international_passport')),
 country text not null,documents jsonb not null default '{}'::jsonb,
 status text not null default 'submitted' check(status in ('submitted','approved','rejected')),
 submitted_at timestamptz not null default now(),reviewed_at timestamptz,reviewed_by uuid references auth.users(id) on delete set null
);
create index if not exists kyc_submissions_user_idx on public.kyc_submissions(user_id,submitted_at desc);
create index if not exists kyc_submissions_reviewed_by_idx on public.kyc_submissions(reviewed_by);
alter table public.kyc_submissions enable row level security;
revoke all on public.kyc_submissions from anon,authenticated;
grant select,insert on public.kyc_submissions to authenticated;
drop policy if exists "KYC user insert own" on public.kyc_submissions;
create policy "KYC user insert own" on public.kyc_submissions for insert to authenticated with check((select auth.uid())=user_id);
drop policy if exists "KYC user read own" on public.kyc_submissions;
create policy "KYC user read own" on public.kyc_submissions for select to authenticated using((select auth.uid())=user_id);

create or replace function public.handle_new_member() returns trigger language plpgsql security definer set search_path=public as $$
declare v_referrer_id uuid; v_referral_code text;
begin
 insert into public.profiles(id,uid,full_name,email,phone) values(new.id,'TVQ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),coalesce(new.raw_user_meta_data->>'full_name',''),new.email,new.raw_user_meta_data->>'phone') on conflict(id) do update set email=excluded.email;
 insert into public.wallets(user_id) values(new.id) on conflict(user_id) do nothing;
 v_referral_code:=upper(trim(coalesce(new.raw_user_meta_data->>'referral_code','')));
 if v_referral_code<>'' then select id into v_referrer_id from public.profiles where upper(referral_code)=v_referral_code limit 1;
  if v_referrer_id is not null and v_referrer_id<>new.id then insert into public.referrals(referrer_id,referred_user_id,referral_code) values(v_referrer_id,new.id,v_referral_code) on conflict(referred_user_id) do nothing; end if;
 end if; return new;
end; $$;

create or replace function private.is_account_active() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.profiles p where p.id=auth.uid() and p.account_status='active')
 and not exists(select 1 from auth.users u where u.id=auth.uid() and u.banned_until is not null and u.banned_until>now())
$$;
revoke all on function private.is_account_active() from public,anon,authenticated;
grant execute on function private.is_account_active() to authenticated;
-- Apply an additional restrictive active-account gate without weakening existing owner policies.
do $$ declare t text; begin foreach t in array array['profiles','wallets','investments','transactions','referrals','notifications','app_settings','deposit_requests','withdrawal_requests','kyc_submissions'] loop
 execute format('drop policy if exists "Active accounts only" on public.%I',t);
 execute format('create policy "Active accounts only" on public.%I as restrictive for all to authenticated using(private.is_account_active()) with check(private.is_account_active())',t);
end loop; end $$;

create or replace function private.is_user_admin(p_user_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((u.raw_app_meta_data->>'role')='admin',false) or lower(coalesce(u.email,''))=any(array(select lower(jsonb_array_elements_text(s.value->'emails'))))
 from auth.users u left join public.app_settings s on s.key='admin_emails' where u.id=p_user_id
$$;
revoke all on function private.is_user_admin(uuid) from public,anon,authenticated;

drop function if exists public.admin_list_users();
drop function if exists private.list_users();
create function private.list_users() returns table(id uuid,uid text,email text,full_name text,created_at timestamptz,account_status text,is_admin boolean,kyc_status text)
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 return query select u.id,p.uid,u.email::text,coalesce(p.full_name,u.raw_user_meta_data->>'full_name','')::text,u.created_at,coalesce(p.account_status,'active')::text,
 (coalesce((u.raw_app_meta_data->>'role')='admin',false) or lower(u.email)=any(array(select lower(jsonb_array_elements_text(s.value->'emails'))))),coalesce(p.kyc_status,'not_requested')::text
 from auth.users u left join public.profiles p on p.id=u.id left join public.app_settings s on s.key='admin_emails' order by u.created_at desc limit 1000;
end; $$;
revoke all on function private.list_users() from public,anon,authenticated;
grant execute on function private.list_users() to authenticated;
create function public.admin_list_users() returns table(id uuid,uid text,email text,full_name text,created_at timestamptz,account_status text,is_admin boolean,kyc_status text)
language sql security invoker set search_path='' as $$ select * from private.list_users() $$;
revoke all on function public.admin_list_users() from public,anon;
grant execute on function public.admin_list_users() to authenticated;

create or replace function private.set_user_status(p_user_id uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if p_status not in ('active','suspended') then raise exception 'Invalid status'; end if;
 if p_user_id=auth.uid() then raise exception 'You cannot suspend your own administrator account'; end if;
 if private.is_user_admin(p_user_id) then raise exception 'Administrator accounts are protected from suspension'; end if;
 update public.profiles set account_status=p_status,updated_at=now(),last_login_ip=coalesce((select s.ip::text from auth.sessions s where s.user_id=p_user_id order by s.created_at desc limit 1),last_login_ip) where id=p_user_id;
 if not found then raise exception 'User not found'; end if;
 if p_status='suspended' then update auth.users set banned_until=now()+interval '100 years' where id=p_user_id; delete from auth.sessions where user_id=p_user_id;
 else update auth.users set banned_until=null where id=p_user_id; end if;
 insert into public.admin_audit_logs(actor_id,action,target,details) values(auth.uid(),'user.status_changed',p_user_id::text,jsonb_build_object('status',p_status,'sessions_revoked',p_status='suspended'));
end; $$;
create or replace function private.delete_user(p_user_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if p_user_id=auth.uid() then raise exception 'Cannot delete your own admin account'; end if;
 if private.is_user_admin(p_user_id) then raise exception 'Administrator accounts are protected from deletion'; end if;
 delete from auth.users where id=p_user_id; if not found then raise exception 'User not found'; end if;
 insert into public.admin_audit_logs(actor_id,action,target) values(auth.uid(),'user.deleted',p_user_id::text);
end; $$;
revoke all on function private.set_user_status(uuid,text),private.delete_user(uuid) from public,anon,authenticated;
grant execute on function private.set_user_status(uuid,text),private.delete_user(uuid) to authenticated;
create or replace function public.admin_set_user_status(p_user_id uuid,p_status text) returns void language sql security invoker set search_path='' as $$ select private.set_user_status(p_user_id,p_status) $$;
create or replace function public.admin_delete_user(p_user_id uuid) returns void language sql security invoker set search_path='' as $$ select private.delete_user(p_user_id) $$;
revoke all on function public.admin_set_user_status(uuid,text),public.admin_delete_user(uuid) from public,anon;
grant execute on function public.admin_set_user_status(uuid,text),public.admin_delete_user(uuid) to authenticated;

alter table public.notifications add column if not exists action_url text;
alter table public.notifications add column if not exists requires_action boolean not null default false;
drop policy if exists "Members update own notifications" on public.notifications;
drop policy if exists "Members update dismissible notifications" on public.notifications;
create policy "Members update dismissible notifications" on public.notifications for update to authenticated using(auth.uid()=user_id and requires_action=false) with check(auth.uid()=user_id and requires_action=false);

create or replace function private.user_details(p_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 select jsonb_build_object('id',u.id,'uid',p.uid,'email',u.email,'full_name',p.full_name,'phone',p.phone,'date_of_birth',p.date_of_birth,'created_at',u.created_at,'last_sign_in_at',u.last_sign_in_at,
 'last_ip',coalesce((select s.ip::text from auth.sessions s where s.user_id=u.id order by s.created_at desc limit 1),p.last_login_ip),'kyc_status',p.kyc_status,'balance',coalesce(w.available_balance,0),
 'referral_count',(select count(*) from public.referrals r where r.referrer_id=u.id),
 'successful_withdrawals',(select count(*) from public.transactions t where t.user_id=u.id and t.type in ('profit_withdrawal','referral_withdrawal','withdrawal') and t.status='completed'),
 'total_withdrawn',(select coalesce(sum(t.amount),0) from public.transactions t where t.user_id=u.id and t.type in ('profit_withdrawal','referral_withdrawal','withdrawal') and t.status='completed'),
 'latest_kyc',(select jsonb_build_object('document_type',k.document_type,'country',k.country,'documents',k.documents,'status',k.status,'submitted_at',k.submitted_at) from public.kyc_submissions k where k.user_id=u.id order by k.submitted_at desc limit 1))
 into result from auth.users u join public.profiles p on p.id=u.id left join public.wallets w on w.user_id=u.id where u.id=p_user_id;
 if result is null then raise exception 'User not found'; end if; return result;
end; $$;
revoke all on function private.user_details(uuid) from public,anon,authenticated;
grant execute on function private.user_details(uuid) to authenticated;
create or replace function public.admin_user_details(p_user_id uuid) returns jsonb language sql security invoker set search_path='' as $$ select private.user_details(p_user_id) $$;
revoke all on function public.admin_user_details(uuid) from public,anon;
grant execute on function public.admin_user_details(uuid) to authenticated;

create or replace function private.adjust_user_balance(p_user_id uuid,p_amount numeric,p_remark text default null) returns void language plpgsql security definer set search_path='' as $$
declare v_balance numeric(18,2);
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if p_amount is null or p_amount=0 or abs(p_amount)>100000000 then raise exception 'Enter a valid non-zero amount'; end if;
 select available_balance into v_balance from public.wallets where user_id=p_user_id for update;
 if not found then raise exception 'User wallet not found'; end if;
 if v_balance+p_amount<0 then raise exception 'Debit exceeds available account balance'; end if;
 update public.wallets set available_balance=available_balance+p_amount,updated_at=now() where user_id=p_user_id;
 insert into public.transactions(user_id,type,amount,status,description,metadata,completed_at) values(p_user_id,'adjustment',abs(p_amount),'completed',case when p_amount>0 then 'Administrator credit' else 'Administrator debit' end,jsonb_build_object('remark',nullif(trim(coalesce(p_remark,'')),''),'direction',case when p_amount>0 then 'credit' else 'debit' end),now());
 insert into public.admin_audit_logs(actor_id,action,target,details) values(auth.uid(),'wallet.manual_adjustment',p_user_id::text,jsonb_build_object('amount',p_amount,'remark',p_remark));
end; $$;
revoke all on function private.adjust_user_balance(uuid,numeric,text) from public,anon,authenticated;
grant execute on function private.adjust_user_balance(uuid,numeric,text) to authenticated;
create or replace function public.admin_adjust_user_balance(p_user_id uuid,p_amount numeric,p_remark text default null) returns void language sql security invoker set search_path='' as $$ select private.adjust_user_balance(p_user_id,p_amount,p_remark) $$;
revoke all on function public.admin_adjust_user_balance(uuid,numeric,text) from public,anon;
grant execute on function public.admin_adjust_user_balance(uuid,numeric,text) to authenticated;

create or replace function private.send_user_alert(p_user_id uuid,p_title text,p_body text,p_action_url text default null,p_requires_action boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if trim(coalesce(p_title,''))='' or trim(coalesce(p_body,''))='' then raise exception 'Alert title and message are required'; end if;
 insert into public.notifications(user_id,title,body,action_url,requires_action) values(p_user_id,trim(p_title),trim(p_body),p_action_url,p_requires_action) returning id into v_id;
 insert into public.admin_audit_logs(actor_id,action,target,details) values(auth.uid(),'user.alert_sent',p_user_id::text,jsonb_build_object('title',p_title,'requires_action',p_requires_action)); return v_id;
end; $$;
revoke all on function private.send_user_alert(uuid,text,text,text,boolean) from public,anon,authenticated;
grant execute on function private.send_user_alert(uuid,text,text,text,boolean) to authenticated;
create or replace function public.admin_send_user_alert(p_user_id uuid,p_title text,p_body text) returns uuid language sql security invoker set search_path='' as $$ select private.send_user_alert(p_user_id,p_title,p_body,null,false) $$;
revoke all on function public.admin_send_user_alert(uuid,text,text) from public,anon;
grant execute on function public.admin_send_user_alert(uuid,text,text) to authenticated;

create or replace function private.review_user_kyc(p_user_id uuid,p_decision text) returns text language plpgsql security definer set search_path='' as $$
declare v_submission uuid;
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if p_decision not in ('approved','rejected') then raise exception 'Invalid KYC decision'; end if;
 select id into v_submission from public.kyc_submissions where user_id=p_user_id and status='submitted' order by submitted_at desc limit 1 for update;
 if v_submission is null then return 'No KYC document to '||case when p_decision='approved' then 'approve' else 'reject' end||'.'; end if;
 update public.kyc_submissions set status=p_decision,reviewed_at=now(),reviewed_by=auth.uid() where id=v_submission;
 update public.profiles set kyc_status=p_decision,updated_at=now() where id=p_user_id;
 insert into public.admin_audit_logs(actor_id,action,target,details) values(auth.uid(),'kyc.'||p_decision,p_user_id::text,jsonb_build_object('submission_id',v_submission)); return 'KYC '||p_decision||'.';
end; $$;
revoke all on function private.review_user_kyc(uuid,text) from public,anon,authenticated;
grant execute on function private.review_user_kyc(uuid,text) to authenticated;
create or replace function public.admin_review_user_kyc(p_user_id uuid,p_decision text) returns text language sql security invoker set search_path='' as $$ select private.review_user_kyc(p_user_id,p_decision) $$;
revoke all on function public.admin_review_user_kyc(uuid,text) from public,anon;
grant execute on function public.admin_review_user_kyc(uuid,text) to authenticated;

create or replace function private.request_user_kyc(p_user_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if exists(select 1 from public.profiles where id=p_user_id and kyc_status='approved') then raise exception 'KYC is already approved'; end if;
 update public.profiles set kyc_status='requested',updated_at=now() where id=p_user_id;
 perform private.send_user_alert(p_user_id,'Identity verification required','Please submit your identity documents using the secure KYC submission link. This request remains visible until you submit your documents.','/dashboard/kyc',true);
 insert into public.admin_audit_logs(actor_id,action,target) values(auth.uid(),'kyc.requested',p_user_id::text);
end; $$;
revoke all on function private.request_user_kyc(uuid) from public,anon,authenticated;
grant execute on function private.request_user_kyc(uuid) to authenticated;
create or replace function public.admin_request_user_kyc(p_user_id uuid) returns void language sql security invoker set search_path='' as $$ select private.request_user_kyc(p_user_id) $$;
revoke all on function public.admin_request_user_kyc(uuid) from public,anon;
grant execute on function public.admin_request_user_kyc(uuid) to authenticated;

create or replace function public.submit_kyc(p_document_type text,p_country text,p_documents jsonb) returns void language plpgsql security invoker set search_path='' as $$
declare v_expected integer;
begin
 if not private.is_account_active() then raise exception 'Active account required'; end if;
 if p_document_type not in ('drivers_license','international_passport') then raise exception 'Select a supported identity document'; end if;
 if p_country not in ('Benin','Burkina Faso','Cabo Verde','Côte d’Ivoire','Gambia','Ghana','Guinea','Guinea-Bissau','Liberia','Mali','Mauritania','Niger','Nigeria','Senegal','Sierra Leone','Togo') then raise exception 'Select a valid country of residence'; end if;
 v_expected:=case when p_document_type='drivers_license' then 2 else 1 end;
 if jsonb_typeof(p_documents)<>'object' or (select count(*) from jsonb_each_text(p_documents) where value like 'https://res.cloudinary.com/%')<>v_expected then raise exception 'Upload all required documents to Cloudinary first'; end if;
 if (p_document_type='drivers_license' and not (p_documents ? 'front' and p_documents ? 'back')) or (p_document_type='international_passport' and not (p_documents ? 'bio_page')) then raise exception 'Required document images are missing'; end if;
 if exists(select 1 from public.profiles where id=auth.uid() and kyc_status='approved') then raise exception 'Your KYC is already approved'; end if;
 insert into public.kyc_submissions(user_id,document_type,country,documents) values(auth.uid(),p_document_type,p_country,p_documents);
 update public.profiles set kyc_status='submitted',kyc_country=p_country,kyc_submitted_at=now(),updated_at=now() where id=auth.uid();
 update public.notifications set read_at=now() where user_id=auth.uid() and requires_action=true and action_url='/dashboard/kyc' and read_at is null;
end; $$;
revoke all on function public.submit_kyc(text,text,jsonb) from public,anon;
grant execute on function public.submit_kyc(text,text,jsonb) to authenticated;

notify pgrst,'reload schema';

-- Preserve the most recent known login IP before invalidating a suspended member's sessions.
alter table public.profiles add column if not exists last_login_ip text;
-- The live private.set_user_status and private.user_details definitions also persist/read this value.

-- Additional admin controls, KYC alert acknowledgement and scheduled database keepalive.
create or replace function private.set_user_status(p_user_id uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if p_status not in ('active','suspended') then raise exception 'Invalid status'; end if;
 if p_user_id=auth.uid() then raise exception 'You cannot suspend or reactivate your own administrator account'; end if;
 update public.profiles set account_status=p_status,updated_at=now(),last_login_ip=coalesce((select s.ip::text from auth.sessions s where s.user_id=p_user_id order by s.created_at desc limit 1),last_login_ip) where id=p_user_id;
 if not found then raise exception 'User not found'; end if;
 if p_status='suspended' then update auth.users set banned_until=now()+interval '100 years' where id=p_user_id; delete from auth.sessions where user_id=p_user_id; else update auth.users set banned_until=null where id=p_user_id; end if;
 insert into public.admin_audit_logs(actor_id,action,target,details) values(auth.uid(),'user.status_changed',p_user_id::text,jsonb_build_object('status',p_status,'sessions_revoked',p_status='suspended'));
end; $$;
revoke all on function private.set_user_status(uuid,text) from public,anon,authenticated;
grant execute on function private.set_user_status(uuid,text) to authenticated;
create or replace function private.downgrade_user_admin(p_user_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_email text;
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if p_user_id=auth.uid() then raise exception 'You cannot downgrade your own administrator account'; end if;
 select email::text into v_email from auth.users where id=p_user_id;
 if v_email is null then raise exception 'User not found'; end if;
 if not private.is_user_admin(p_user_id) then raise exception 'This account is not an administrator'; end if;
 update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)-'role' where id=p_user_id;
 update public.app_settings s set value=jsonb_set(coalesce(s.value,'{}'::jsonb),'{emails}',coalesce((select jsonb_agg(to_jsonb(x.email)) from jsonb_array_elements_text(coalesce(s.value->'emails','[]'::jsonb)) as x(email) where lower(x.email)<>lower(v_email)),'[]'::jsonb),true),updated_at=now() where s.key='admin_emails';
 insert into public.admin_audit_logs(actor_id,action,target,details) values(auth.uid(),'admin.downgraded',p_user_id::text,jsonb_build_object('email',v_email));
end; $$;
revoke all on function private.downgrade_user_admin(uuid) from public,anon,authenticated;
grant execute on function private.downgrade_user_admin(uuid) to authenticated;
create or replace function public.admin_downgrade_user(p_user_id uuid) returns void language sql security invoker set search_path='' as $$ select private.downgrade_user_admin(p_user_id) $$;
revoke all on function public.admin_downgrade_user(uuid) from public,anon;
grant execute on function public.admin_downgrade_user(uuid) to authenticated;
create or replace function private.request_user_kyc(p_user_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator access only'; end if;
 if exists(select 1 from public.profiles where id=p_user_id and kyc_status='approved') then raise exception 'KYC is already approved'; end if;
 update public.profiles set kyc_status='requested',updated_at=now() where id=p_user_id;
 if not exists(select 1 from public.notifications where user_id=p_user_id and requires_action=true and action_url='/dashboard/kyc' and read_at is null) then perform private.send_user_alert(p_user_id,'Identity verification required','Please submit your identity documents using the secure KYC submission link. This request remains visible until you continue to verification.','/dashboard/kyc',true); end if;
 insert into public.admin_audit_logs(actor_id,action,target) values(auth.uid(),'kyc.requested',p_user_id::text);
end; $$;
revoke all on function private.request_user_kyc(uuid) from public,anon,authenticated;
grant execute on function private.request_user_kyc(uuid) to authenticated;
create or replace function public.acknowledge_kyc_alert(p_notification_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 update public.notifications set read_at=coalesce(read_at,now()) where id=p_notification_id and user_id=auth.uid() and requires_action=true and action_url='/dashboard/kyc';
 if not found then raise exception 'Verification alert not found'; end if;
end; $$;
revoke all on function public.acknowledge_kyc_alert(uuid) from public,anon;
grant execute on function public.acknowledge_kyc_alert(uuid) to authenticated;
create or replace function public.keepalive_ping() returns timestamptz language sql stable set search_path='' as $$ select now() $$;
revoke all on function public.keepalive_ping() from public;
grant execute on function public.keepalive_ping() to anon,authenticated,service_role;
notify pgrst,'reload schema';

-- Keep the exposed RPC as SECURITY INVOKER; its guarded implementation stays private.
create or replace function private.acknowledge_kyc_alert(p_notification_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 update public.notifications set read_at=coalesce(read_at,now()) where id=p_notification_id and user_id=auth.uid() and requires_action=true and action_url='/dashboard/kyc';
 if not found then raise exception 'Verification alert not found'; end if;
end; $$;
revoke all on function private.acknowledge_kyc_alert(uuid) from public,anon,authenticated;
grant execute on function private.acknowledge_kyc_alert(uuid) to authenticated;
create or replace function public.acknowledge_kyc_alert(p_notification_id uuid) returns void language sql security invoker set search_path='' as $$ select private.acknowledge_kyc_alert(p_notification_id) $$;
revoke all on function public.acknowledge_kyc_alert(uuid) from public,anon;
grant execute on function public.acknowledge_kyc_alert(uuid) to authenticated;
notify pgrst,'reload schema';

-- Evaluate administrator rights against current database metadata, not stale JWT app_metadata.
create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce((u.raw_app_meta_data->>'role')='admin',false)
   or lower(coalesce(u.email,''))=any(array(select lower(jsonb_array_elements_text(s.value->'emails'))))
 from auth.users u left join public.app_settings s on s.key='admin_emails'
 where u.id=auth.uid()
$$;
revoke all on function private.is_admin() from public,anon;
grant execute on function private.is_admin() to authenticated;
notify pgrst,'reload schema';

-- Treat missing auth identity as a non-admin (never let NULL pass an IF NOT check).
create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path='' as $$
 select coalesce((
   select coalesce((u.raw_app_meta_data->>'role')='admin',false)
     or lower(coalesce(u.email,''))=any(array(select lower(jsonb_array_elements_text(s.value->'emails'))))
   from auth.users u left join public.app_settings s on s.key='admin_emails'
   where u.id=auth.uid()
 ),false)
$$;
revoke all on function private.is_admin() from public,anon;
grant execute on function private.is_admin() to authenticated;
notify pgrst,'reload schema';

-- Gender is required for new accounts and collected from existing members on next dashboard visit.
alter table public.profiles add column if not exists gender text;
do $$
begin
 if not exists(select 1 from pg_constraint where conrelid='public.profiles'::regclass and conname='profiles_gender_allowed') then
  alter table public.profiles add constraint profiles_gender_allowed check (gender is null or gender in ('Male','Female'));
 end if;
end $$;
create or replace function public.handle_new_member()
returns trigger language plpgsql security definer set search_path to 'public' as $function$
declare v_referrer_id uuid; v_referral_code text; v_gender text;
begin
 v_gender:=trim(coalesce(new.raw_user_meta_data->>'gender',''));
 if v_gender not in ('Male','Female') then raise exception 'Please select Male or Female to create your account'; end if;
 insert into public.profiles(id,uid,full_name,email,phone,gender)
 values(new.id,'TVQ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),coalesce(new.raw_user_meta_data->>'full_name',''),new.email,new.raw_user_meta_data->>'phone',v_gender)
 on conflict(id) do update set email=excluded.email,gender=coalesce(public.profiles.gender,excluded.gender);
 insert into public.wallets(user_id) values(new.id) on conflict(user_id) do nothing;
 v_referral_code:=upper(trim(coalesce(new.raw_user_meta_data->>'referral_code','')));
 if v_referral_code<>'' then
  select id into v_referrer_id from public.profiles where upper(referral_code)=v_referral_code limit 1;
  if v_referrer_id is not null and v_referrer_id<>new.id then
   insert into public.referrals(referrer_id,referred_user_id,referral_code) values(v_referrer_id,new.id,v_referral_code) on conflict(referred_user_id) do nothing;
  end if;
 end if;
 return new;
end; $function$;
revoke all on function public.handle_new_member() from public,anon,authenticated;
