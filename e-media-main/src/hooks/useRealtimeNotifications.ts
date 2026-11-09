import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { AppNotification } from '@/hooks/useNotifications';

// Local persistence keys — survive refresh so global (user_id=null) notifications
// the user has read or cleared don't reappear as unread/undeleted.
const READ_KEY = 'espress-notifs-read';
const CLEARED_KEY = 'espress-notifs-cleared';

const loadSet = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch { return new Set(); }
};
const saveSet = (key: string, set: Set<string>) => {
  try { localStorage.setItem(key, JSON.stringify(Array.from(set).slice(-500))); } catch {}
};

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const readIds = useRef<Set<string>>(loadSet(READ_KEY));
  const clearedIds = useRef<Set<string>>(loadSet(CLEARED_KEY));

  // Fetch existing notifications, applying local read/cleared state
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        const mapped = data
          .filter(n => !clearedIds.current.has(n.id))
          .map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type as AppNotification['type'],
            timestamp: new Date(n.created_at).getTime(),
            read: n.read || readIds.current.has(n.id),
            url: n.url || undefined,
          }))
          .slice(0, 30);
        setNotifications(mapped);
      }
    };

    fetchNotifications();
  }, [user]);

  // Subscribe to realtime inserts
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const n = payload.new as any;
          if (seenIds.current.has(n.id)) return;
          seenIds.current.add(n.id);
          if (clearedIds.current.has(n.id)) return; // user cleared this; skip
          if (n.user_id === user.id || n.user_id === null) {
            const isRead = n.read || readIds.current.has(n.id);
            const notif: AppNotification = {
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type as AppNotification['type'],
              timestamp: new Date(n.created_at).getTime(),
              read: isRead,
              url: n.url || undefined,
            };
            setNotifications(prev => [notif, ...prev].slice(0, 30));

            if (!isRead) {
              toast(notif.title, {
                description: notif.message,
                action: notif.url ? {
                  label: 'Open',
                  onClick: () => window.open(notif.url!, '_blank', 'noopener,noreferrer'),
                } : undefined,
              });

              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  const web = new Notification(notif.title, {
                    body: notif.message,
                    icon: '/icon-192.png',
                    tag: notif.id,
                  });
                  if (notif.url) {
                    web.onclick = () => { window.open(notif.url!, '_blank', 'noopener,noreferrer'); web.close(); };
                  }
                } catch { /* ignore */ }
              }
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    readIds.current.add(id);
    saveSet(READ_KEY, readIds.current);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (user) {
      // Best-effort: only succeeds for user-owned rows (RLS).
      // Global rows (user_id=null) stay marked-read locally — that's fine.
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
  }, [user]);

  const markAllRead = useCallback(async () => {
    notifications.forEach(n => readIds.current.add(n.id));
    saveSet(READ_KEY, readIds.current);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (user) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    }
  }, [user, notifications]);

  const clearAll = useCallback(async () => {
    notifications.forEach(n => clearedIds.current.add(n.id));
    saveSet(CLEARED_KEY, clearedIds.current);
    setNotifications([]);
    if (user) {
      // Deletes only user-owned rows due to RLS. Global rows stay hidden via clearedIds.
      await supabase.from('notifications').delete().eq('user_id', user.id);
    }
  }, [user, notifications]);

  return { notifications, unreadCount, markAsRead, markAllRead, clearAll };
}
