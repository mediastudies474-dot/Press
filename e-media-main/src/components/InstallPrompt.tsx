import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import logoImg from '@/assets/e-media-logo.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'espress-install-dismissed';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari fallback (no beforeinstallprompt support)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = (navigator as any).standalone;
    if (isIOS && !isStandalone) {
      setShow(true);
      setIosHelp(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISS_KEY, '1');
    }
    setShow(false);
    setDeferredPrompt(null);
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mx-3 mt-3 mb-1 rounded-2xl border border-primary/30 bg-card shadow-lg overflow-hidden">
      <div className="p-3 flex items-center gap-3">
        <img src={logoImg} alt="" className="w-12 h-12 rounded-xl object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Install ES-PRESS</p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            {iosHelp
              ? 'Tap Share, then "Add to Home Screen".'
              : 'Add to your home screen for fast access.'}
          </p>
        </div>
        {!iosHelp && (
          <button
            onClick={onInstall}
            className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Download size={14} /> Install
          </button>
        )}
        <button onClick={onDismiss} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
