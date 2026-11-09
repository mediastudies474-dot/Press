import { useState, useEffect } from 'react';
import { Moon, Sun, Wifi, User, Shield, LogOut, Type, Bell, BellOff, PlayCircle, Info, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyDigest } from '@/hooks/useDailyDigest';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { useOneSignal } from '@/hooks/useOneSignal';
import ProfilePage from '@/pages/ProfilePage';
import LegalPage from '@/pages/LegalPage';
import AboutPage from '@/pages/AboutPage';
import logoImg from '@/assets/e-media-logo.png';
import { toast } from 'sonner';
import type { FontSize } from '@/hooks/useSettings';

interface SettingsPanelProps {
  darkMode: boolean;
  dataSaver: boolean;
  fontSize: FontSize;
  autoplay: boolean;
  pushEnabled: boolean;
  onDarkToggle: (v: boolean) => void;
  onDataSaverToggle: (v: boolean) => void;
  onFontSizeChange: (v: FontSize) => void;
  onAutoplayToggle: (v: boolean) => void;
  onPushToggle: (v: boolean) => void;
}

type SubPage = 'none' | 'profile' | 'legal' | 'about';

const FONT_OPTIONS: { id: FontSize; label: string; sample: string }[] = [
  { id: 'sm', label: 'Small', sample: 'A' },
  { id: 'md', label: 'Default', sample: 'A' },
  { id: 'lg', label: 'Large', sample: 'A' },
  { id: 'xl', label: 'Extra Large', sample: 'A' },
];

const Toggle = ({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    onClick={() => !disabled && onChange(!on)}
    disabled={disabled}
    className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 disabled:opacity-50 ${on ? 'bg-primary' : 'bg-muted'}`}
  >
    <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SettingsPanel = ({
  darkMode, dataSaver, fontSize, autoplay, pushEnabled,
  onDarkToggle, onDataSaverToggle, onFontSizeChange, onAutoplayToggle, onPushToggle,
}: SettingsPanelProps) => {
  const { signOut } = useAuth();
  const digest = useDailyDigest();
  const push = usePushSubscription();
  const oneSignal = useOneSignal();
  const [subPage, setSubPage] = useState<SubPage>('none');
  const [emailDraft, setEmailDraft] = useState(digest.email);
  const [phoneDraft, setPhoneDraft] = useState(digest.phone);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => { setEmailDraft(digest.email); }, [digest.email]);
  useEffect(() => { setPhoneDraft(digest.phone); }, [digest.phone]);

  if (subPage === 'profile') return <ProfilePage onBack={() => setSubPage('none')} />;
  if (subPage === 'legal') return <LegalPage onBack={() => setSubPage('none')} />;
  if (subPage === 'about') return <AboutPage onBack={() => setSubPage('none')} />;

  const handlePushToggle = async (next: boolean) => {
    onPushToggle(next);
    if (next) {
      const ok = await push.subscribe();
      if (!ok) toast.error('Could not enable browser push. Check site permissions.');
      else toast.success('Branded push notifications are on.');
    } else {
      await push.unsubscribe();
      toast.message('Push notifications turned off.');
    }
  };

  const handleUnsubscribePush = async () => {
    await push.unsubscribe();
    onPushToggle(false);
    toast.success('You have been unsubscribed from push notifications.');
  };

  const handleEmailToggle = async (next: boolean) => {
    if (next) {
      const addr = (emailDraft || digest.email).trim();
      if (!addr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
        toast.error('Enter a valid email address first.');
        return;
      }
      setSavingEmail(true);
      await digest.toggleEmail(true, addr);
      setSavingEmail(false);
      toast.success('Email digest active. First edition lands at 6 AM.');
    } else {
      await digest.toggleEmail(false);
      toast.message('Email digest turned off.');
    }
  };

  const saveEmail = async () => {
    if (!digest.emailEnabled) return;
    setSavingEmail(true);
    await digest.toggleEmail(true, emailDraft);
    setSavingEmail(false);
    toast.success('Email address updated.');
  };

  const handleSmsToggle = async (next: boolean) => {
    if (next) {
      const num = (phoneDraft || digest.phone).trim();
      if (!num || num.replace(/\D/g, '').length < 7) {
        toast.error('Enter a valid mobile number first (e.g. +268…).');
        return;
      }
      setSavingPhone(true);
      await digest.toggleSms(true, num);
      setSavingPhone(false);
      toast.success('SMS headlines active. Daily at 6 AM.');
    } else {
      await digest.toggleSms(false);
      toast.message('SMS headlines turned off.');
    }
  };

  const savePhone = async () => {
    if (!digest.smsEnabled) return;
    setSavingPhone(true);
    await digest.toggleSms(true, phoneDraft);
    setSavingPhone(false);
    toast.success('Mobile number updated.');
  };

  return (
    <div className="px-4 pt-4 pb-24 space-y-3">
      <h2 className="text-lg font-bold text-foreground mb-4">Settings</h2>

      <button
        onClick={() => setSubPage('profile')}
        className="w-full bg-card rounded-lg p-4 flex items-center gap-3 shadow-sm text-left hover:bg-muted/50 transition-colors"
      >
        <User size={20} className="text-primary" />
        <div className="flex-1">
          <span className="font-medium text-card-foreground">My Profile</span>
          <p className="text-xs text-muted-foreground">Edit display name & avatar</p>
        </div>
      </button>

      <div className="bg-card rounded-lg p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <Type size={20} className="text-primary" />
          <div className="flex-1">
            <span className="font-medium text-card-foreground">Text Size</span>
            <p className="text-xs text-muted-foreground">Increase readability</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {FONT_OPTIONS.map(o => (
            <button
              key={o.id}
              onClick={() => onFontSizeChange(o.id)}
              className={`py-2 rounded-lg border text-center transition-all ${
                fontSize === o.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40'
              }`}
            >
              <div className={`font-bold ${o.id === 'sm' ? 'text-xs' : o.id === 'md' ? 'text-sm' : o.id === 'lg' ? 'text-base' : 'text-lg'}`}>
                {o.sample}
              </div>
              <div className="text-[10px] mt-0.5">{o.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {darkMode ? <Moon size={20} className="text-secondary" /> : <Sun size={20} className="text-secondary" />}
          <span className="font-medium text-card-foreground">Dark Theme</span>
        </div>
        <Toggle on={darkMode} onChange={onDarkToggle} />
      </div>

      <div className="bg-card rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Wifi size={20} className="text-primary" />
          <div>
            <span className="font-medium text-card-foreground">Data Saver</span>
            <p className="text-xs text-muted-foreground">Reduce data usage on streams</p>
          </div>
        </div>
        <Toggle on={dataSaver} onChange={onDataSaverToggle} />
      </div>

      <div className="bg-card rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <PlayCircle size={20} className="text-primary" />
          <div>
            <span className="font-medium text-card-foreground">Autoplay Videos</span>
            <p className="text-xs text-muted-foreground">Start playback automatically</p>
          </div>
        </div>
        <Toggle on={autoplay} onChange={onAutoplayToggle} />
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-primary" />
            <div>
              <span className="font-medium text-card-foreground">Branded Push Notifications</span>
              <p className="text-xs text-muted-foreground">Breaking news even when the app is closed</p>
            </div>
          </div>
          <Toggle on={pushEnabled && push.subscribed} onChange={handlePushToggle} disabled={!push.supported} />
        </div>
        {!push.supported && (
          <p className="text-[11px] text-muted-foreground mt-2">Browser push isn't supported on this device.</p>
        )}
        {push.subscribed && (
          <button
            onClick={handleUnsubscribePush}
            className="mt-3 w-full py-2 rounded-lg border border-destructive/40 text-destructive text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-destructive/10"
          >
            <BellOff size={14} /> Unsubscribe from all push notifications
          </button>
        )}
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-primary" />
            <div>
              <span className="font-medium text-card-foreground">OneSignal Push</span>
              <p className="text-xs text-muted-foreground">Enable OneSignal breaking-news alerts</p>
            </div>
          </div>
          <Toggle
            on={oneSignal.subscribed}
            onChange={async (next) => {
              if (next) {
                const ok = await oneSignal.subscribe();
                if (ok) toast.success('OneSignal notifications on.');
                else toast.error('Could not enable OneSignal push. Check permissions.');
              } else {
                await oneSignal.unsubscribe();
                toast.message('OneSignal notifications off.');
              }
            }}
            disabled={!oneSignal.supported}
          />
        </div>
        {!oneSignal.supported && (
          <p className="text-[11px] text-muted-foreground mt-2">OneSignal push isn't supported on this device.</p>
        )}
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <MessageSquare size={20} className="text-primary" />
            <div>
              <span className="font-medium text-card-foreground">SMS Headlines</span>
              <p className="text-xs text-muted-foreground">Top 3 stories texted daily at 6 AM</p>
            </div>
          </div>
          <Toggle on={digest.smsEnabled} onChange={handleSmsToggle} />
        </div>
        <div className="flex gap-2">
          <input
            type="tel"
            value={phoneDraft}
            onChange={(e) => setPhoneDraft(e.target.value)}
            placeholder="+268 7612 3456"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={savePhone}
            disabled={!digest.smsEnabled || savingPhone || !phoneDraft}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
          >
            Save
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Include country code. Eswatini numbers can be entered as 8 digits — we'll add +268 automatically.
        </p>
      </div>


      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-primary" />
            <div>
              <span className="font-medium text-card-foreground">Daily Email Digest</span>
              <p className="text-xs text-muted-foreground">Top stories delivered at 6 AM</p>
            </div>
          </div>
          <Toggle on={digest.emailEnabled} onChange={handleEmailToggle} />
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={saveEmail}
            disabled={!digest.emailEnabled || savingEmail || !emailDraft}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
          >
            Save
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Enable to receive a branded ES-PRESS digest every morning, even if you don't open the app.
        </p>
      </div>

      <div className="bg-card rounded-lg p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-primary" />
          <div>
            <span className="font-medium text-card-foreground">In-App Notifications</span>
            <p className="text-xs text-muted-foreground">Show new-story toasts while using the app</p>
          </div>
        </div>
        <Toggle on={pushEnabled} onChange={onPushToggle} />
      </div>

      <button
        onClick={() => setSubPage('about')}
        className="w-full bg-card rounded-lg p-4 flex items-center gap-3 shadow-sm text-left hover:bg-muted/50 transition-colors"
      >
        <Info size={20} className="text-primary" />
        <div className="flex-1">
          <span className="font-medium text-card-foreground">About ES-PRESS</span>
          <p className="text-xs text-muted-foreground">Our story, version & disclaimer</p>
        </div>
      </button>

      <button
        onClick={() => setSubPage('legal')}
        className="w-full bg-card rounded-lg p-4 flex items-center gap-3 shadow-sm text-left hover:bg-muted/50 transition-colors"
      >
        <Shield size={20} className="text-primary" />
        <div className="flex-1">
          <span className="font-medium text-card-foreground">Privacy, Terms & Disclaimer</span>
          <p className="text-xs text-muted-foreground">Legal & content disclaimer</p>
        </div>
      </button>

      <button
        onClick={signOut}
        className="w-full bg-card rounded-lg p-4 flex items-center gap-3 shadow-sm text-left hover:bg-destructive/10 transition-colors"
      >
        <LogOut size={20} className="text-destructive" />
        <span className="font-medium text-destructive">Sign Out</span>
      </button>

      <div className="mt-8 text-center">
        <img src={logoImg} alt="ES-PRESS" className="w-10 h-10 rounded-lg mx-auto mb-2 opacity-60" />
        <p className="text-[11px] font-semibold text-foreground">ES-PRESS — Eswatini Media Hub</p>
        <p className="text-[10px] text-muted-foreground mt-1">© {new Date().getFullYear()} Imvelo Tech Group. All rights reserved.</p>
      </div>
    </div>
  );
};

export default SettingsPanel;
