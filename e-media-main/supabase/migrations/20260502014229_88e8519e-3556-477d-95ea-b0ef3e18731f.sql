ALTER TABLE public.user_interactions
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS dwell_seconds INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_ui_user_created ON public.user_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ui_source ON public.user_interactions(source_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ui_category ON public.user_interactions(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ui_country ON public.user_interactions(country);
CREATE INDEX IF NOT EXISTS idx_ui_session ON public.user_interactions(session_id);

-- Aggregated research view (per user × source × day)
CREATE OR REPLACE VIEW public.media_consumption_daily AS
SELECT
  user_id,
  source_id,
  source_name,
  category,
  country,
  date_trunc('day', created_at) AS day,
  COUNT(*) FILTER (WHERE interaction_type IN ('view','click','read'))     AS views,
  COUNT(*) FILTER (WHERE interaction_type = 'play')                       AS plays,
  COUNT(*) FILTER (WHERE interaction_type = 'favorite')                   AS favorites,
  COUNT(*) FILTER (WHERE interaction_type = 'share')                      AS shares,
  COALESCE(SUM(dwell_seconds), 0)                                          AS total_seconds
FROM public.user_interactions
GROUP BY user_id, source_id, source_name, category, country, date_trunc('day', created_at);