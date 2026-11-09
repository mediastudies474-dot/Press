import { useCallback, useEffect, useState } from 'react';

// Wraps the OneSignal Web SDK v16 loaded from index.html.
// Provides a small React-friendly surface for subscribe / unsubscribe.
declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: any[];
  }
}

function getOneSignal(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    if (window.OneSignal) return resolve(window.OneSignal);
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push((OneSignal: any) => resolve(OneSignal));
  });
}

export function useOneSignal() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ok =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(ok);
    if (!ok) return;

    (async () => {
      const OneSignal = await getOneSignal();
      if (cancelled || !OneSignal) return;
      setReady(true);
      try {
        setSubscribed(!!OneSignal.User?.PushSubscription?.optedIn);
        OneSignal.User?.PushSubscription?.addEventListener?.('change', (evt: any) => {
          setSubscribed(!!evt?.current?.optedIn);
        });
      } catch (e) {
        console.warn('OneSignal state read failed', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    const OneSignal = await getOneSignal();
    if (!OneSignal) return false;
    try {
      // Native browser prompt via SDK slidedown/opt-in.
      await OneSignal.Notifications.requestPermission();
      await OneSignal.User.PushSubscription.optIn();
      setSubscribed(!!OneSignal.User.PushSubscription.optedIn);
      return !!OneSignal.User.PushSubscription.optedIn;
    } catch (e) {
      console.error('OneSignal subscribe failed', e);
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    const OneSignal = await getOneSignal();
    if (!OneSignal) return;
    try {
      await OneSignal.User.PushSubscription.optOut();
      setSubscribed(false);
    } catch (e) {
      console.warn('OneSignal unsubscribe failed', e);
    }
  }, []);

  return { supported, ready, subscribed, subscribe, unsubscribe };
}
