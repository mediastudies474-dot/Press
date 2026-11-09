import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GlobalStory {
  id: string; title: string; url: string; source: string; sourceId: string;
  image: string | null; summary: string | null; publishedAt: string | null; topics: string[];
}
interface GlobalFeed { articles: GlobalStory[]; fetchedAt: string; stale: boolean }
export function useGlobalNews() {
  return useQuery({
    queryKey: ['global-news'], staleTime: 5 * 60 * 1000, refetchInterval: 5 * 60 * 1000, retry: 1,
    queryFn: async (): Promise<GlobalFeed> => {
      const { data, error } = await supabase.functions.invoke('global-news', { body: {} });
      if (error || data?.error) throw new Error(data?.error ?? 'Global news is temporarily unavailable.');
      return data;
    },
  });
}