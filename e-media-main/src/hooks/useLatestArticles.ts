import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Article } from '@/components/NewspaperArticles';

export function useLatestArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem('latest-articles-v3');
    const cacheTime = sessionStorage.getItem('latest-articles-v3-time');

    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 10 * 60 * 1000) {
      setArticles(JSON.parse(cached));
      setLoading(false);
      return;
    }

    const fetchArticles = async () => {
      try {
        // Background-trigger an ingestion run (idempotent / upserts).
        supabase.functions.invoke('fetch-rss', { body: { action: 'ingest' } }).catch(() => {});

        const { data, error } = await (supabase as any)
          .from('articles')
          .select('id, external_id, source_id, source_name, category, title, image_url, url, published_at')
          .not('image_url', 'is', null)
          .order('published_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        const merged: Article[] = (data || []).map((r: any) => ({
          id: `${r.source_id}-${r.external_id}`,
          title: r.title,
          image: r.image_url,
          source: r.source_name,
          category: r.category,
          url: r.url,
          date: r.published_at
            ? new Date(r.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '',
        }));

        if (merged.length > 0) {
          setArticles(merged);
          sessionStorage.setItem('latest-articles-v3', JSON.stringify(merged));
          sessionStorage.setItem('latest-articles-v3-time', Date.now().toString());
        }
      } catch (e) {
        console.error('Failed to fetch latest articles:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return { articles, loading };
}
