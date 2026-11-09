import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Public VAPID key (safe to expose in client code — only the private key is secret).
const VAPID_PUBLIC_KEY =
  'BL73nC7sMQg4xEnW8QNG9cMNhVjQ-j4dJ5kTO7JJMkZVcu-WI70EriuT2tuITebzev1D0ceA0EBOYgioke-W80w';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

function bufToBase64Url(buf: ArrayBuffer | null): string {
  if (!buf) return '';
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function usePushSubscription() {
  const { user } = useAuth();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const ok = typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(ok);
    if (!ok) return;

    navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('SW register failed', e));
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    }).catch(() => {});
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const keyBytes = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        const ab = new ArrayBuffer(keyBytes.byteLength);
        new Uint8Array(ab).set(keyBytes);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: ab,
        });
      }

      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      const endpoint = json.endpoint || sub.endpoint;
      const p256dh = json.keys?.p256dh || bufToBase64Url(sub.getKey('p256dh'));
      const auth = json.keys?.auth || bufToBase64Url(sub.getKey('auth'));

      if (user && endpoint && p256dh && auth) {
        await supabase.from('push_subscriptions').upsert(
          {
            user_id: user.id,
            endpoint,
            p256dh,
            auth,
            user_agent: navigator.userAgent.slice(0, 200),
            enabled: true,
          },
          { onConflict: 'endpoint' }
        );
      }
      setSubscribed(true);
      return true;
    } catch (e) {
      console.error('push subscribe failed', e);
      return false;
    }
  }, [supported, user]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        if (user) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
        }
      }
      setSubscribed(false);
    } catch (e) {
      console.warn('push unsubscribe failed', e);
    }
  }, [supported, user]);

  return { supported, subscribed, subscribe, unsubscribe };
}
