import { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { useOneSignal } from '@/hooks/useOneSignal';

const STORAGE_KEY = 'emedia-notif-prompt-dismissed';
const PRIVACY_KEY = 'emedia-privacy-accepted-v1';

const NotificationPermissionPrompt = () => {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const { supported, subscribed, subscribe } = usePushSubscription();
  const oneSignal = useOneSignal();

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
    if (localStorage.getItem(PRIVACY_KEY) !== '1') return;
    if (subscribed || oneSignal.subscribed) return;
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, [subscribed, oneSignal.subscribed]);

  const enable = async () => {
    setBusy(true);
    try {
      // Subscribe via OneSignal (primary) and native VAPID fallback for existing pipeline.
      const os = await oneSignal.subscribe();
      const ok = await subscribe();
      if (os || ok) {
        try {
          new Notification('ES-PRESS notifications on', {
            body: "You'll get alerts the moment new stories drop.",
            icon: '/icons/icon-192.png',
          });
        } catch {}
      }
    } finally {
      setBusy(false);
      setShow(false);
      localStorage.setItem(STORAGE_KEY, '1');
    }
  };

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card text-card-foreground w-full max-w-sm rounded-2xl border border-border shadow-2xl p-6 relative">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4 mx-auto">
          <Bell className="text-primary" size={26} />
        </div>

        <h3 className="text-lg font-bold text-center mb-1">Stay in the loop</h3>
        <p className="text-sm text-muted-foreground text-center mb-5">
          Get branded ES-PRESS alerts the moment new articles, podcasts or breaking news drop — even when the app is closed.
        </p>

        <ul className="text-xs text-muted-foreground space-y-1.5 mb-5">
          <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Breaking news alerts</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Delivered even when the app is closed</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Unsubscribe anytime in Settings</li>
        </ul>

        <button
          onClick={enable}
          disabled={!supported || busy}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm active:scale-[0.98] disabled:opacity-50"
        >
          {!supported ? 'Not supported in this browser' : busy ? 'Subscribing…' : 'Subscribe to notifications'}
        </button>
        <button
          onClick={dismiss}
          className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default NotificationPermissionPrompt;
