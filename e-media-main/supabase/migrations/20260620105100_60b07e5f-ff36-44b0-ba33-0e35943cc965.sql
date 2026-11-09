CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users manage own push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.daily_subscribers
ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_enabled_idx ON public.push_subscriptions(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS daily_subscribers_enabled_idx ON public.daily_subscribers(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS daily_subscribers_email_enabled_idx ON public.daily_subscribers(email_enabled) WHERE email_enabled = true;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_subscribers_updated_at ON public.daily_subscribers;
CREATE TRIGGER update_daily_subscribers_updated_at
BEFORE UPDATE ON public.daily_subscribers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();