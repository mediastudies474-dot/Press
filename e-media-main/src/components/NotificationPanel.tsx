import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { AppNotification } from '@/hooks/useNotifications';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

const timeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const typeColor: Record<AppNotification['type'], string> = {
  breaking: 'bg-primary/20 text-primary',
  live: 'bg-live/20 text-live',
  update: 'bg-blue-500/20 text-blue-400',
  info: 'bg-muted text-muted-foreground',
};

const NotificationPanel = ({ notifications, onMarkAsRead, onMarkAllRead, onClearAll }: NotificationPanelProps) => {
  const handleNotificationClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);
    if (notif.url) {
      const w = window.open(notif.url, '_blank', 'noopener,noreferrer');
      if (!w) window.location.href = notif.url;
    }
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Bell size={20} className="text-primary" /> Notifications
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onMarkAllRead}
            className="text-xs bg-muted px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Check size={12} /> Read all
          </button>
          <button
            onClick={onClearAll}
            className="text-xs bg-muted px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications</p>
          <p className="text-muted-foreground text-sm mt-1">You'll see updates from your media here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`w-full text-left rounded-lg p-3.5 border transition-all active:scale-[0.98] ${
                notif.read
                  ? 'bg-card border-border/30 opacity-60'
                  : 'bg-card border-border/50 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${typeColor[notif.type]}`}>
                      {notif.type}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground">{timeAgo(notif.timestamp)}</span>
                  {notif.url && <ExternalLink size={12} className="text-muted-foreground" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
