import { useState, useEffect, useCallback } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'breaking' | 'live' | 'update' | 'info';
  timestamp: number;
  read: boolean;
  url?: string;
}

const STORAGE_KEY = 'emedia-notifications';

// Simulated real-time notifications based on media activity
const generateNotifications = (): AppNotification[] => {
  const now = Date.now();
  return [
    {
      id: 'n1',
      title: '🔴 EBIS Siswati is Live',
      message: 'EBIS Siswati radio is now streaming live. Tune in!',
      type: 'live',
      timestamp: now - 1000 * 60 * 5,
      read: false,
      url: '#',
    },
    {
      id: 'n2',
      title: '📰 Breaking: Eswatini Observer',
      message: 'New article published on Eswatini Observer.',
      type: 'breaking',
      timestamp: now - 1000 * 60 * 30,
      read: false,
      url: 'https://eswatiniobserver.com/',
    },
    {
      id: 'n3',
      title: '🎬 New Video: Eswatini TV',
      message: 'Eswatini TV uploaded a new video on YouTube.',
      type: 'update',
      timestamp: now - 1000 * 60 * 60,
      read: false,
      url: 'https://www.youtube.com/@EswatiniTV',
    },
    {
      id: 'n4',
      title: '📻 UNESWA FM 88.2 Live',
      message: 'UNESWA FM is now broadcasting live.',
      type: 'live',
      timestamp: now - 1000 * 60 * 90,
      read: false,
    },
  ];
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return generateNotifications();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Simulate new notification every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const types: AppNotification['type'][] = ['breaking', 'live', 'update', 'info'];
      const messages = [
        { title: '📰 Times of Eswatini Update', message: 'New story from Times of Eswatini.', type: 'breaking' as const, url: 'https://www.times.co.sz/' },
        { title: '🔴 VOC FM Live', message: 'Voice of the Church FM is streaming.', type: 'live' as const },
        { title: '🎬 Channel YemaSwati', message: 'New upload on Channel YemaSwati.', type: 'update' as const, url: 'https://www.youtube.com/@channelyemaswati' },
        { title: '📻 EBIS English Live', message: 'EBIS English radio is now live.', type: 'live' as const },
      ];
      const random = messages[Math.floor(Math.random() * messages.length)];
      const newNotif: AppNotification = {
        id: `n-${Date.now()}`,
        ...random,
        timestamp: Date.now(),
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 20));
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, unreadCount, markAsRead, markAllRead, clearAll };
}
