
CREATE TABLE public.user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  media_id text NOT NULL,
  interaction_type text NOT NULL DEFAULT 'view',
  duration_seconds integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own interactions" ON public.user_interactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions" ON public.user_interactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_user_interactions_user ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_media ON public.user_interactions(media_id);

CREATE TABLE public.user_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic)
);

ALTER TABLE public.user_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own topics" ON public.user_topics
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.media_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id text NOT NULL,
  topic text NOT NULL,
  UNIQUE(media_id, topic)
);

ALTER TABLE public.media_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read media topics" ON public.media_topics
  FOR SELECT TO authenticated USING (true);
