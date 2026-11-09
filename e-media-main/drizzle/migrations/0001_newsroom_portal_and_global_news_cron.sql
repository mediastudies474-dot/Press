-- Staff roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Newsroom articles published by Imvelo T&M Group staff
create table if not exists public.newsroom_articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  author_name text,
  title text not null,
  summary text,
  body text not null,
  category text not null default 'news',
  image_url text,
  status text not null default 'published',
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.newsroom_articles to anon, authenticated;
grant insert, update, delete on public.newsroom_articles to authenticated;
grant all on public.newsroom_articles to service_role;
alter table public.newsroom_articles enable row level security;
create policy "Anyone can read published newsroom articles" on public.newsroom_articles for select using (status = 'published');
create policy "Staff can insert articles" on public.newsroom_articles for insert to authenticated
  with check (auth.uid() = author_id and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'staff'));
create policy "Staff can update own articles" on public.newsroom_articles for update to authenticated
  using (auth.uid() = author_id and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'staff'));
create policy "Staff can delete own articles" on public.newsroom_articles for delete to authenticated
  using (auth.uid() = author_id and exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'staff'));
create trigger update_newsroom_articles_updated_at before update on public.newsroom_articles
  for each row execute function public.update_updated_at_column();

-- Private cron token store (no grants => unreachable via Data API)
create table if not exists public.cron_config (
  key text primary key,
  value text not null
);
alter table public.cron_config enable row level security;
insert into public.cron_config (key, value)
values ('global_news_token', gen_random_uuid()::text)
on conflict (key) do nothing;

-- Hourly global news refresh via the newsdata API-backed edge function
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule(
  'global-news-hourly',
  '7 * * * *',
  $$
  select net.http_post(
    url := 'https://fgprfeibxzpkgqhxzhuo.supabase.co/functions/v1/global-news',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select value from public.cron_config where key = 'global_news_token'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);