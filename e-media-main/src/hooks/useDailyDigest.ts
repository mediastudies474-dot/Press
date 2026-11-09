import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDailyDigest() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setEnabled(false); setEmailEnabled(false); setSmsEnabled(false);
      setEmail(''); setPhone(''); setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('daily_subscribers')
        .select('enabled, email_enabled, email, sms_enabled, phone')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      setEnabled(!!data?.enabled);
      setEmailEnabled(!!data?.email_enabled);
      setSmsEnabled(!!(data as any)?.sms_enabled);
      setEmail(data?.email || user.email || '');
      setPhone((data as any)?.phone || '');
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  const toggle = useCallback(async (next: boolean) => {
    if (!user) return;
    setEnabled(next);
    await supabase
      .from('daily_subscribers')
      .upsert(
        { user_id: user.id, enabled: next, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
  }, [user]);

  const toggleEmail = useCallback(async (next: boolean, addr?: string) => {
    if (!user) return;
    const finalEmail = (addr ?? email ?? user.email ?? '').trim();
    if (next && !finalEmail) return;
    setEmailEnabled(next);
    if (addr !== undefined) setEmail(finalEmail);
    await supabase
      .from('daily_subscribers')
      .upsert(
        {
          user_id: user.id,
          enabled: enabled || next,
          email_enabled: next,
          email: next ? finalEmail : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
    if (next) setEnabled(true);
  }, [user, email, enabled]);

  const toggleSms = useCallback(async (next: boolean, num?: string) => {
    if (!user) return;
    const finalPhone = (num ?? phone ?? '').trim();
    if (next && !finalPhone) return;
    setSmsEnabled(next);
    if (num !== undefined) setPhone(finalPhone);
    await supabase
      .from('daily_subscribers')
      .upsert(
        {
          user_id: user.id,
          enabled: enabled || next,
          sms_enabled: next,
          phone: next ? finalPhone : null,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id' },
      );
    if (next) setEnabled(true);
  }, [user, phone, enabled]);

  return { enabled, emailEnabled, smsEnabled, email, phone, loading, toggle, toggleEmail, toggleSms, setEmail, setPhone };
}
