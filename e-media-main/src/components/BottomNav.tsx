import { Home, Star, Bell, Menu, ShieldCheck, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/LanguageContext';
import type { TKey } from '@/i18n/translations';

type Tab = 'home' | 'favorites' | 'factcheck' | 'games' | 'notifications' | 'more';

interface BottomNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
  notificationCount?: number;
}

const tabs: { id: Tab; labelKey?: TKey; label?: string; icon: React.ReactNode }[] = [
  { id: 'home', labelKey: 'nav.home', icon: <Home size={18} strokeWidth={2.2} /> },
  { id: 'favorites', labelKey: 'nav.saved', icon: <Star size={18} strokeWidth={2.2} /> },
  { id: 'factcheck', labelKey: 'nav.verify', icon: <ShieldCheck size={18} strokeWidth={2.2} /> },
  { id: 'games', labelKey: 'nav.games', icon: <Gamepad2 size={18} strokeWidth={2.2} /> },
  { id: 'notifications', labelKey: 'nav.alerts', icon: <Bell size={18} strokeWidth={2.2} /> },
  { id: 'more', labelKey: 'nav.more', icon: <Menu size={18} strokeWidth={2.2} /> },
];

const BottomNav = ({ active, onTabChange, notificationCount = 0 }: BottomNavProps) => {
  const { t } = useT();
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50">
      <div className="glass border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-6 py-1">
          {tabs.map(tab => (
            <Button variant="ghost"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative h-16 min-w-0 flex flex-col items-center gap-1 px-0 py-2 rounded-none transition-colors ${
                active === tab.id
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground/75 hover:text-foreground'
              }`}
            >
              <div className={`relative transition-transform duration-300 ${active === tab.id ? 'scale-110' : ''}`}>
                {tab.icon}
                {tab.id === 'notifications' && notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-semibold">{tab.labelKey ? t(tab.labelKey) : tab.label}</span>
              {active === tab.id && (
                <span className="absolute -bottom-0.5 w-5 h-0.5 rounded-full bg-primary" />
              )}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
