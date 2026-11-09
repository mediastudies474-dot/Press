import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mediaData } from '@/data/media';

export function usePersonalizedFeed() {
  const { user } = useAuth();
  const [recommendedMediaIds, setRecommendedMediaIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPersonalized = async () => {
      const { data: topics } = await (supabase as any)
        .from('user_topics')
        .select('topic')
        .eq('user_id', user.id);

      const userTopics = (topics || []).map((t: any) => t.topic);
      if (userTopics.length === 0) return;

      const { data: mediaTopics } = await (supabase as any)
        .from('media_topics')
        .select('media_id')
        .in('topic', userTopics);

      const ids = [...new Set((mediaTopics || []).map((m: any) => m.media_id))] as string[];

      const { data: interactions } = await (supabase as any)
        .from('user_interactions')
        .select('media_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const interactionCounts: Record<string, number> = {};
      (interactions || []).forEach((i: any) => {
        interactionCounts[i.media_id] = (interactionCounts[i.media_id] || 0) + 1;
      });

      const scored = ids.map(id => ({
        id,
        score: (interactionCounts[id] || 0) + 1,
      }));
      scored.sort((a, b) => b.score - a.score);

      setRecommendedMediaIds(scored.map(s => s.id));
    };

    fetchPersonalized();
  }, [user]);

  const recommendedMedia = mediaData.filter(m => recommendedMediaIds.includes(m.id));

  return { recommendedMedia, hasPersonalization: recommendedMediaIds.length > 0 };
}
