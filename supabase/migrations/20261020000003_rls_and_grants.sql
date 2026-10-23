-- Phase 2: Row Level Security and least-privilege grants.
-- Principle: public visitors read PUBLISHED content only; every write on managed content requires public.is_admin();
-- user-owned data is scoped to auth.uid(); nothing here trusts a role value sent by the browser.

-- ------------------------------------------------------------ privileges
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;

grant usage on schema public to anon, authenticated;

-- public reading (RLS narrows content tables to published rows)
grant select on public.sectors, public.applications, public.categories, public.countries,
  public.innovations, public.articles, public.courses, public.experts, public.startups,
  public.organizations, public.partnerships, public.discussions, public.discussion_replies,
  public.site_settings to anon, authenticated;

-- administrators work through the authenticated role; RLS requires is_admin() for every one of these writes
grant insert, update, delete on public.sectors, public.applications, public.categories, public.countries,
  public.innovations, public.articles, public.courses, public.experts, public.startups,
  public.organizations, public.partnerships, public.site_settings to authenticated;
grant update, delete on public.discussions, public.discussion_replies to authenticated;
grant insert on public.discussions, public.discussion_replies to authenticated;

-- own account data
grant select, insert, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;               -- read only; no write grant exists
grant select, insert, delete on public.bookmarks to authenticated;
grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;  -- members may only mark read
grant select, insert on public.content_submissions to authenticated;
grant update, delete on public.content_submissions to authenticated; -- RLS: admins only
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated; -- RLS: admins only
grant select on public.audit_events to authenticated;             -- RLS: admins only

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.accept_reply(uuid) to authenticated;
grant execute on function public.admin_broadcast_notification(text, jsonb, jsonb, text) to authenticated;

-- ------------------------------------------------------------ enable RLS on every table
alter table public.sectors enable row level security;
alter table public.applications enable row level security;
alter table public.categories enable row level security;
alter table public.countries enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.innovations enable row level security;
alter table public.articles enable row level security;
alter table public.courses enable row level security;
alter table public.experts enable row level security;
alter table public.startups enable row level security;
alter table public.organizations enable row level security;
alter table public.partnerships enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_replies enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notifications enable row level security;
alter table public.content_submissions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_events enable row level security;

-- ------------------------------------------------------------ taxonomies: public read, admin write
do $$
declare t text;
begin
  foreach t in array array['sectors','applications','categories','countries']
  loop
    execute format('create policy "anyone reads" on public.%I for select using (true)', t);
    execute format('create policy "admins write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ------------------------------------------------------------ managed content: published for everyone, all for admins
do $$
declare t text;
begin
  foreach t in array array['innovations','articles','courses','experts','startups','organizations','partnerships']
  loop
    execute format('create policy "public reads published" on public.%I for select using (status = ''published'' or public.is_admin())', t);
    execute format('create policy "admins write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ------------------------------------------------------------ community
create policy "public reads published discussions" on public.discussions
  for select using (status = 'published' or public.is_admin());
create policy "members start discussions" on public.discussions
  for insert to authenticated
  with check (status = 'published' and author_id = (select auth.uid()));
create policy "admins moderate discussions" on public.discussions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public reads replies of visible discussions" on public.discussion_replies
  for select using (
    public.is_admin()
    or (status = 'published' and exists (select 1 from public.discussions d where d.id = discussion_id))
  );
create policy "members reply" on public.discussion_replies
  for insert to authenticated
  with check (
    status = 'published'
    and author_id = (select auth.uid())
    and exists (select 1 from public.discussions d where d.id = discussion_id)
  );
create policy "admins moderate replies" on public.discussion_replies
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------ accounts
create policy "read own profile or admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "create own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- user_roles: members can see their own rows (so the app can show the admin menu). No insert/update/delete policy
-- exists, and no write privilege is granted, so roles cannot be changed through the API by anyone.
create policy "read own roles or admin" on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());

-- ------------------------------------------------------------ private user data
create policy "own bookmarks read" on public.bookmarks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own bookmarks add" on public.bookmarks
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and (innovation_id is null or exists (select 1 from public.innovations i where i.id = innovation_id))
    and (article_id is null or exists (select 1 from public.articles a where a.id = article_id))
  );
create policy "own bookmarks remove" on public.bookmarks
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "own notifications read" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "own notifications mark read" on public.notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own notifications delete" on public.notifications
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "own submissions read" on public.content_submissions
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "members submit" on public.content_submissions
  for insert to authenticated with check (user_id = (select auth.uid()) and status = 'pending');
create policy "admins review submissions" on public.content_submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete submissions" on public.content_submissions
  for delete to authenticated using (public.is_admin());

-- ------------------------------------------------------------ contact messages: anyone may write, only admins read
create policy "anyone sends a message" on public.contact_messages
  for insert to anon, authenticated with check (status = 'new');
create policy "admins read messages" on public.contact_messages
  for select to authenticated using (public.is_admin());
create policy "admins update messages" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete messages" on public.contact_messages
  for delete to authenticated using (public.is_admin());

-- ------------------------------------------------------------ settings and audit
create policy "public settings are readable" on public.site_settings
  for select using (is_public or public.is_admin());
create policy "admins write settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins read audit" on public.audit_events
  for select to authenticated using (public.is_admin());
