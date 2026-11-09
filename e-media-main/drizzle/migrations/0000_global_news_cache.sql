CREATE TABLE public.global_news_cache (id text PRIMARY KEY, payload jsonb NOT NULL DEFAULT '{}'::jsonb, fetched_at timestamptz, lease_until timestamptz NOT NULL DEFAULT '-infinity'::timestamptz);
GRANT SELECT ON public.global_news_cache TO authenticated;
GRANT ALL ON public.global_news_cache TO service_role;
ALTER TABLE public.global_news_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in readers can read cached global news" ON public.global_news_cache FOR SELECT TO authenticated USING (true);