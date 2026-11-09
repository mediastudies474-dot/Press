import { Search, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/e-media-logo.png';

interface AppHeaderProps {
  onSearchToggle: () => void;
  onSettingsOpen?: () => void;
  onAvatarClick?: () => void;
}

const AppHeader = ({ onSearchToggle, onSettingsOpen, onAvatarClick }: AppHeaderProps) => {
  const { user, profile } = useAuth();
  const initial = (profile?.display_name || user?.email || '?').charAt(0).toUpperCase();

  return (
    <header className="bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-border">
      <div className="flex items-center gap-3">
        <img src={logoImg} alt="ES-PRESS" className="w-9 h-9 rounded-lg object-cover" />
        <h1 className="text-foreground text-xl font-extrabold tracking-normal">
          ES<span className="text-primary">-</span>PRESS
        </h1>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onSearchToggle} className="text-foreground p-2 rounded-full hover:bg-muted transition-colors" aria-label="Search">
          <Search size={22} />
        </Button>
        {onSettingsOpen && (
          <Button variant="ghost" size="icon" onClick={onSettingsOpen} className="text-foreground p-2 rounded-full hover:bg-muted transition-colors" aria-label="Settings">
            <Settings size={20} />
          </Button>
        )}
        {user && (
          <Button variant="ghost" size="icon"
            onClick={onAvatarClick}
            className="ml-1 w-9 h-9 rounded-full overflow-hidden border-2 border-primary/40 bg-muted flex items-center justify-center hover:border-primary transition-colors"
            aria-label="Profile"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-foreground">{initial}</span>
            )}
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
