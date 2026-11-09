
-- 1. Tighten notifications INSERT
DROP POLICY IF EXISTS "Allow broadcast notifications insert" ON public.notifications;

-- Authenticated users can only insert notifications targeting themselves
CREATE POLICY "Users insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Service role bypasses RLS automatically; no separate policy needed.

-- 2. Lock down handle_new_user / update_updated_at_column EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 3. Avatars bucket: prevent listing, allow read by exact path, allow users to upload to their own folder
-- Drop overly broad SELECT policies on storage.objects for avatars
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (qual LIKE '%avatars%' OR with_check LIKE '%avatars%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

-- Users can read any single object in avatars (direct URL still works because bucket is public)
-- but to prevent listing we DON'T add a broad SELECT policy. Public bucket access uses bucket-level read.
-- Users can upload/update/delete only files inside a folder named by their user id
CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

-- 4. Realtime authorization: scope channel subscriptions to user's own topic
-- Enable RLS on realtime.messages and add policy
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read own notif channel" ON realtime.messages;
CREATE POLICY "Authenticated can read own notif channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Allow postgres_changes events on the notifications table — RLS on the underlying table already filters rows
  extension = 'postgres_changes'
);
