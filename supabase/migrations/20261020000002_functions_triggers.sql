-- Phase 2: authorization helper, triggers and RPC functions.
-- Every SECURITY DEFINER function pins search_path and is granted explicitly (see the RLS migration).

-- ------------------------------------------------------------ authorization
-- The only source of admin authority is a row in public.user_roles. That table has no write policy and no
-- write grant for anon/authenticated, so roles can only be granted from the SQL editor or a service-role process.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles where user_id = (select auth.uid()) and role = 'admin'
  )
$$;

-- ------------------------------------------------------------ new-user profile
-- Runs when Supabase Auth creates a user. raw_user_meta_data is chosen by the person signing up, so only
-- low-risk display fields are copied, each validated. No privileged value can come from it.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  dn text;
  at text;
  lang text;
  ctry text;
begin
  dn := left(nullif(btrim(meta ->> 'display_name'), ''), 80);
  if dn is null then dn := left(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 80); end if;
  if dn is null then dn := 'Member'; end if;
  at := meta ->> 'account_type';
  if at is null or at not in ('farmer','officer','researcher','student','startup','developer','investor','organization') then
    at := null;
  end if;
  lang := case when meta ->> 'language' = 'sw' then 'sw' else 'en' end;
  ctry := left(nullif(btrim(meta ->> 'country'), ''), 80);
  insert into public.profiles (id, display_name, country, account_type, language)
  values (new.id, dn, ctry, at, lang)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ------------------------------------------------------------ content defaults
create function public.content_defaults() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := coalesce(new.created_by, (select auth.uid()));
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['innovations','articles','courses','experts','startups','organizations','partnerships']
  loop
    execute format('create trigger content_defaults before insert or update on public.%I for each row execute function public.content_defaults()', t);
  end loop;
end $$;

-- ------------------------------------------------------------ community authorship
-- The author is stamped by the database so a client cannot post as somebody else. A NULL auth.uid() means a
-- trusted caller (SQL editor, service role, seed) and the row is left as supplied.
create function public.stamp_reply() returns trigger
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then return new; end if;
  new.author_id := uid;
  new.author_label := null;
  new.is_sample := false;
  new.sample_key := null;
  new.accepted := false;
  select p.display_name into new.author_name from public.profiles p where p.id = uid;
  return new;
end $$;

create function public.stamp_author() returns trigger
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then return new; end if;
  new.author_id := uid;
  new.author_label := null;
  new.is_sample := false;
  select p.display_name into new.author_name from public.profiles p where p.id = uid;
  return new;
end $$;

create trigger stamp_author before insert on public.discussions
  for each row execute function public.stamp_author();
create trigger stamp_reply before insert on public.discussion_replies
  for each row execute function public.stamp_reply();

-- ------------------------------------------------------------ submissions and messages
create function public.stamp_submission() returns trigger
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if uid is not null then
      new.user_id := uid;
      new.status := 'pending';
      new.admin_note := null;
      new.reviewed_by := null;
      new.reviewed_at := null;
    end if;
  elsif new.status is distinct from old.status then
    new.reviewed_by := uid;
    new.reviewed_at := now();
  end if;
  return new;
end $$;

create trigger stamp_submission before insert or update on public.content_submissions
  for each row execute function public.stamp_submission();

create function public.stamp_contact() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.user_id := (select auth.uid());
  new.status := 'new';
  return new;
end $$;

create trigger stamp_contact before insert on public.contact_messages
  for each row execute function public.stamp_contact();

-- ------------------------------------------------------------ audit trail
-- Records WHO changed WHICH row, never the row contents, passwords or tokens. Only changes made by an admin
-- are logged here; ordinary user writes (a forum post, a bookmark) are not administrative events.
create function public.log_admin_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  rid text;
  row_json jsonb;
begin
  if public.is_admin() then
    -- NEW is not assigned in DELETE triggers and OLD is not assigned in INSERT triggers, so pick one explicitly.
    row_json := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
    rid := coalesce(row_json ->> 'id', row_json ->> 'key');
    insert into public.audit_events (actor_id, action, table_name, record_id)
    values ((select auth.uid()), lower(tg_op), tg_table_name, rid);
  end if;
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['sectors','applications','categories','countries','innovations','articles','courses',
    'experts','startups','organizations','partnerships','discussions','discussion_replies',
    'content_submissions','contact_messages','site_settings']
  loop
    execute format('create trigger audit_admin_change after insert or update or delete on public.%I for each row execute function public.log_admin_change()', t);
  end loop;
end $$;

-- ------------------------------------------------------------ RPC: accept an answer
create function public.accept_reply(p_reply uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_discussion uuid;
  v_owner uuid;
begin
  select r.discussion_id, d.author_id into v_discussion, v_owner
  from public.discussion_replies r join public.discussions d on d.id = r.discussion_id
  where r.id = p_reply;
  if not found then
    raise exception 'reply not found' using errcode = 'P0002';
  end if;
  if not (public.is_admin() or v_owner = (select auth.uid())) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.discussion_replies set accepted = (id = p_reply) where discussion_id = v_discussion;
end $$;

-- ------------------------------------------------------------ RPC: admin broadcast
-- Creates one notification per member who has the matching preference switched on. Admin only.
create function public.admin_broadcast_notification(p_kind text, p_title jsonb, p_body jsonb, p_link text default null)
returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  insert into public.notifications (user_id, kind, title, body, link)
  select p.id, p_kind, p_title, p_body, p_link
  from public.profiles p
  where p_kind = 'system'
     or (p_kind = 'content' and p.notify_content)
     or (p_kind = 'community' and p.notify_community)
     or (p_kind = 'learning' and p.notify_learning);
  get diagnostics n = row_count;
  insert into public.audit_events (actor_id, action, table_name, record_id)
  values ((select auth.uid()), 'broadcast', 'notifications', n::text);
  return n;
end $$;
