CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'news',
  content_type TEXT NOT NULL DEFAULT 'article',
  title TEXT NOT NULL,
  summary TEXT,
  image_url TEXT,
  url TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (source_id, external_id)
);

CREATE INDEX idx_articles_source ON public.articles (source_id, published_at DESC);
CREATE INDEX idx_articles_published ON public.articles (published_at DESC);
CREATE INDEX idx_articles_category ON public.articles (category, published_at DESC);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are publicly readable"
ON public.articles FOR SELECT
USING (true);

CREATE POLICY "Service role manages articles"
ON public.articles FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role updates articles"
ON public.articles FOR UPDATE
TO service_role
USING (true);
