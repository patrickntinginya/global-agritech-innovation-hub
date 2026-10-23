-- Global AgriTech Innovation Hub, Phase 2: schema.
-- Apply in order with the Supabase CLI (`supabase db push`) or paste each file into the SQL editor.
-- Conventions
--   * Taxonomy tables (sectors, applications, categories, countries) use short stable text ids ("smart-farming").
--   * Content tables use a uuid primary key plus a unique slug (the id the public URLs use).
--   * Translated text lives in jsonb objects shaped { "en": ..., "sw": ... }.
--   * is_sample = true marks demonstration content that came from the Phase 1 seed. Real content defaults to false.

create extension if not exists pg_trgm with schema extensions;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.app_role as enum ('admin');

-- ---------------------------------------------------------------- helpers
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- True when a jsonb value carries both languages.
create function public.has_en_sw(j jsonb) returns boolean
language sql immutable set search_path = '' as $$
  select j is not null and jsonb_typeof(j) = 'object' and j ? 'en' and j ? 'sw'
$$;

-- ---------------------------------------------------------------- taxonomies
create table public.sectors (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label jsonb not null check (public.has_en_sw(label)),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label jsonb not null check (public.has_en_sw(label)),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  icon text not null default 'leaf',
  application_ids text[] not null default '{}',
  title jsonb not null check (public.has_en_sw(title)),
  blurb jsonb check (blurb is null or public.has_en_sw(blurb)),
  consider jsonb check (consider is null or public.has_en_sw(consider)),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.countries (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  tone text not null default 'a',
  name jsonb not null check (public.has_en_sw(name)),
  description jsonb check (description is null or public.has_en_sw(description)),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- accounts
-- profiles holds ONLY non-privileged data. Authorization lives in user_roles.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  country text check (country is null or char_length(country) <= 80),
  account_type text check (account_type is null or account_type in
    ('farmer','officer','researcher','student','startup','developer','investor','organization')),
  bio text check (bio is null or char_length(bio) <= 500),
  interests text[] not null default '{}',
  language text not null default 'en' check (language in ('en', 'sw')),
  notify_content boolean not null default true,
  notify_community boolean not null default true,
  notify_learning boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users (id) on delete set null,
  primary key (user_id, role)
);

-- ---------------------------------------------------------------- content
create table public.innovations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  is_sample boolean not null default false,
  sector text not null references public.sectors (id),
  country_id text not null references public.countries (id),
  category_id text not null references public.categories (id),
  application_ids text[] not null default '{}',
  title jsonb not null check (public.has_en_sw(title)),
  summary jsonb not null check (public.has_en_sw(summary)),
  benefits jsonb not null default '{"en":[],"sw":[]}' check (public.has_en_sw(benefits)),
  considerations jsonb not null default '{"en":[],"sw":[]}' check (public.has_en_sw(considerations)),
  added_on date not null default current_date,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    lower(coalesce(title ->> 'en', '') || ' ' || coalesce(title ->> 'sw', '') || ' ' ||
          coalesce(summary ->> 'en', '') || ' ' || coalesce(summary ->> 'sw', ''))
  ) stored
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  is_sample boolean not null default false,
  type text not null check (type in ('summary','caseStudy','cropGuide','livestockGuide','climate','implementation')),
  sector text not null default 'both' check (sector in ('crop','livestock','both')),
  category_ids text[] not null default '{}',
  title jsonb not null check (public.has_en_sw(title)),
  summary jsonb not null check (public.has_en_sw(summary)),
  body jsonb not null default '{"en":[],"sw":[]}' check (public.has_en_sw(body)),
  minutes integer not null default 3 check (minutes between 1 and 120),
  published_on date not null default current_date,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    lower(coalesce(title ->> 'en', '') || ' ' || coalesce(title ->> 'sw', '') || ' ' ||
          coalesce(summary ->> 'en', '') || ' ' || coalesce(summary ->> 'sw', ''))
  ) stored
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  is_sample boolean not null default false,
  level text not null check (level in ('beginner','intermediate','advanced')),
  weeks integer not null check (weeks between 1 and 104),
  icon text not null default 'book',
  topic text not null check (topic in ('crop','livestock','technology','climate','business','digital')),
  related_category_id text references public.categories (id),
  title jsonb not null check (public.has_en_sw(title)),
  description jsonb not null check (public.has_en_sw(description)),
  modules jsonb not null default '{"en":[],"sw":[]}' check (public.has_en_sw(modules)),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    lower(coalesce(title ->> 'en', '') || ' ' || coalesce(title ->> 'sw', '') || ' ' ||
          coalesce(description ->> 'en', '') || ' ' || coalesce(description ->> 'sw', ''))
  ) stored
);

create table public.experts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  is_sample boolean not null default false,
  name text not null check (char_length(name) between 1 and 120),
  country_id text not null references public.countries (id),
  area text not null check (area in ('irrigation','greenhouse','soil','livestock','extension','mechanization')),
  area_label jsonb not null check (public.has_en_sw(area_label)),
  bio jsonb not null check (public.has_en_sw(bio)),
  expertise jsonb not null default '{"en":[],"sw":[]}' check (public.has_en_sw(expertise)),
  initial text not null default 'A' check (char_length(initial) = 1),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    lower(name || ' ' || coalesce(area_label ->> 'en', '') || ' ' || coalesce(bio ->> 'en', ''))
  ) stored
);

create table public.startups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  is_sample boolean not null default false,
  name text not null check (char_length(name) between 1 and 120),
  country_id text not null references public.countries (id),
  category_id text not null references public.categories (id),
  stage text not null check (stage in ('early','growing','established')),
  description jsonb not null check (public.has_en_sw(description)),
  solutions jsonb not null default '{"en":[],"sw":[]}' check (public.has_en_sw(solutions)),
  needs jsonb not null default '{"en":[],"sw":[]}' check (public.has_en_sw(needs)),
  letter text not null default 'A' check (char_length(letter) = 1),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    lower(name || ' ' || coalesce(description ->> 'en', '') || ' ' || coalesce(description ->> 'sw', ''))
  ) stored
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  is_sample boolean not null default false,
  org_type text not null check (org_type in ('cooperative','university','ngo','agency')),
  country_id text not null references public.countries (id),
  name jsonb not null check (public.has_en_sw(name)),
  summary jsonb not null check (public.has_en_sw(summary)),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Opportunities and innovation challenges share one table (kind). `phase` is the real-world progress
-- (open / planned / closed); `status` is publication state.
create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  is_sample boolean not null default false,
  kind text not null check (kind in ('opportunity','challenge')),
  subtype text check (subtype is null or subtype in ('pilot','research','training','funding','distribution')),
  topic text check (topic is null or topic in ('storage','herd','advisory')),
  phase text not null default 'open' check (phase in ('open','planned','closed')),
  title jsonb not null check (public.has_en_sw(title)),
  summary jsonb not null check (public.has_en_sw(summary)),
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- community
create table public.discussions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status public.content_status not null default 'published',
  is_sample boolean not null default false,
  kind text not null check (kind in ('question','discussion')),
  topic text not null check (topic in ('technology','livestock','climate','business','crops','learning')),
  title jsonb not null check (public.has_en_sw(title)),
  body jsonb not null check (public.has_en_sw(body)),
  author_id uuid references auth.users (id) on delete set null,
  author_name text check (author_name is null or char_length(author_name) <= 80),
  author_label jsonb check (author_label is null or public.has_en_sw(author_label)),
  posted_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    lower(coalesce(title ->> 'en', '') || ' ' || coalesce(title ->> 'sw', '') || ' ' || coalesce(body ->> 'en', ''))
  ) stored,
  -- Real posts carry the author; seeded samples carry a label instead.
  check (is_sample or author_id is not null or author_name is not null) -- author_id becomes NULL if the account is deleted; the stamped name keeps the post valid
);

create table public.discussion_replies (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions (id) on delete cascade,
  sample_key text unique,
  status public.content_status not null default 'published',
  is_sample boolean not null default false,
  body jsonb not null check (public.has_en_sw(body)),
  accepted boolean not null default false,
  author_id uuid references auth.users (id) on delete set null,
  author_name text check (author_name is null or char_length(author_name) <= 80),
  author_label jsonb check (author_label is null or public.has_en_sw(author_label)),
  created_at timestamptz not null default now(),
  check (is_sample or author_id is not null or author_name is not null) -- author_id becomes NULL if the account is deleted; the stamped name keeps the post valid
);

-- ---------------------------------------------------------------- user data
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  innovation_id uuid references public.innovations (id) on delete cascade,
  article_id uuid references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (num_nonnulls(innovation_id, article_id) = 1),
  unique (user_id, innovation_id),
  unique (user_id, article_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('content','community','learning','system')),
  title jsonb not null check (public.has_en_sw(title)),
  body jsonb not null check (public.has_en_sw(body)),
  link text check (link is null or (link like '/%' and char_length(link) <= 200)),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.content_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('innovation','startup','opportunity')),
  title text not null check (char_length(title) between 5 and 160),
  organization text not null check (char_length(organization) between 1 and 160),
  country_id text not null references public.countries (id),
  category_id text not null references public.categories (id),
  description text not null check (char_length(description) between 30 and 4000),
  contact_email text not null check (contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(contact_email) <= 254),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text check (admin_note is null or char_length(admin_note) <= 1000),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  reason text not null default 'general' check (reason in ('general','listing','partnership','feedback','problem')),
  subject text not null check (char_length(subject) between 3 and 160),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'new' check (status in ('new','read','archived')),
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_.]+$'),
  value jsonb not null,
  is_public boolean not null default false,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (action in ('insert','update','delete','broadcast')),
  table_name text not null,
  record_id text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- indexes
create index innovations_list_idx on public.innovations (status, added_on desc);
create index innovations_category_idx on public.innovations (category_id) where status = 'published';
create index innovations_country_idx on public.innovations (country_id) where status = 'published';
create index innovations_sector_idx on public.innovations (sector) where status = 'published';
create index innovations_apps_idx on public.innovations using gin (application_ids);
create index innovations_search_idx on public.innovations using gin (search_text extensions.gin_trgm_ops);
create index articles_list_idx on public.articles (status, published_on desc);
create index articles_type_idx on public.articles (type) where status = 'published';
create index articles_cats_idx on public.articles using gin (category_ids);
create index articles_search_idx on public.articles using gin (search_text extensions.gin_trgm_ops);
create index courses_list_idx on public.courses (status, topic, level);
create index courses_search_idx on public.courses using gin (search_text extensions.gin_trgm_ops);
create index experts_list_idx on public.experts (status, area);
create index experts_search_idx on public.experts using gin (search_text extensions.gin_trgm_ops);
create index startups_list_idx on public.startups (status, stage);
create index startups_search_idx on public.startups using gin (search_text extensions.gin_trgm_ops);
create index organizations_list_idx on public.organizations (status);
create index partnerships_list_idx on public.partnerships (status, kind, phase);
create index discussions_list_idx on public.discussions (status, posted_on desc);
create index discussions_search_idx on public.discussions using gin (search_text extensions.gin_trgm_ops);
create index replies_discussion_idx on public.discussion_replies (discussion_id, created_at);
create index bookmarks_user_idx on public.bookmarks (user_id, created_at desc);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index submissions_user_idx on public.content_submissions (user_id, created_at desc);
create index submissions_status_idx on public.content_submissions (status, created_at desc);
create index contact_status_idx on public.contact_messages (status, created_at desc);
create index audit_created_idx on public.audit_events (created_at desc);

-- ---------------------------------------------------------------- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['sectors','applications','categories','countries','profiles','innovations','articles',
    'courses','experts','startups','organizations','partnerships','discussions','content_submissions']
  loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
