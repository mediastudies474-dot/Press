ALTER TABLE public.daily_subscribers
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS sms_enabled boolean NOT NULL DEFAULT false;