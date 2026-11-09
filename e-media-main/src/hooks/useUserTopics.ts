import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const AVAILABLE_TOPICS = [
  { id: 'news', label: 'News', emoji: '📰' },
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'lifestyle', label: 'Lifestyle', emoji: '✨' },
  { id: 'investigative', label: 'Investigative', emoji: '🔍' },
  { id: 'community', label: 'Community', emoji: '🤝' },
  { id: 'positive', label: 'Positive News', emoji: '🌟' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'environment', label: 'Environment', emoji: '🌿' },
];

export function useUserTopics() {
  const { user } = useAuth();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setSelectedTopics([]); setLoading(false); return; }

    const fetchTopics = async () => {
      const { data } = await (supabase as any)
        .from('user_topics')
        .select('topic')
        .eq('user_id', user.id);
      setSelectedTopics((data || []).map((d: any) => d.topic));
      setLoading(false);
    };
    fetchTopics();
  }, [user]);

  const toggleTopic = useCallback(async (topic: string) => {
    if (!user) return;
    const isSelected = selectedTopics.includes(topic);

    if (isSelected) {
      setSelectedTopics(prev => prev.filter(t => t !== topic));
      await (supabase as any).from('user_topics').delete().eq('user_id', user.id).eq('topic', topic);
    } else {
      setSelectedTopics(prev => [...prev, topic]);
      await (supabase as any).from('user_topics').insert({ user_id: user.id, topic });
    }
  }, [user, selectedTopics]);

  return { selectedTopics, toggleTopic, loading, AVAILABLE_TOPICS };
}
