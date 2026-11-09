import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NewsSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  url: string;
  source_id: string;
}

export function useLatestNews() {
  const [slides, setSlides] = useState<NewsSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem('latest-news-v5');
    const cacheTime = sessionStorage.getItem('latest-news-v5-time');

    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 10 * 60 * 1000) {
      setSlides(JSON.parse(cached));
      setLoading(false);
      return;
    }

    const fetchLatest = async () => {
      try {
        // Background ingest (server upserts)
        supabase.functions.invoke('fetch-rss', { body: { action: 'ingest' } }).catch(() => {});

        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await (supabase as any)
          .from('articles')
          .select('id, source_id, source_name, title, image_url, url, published_at')
          .not('image_url', 'is', null)
          .gte('published_at', since)
          .order('published_at', { ascending: false })
          .limit(80);

        if (error) throw error;

        // Round-robin across distinct sources so the slideshow shows every reachable
        // outlet, not just whichever published most recently. Each outlet uses its OWN
        // images — never any other source's image.
        const bySource = new Map<string, any[]>();
        for (const r of data || []) {
          if (!r.image_url) continue;
          const key = r.source_id || r.source_name || 'unknown';
          if (!bySource.has(key)) bySource.set(key, []);
          bySource.get(key)!.push(r);
        }
        const rotated: any[] = [];
        let added = true;
        let idx = 0;
        while (added && rotated.length < 12) {
          added = false;
          for (const [, list] of bySource) {
            if (list[idx]) {
              rotated.push(list[idx]);
              added = true;
              if (rotated.length >= 12) break;
            }
          }
          idx++;
        }

        const next: NewsSlide[] = rotated.map((r, i) => ({
          id: `${r.source_id}-${i}`,
          title: (r.source_name || 'NEWS').toUpperCase(),
          subtitle: r.title,
          image: r.image_url,
          url: r.url,
          source_id: r.source_id,
        }));

        if (next.length > 0) {
          setSlides(next);
          sessionStorage.setItem('latest-news-v5', JSON.stringify(next));
          sessionStorage.setItem('latest-news-v5-time', Date.now().toString());
        }
      } catch (e) {
        console.error('Failed to fetch latest news:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return { slides, loading };
}
