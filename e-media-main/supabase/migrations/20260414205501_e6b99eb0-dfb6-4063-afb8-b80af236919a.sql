
CREATE POLICY "Allow broadcast notifications insert" ON public.notifications
  FOR INSERT WITH CHECK (true);
