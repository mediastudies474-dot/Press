
CREATE TABLE public.daily_subscribers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_subscribers TO authenticated;
GRANT ALL ON public.daily_subscribers TO service_role;

ALTER TABLE public.daily_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscription"
ON public.daily_subscribers FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
