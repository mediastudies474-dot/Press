import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

const CHANNEL_IDS: Record<string, string> = {
  etv: 'UClDOmbCeOYJ10g-D0K-aADA',
  cys: 'UCvM8gkE3pSqFi3BbMFmVyXg',
  'tea-podcast': 'UCn6W3OQRL89gYS-oC_cTd0g',
  'pink-table': 'UCyTsHPG8OCEYw7Z9DVHmWRA',
  'cys-podcast': 'UCvM8gkE3pSqFi3BbMFmVyXg',
  'siswati-podcast': 'UCn6W3OQRL89gYS-oC_cTd0g',
  'beyond-books': 'UCahStaFgcIyBgUSffGY12Bg',
  'jtm-podcast': 'UCMEBPHuv0qD9tnc4EyIDd-A',
  'banele-wjlm': 'UCW8ZTA1DEzjWG1iDzC4eSZw',
};

function parseRSS(xml: string, maxResults: number): YouTubeVideo[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const entries = doc.querySelectorAll('entry');
  const videos: YouTubeVideo[] = [];

  for (let i = 0; i < Math.min(entries.length, maxResults); i++) {
    const entry = entries[i];
    const videoId = entry.querySelector('yt\\:videoId, videoId')?.textContent || '';
    const title = entry.querySelector('title')?.textContent || '';
    const published = entry.querySelector('published')?.textContent || '';
    const channelName = entry.querySelector('author > name')?.textContent || '';
    
    if (videoId) {
      videos.push({
        id: videoId,
        title,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        channelTitle: channelName,
        publishedAt: published,
      });
    }
  }
  return videos;
}

export function useYouTubeVideos(channelKey: string) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const channelId = CHANNEL_IDS[channelKey];
    if (!channelId) { setLoading(false); return; }

    const cacheKey = `yt-v2-${channelKey}`;
    const cached = sessionStorage.getItem(cacheKey);
    const cacheTime = sessionStorage.getItem(`${cacheKey}-time`);
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 15 * 60 * 1000) {
      setVideos(JSON.parse(cached));
      setLoading(false);
      return;
    }

    const fetchVideos = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('fetch-rss', {
          body: { channelIds: [channelId] },
        });

        if (fnError || !data?.feeds?.[channelId]) throw new Error('RSS fetch failed');

        const items = parseRSS(data.feeds[channelId], 6);
        setVideos(items);
        sessionStorage.setItem(cacheKey, JSON.stringify(items));
        sessionStorage.setItem(`${cacheKey}-time`, Date.now().toString());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [channelKey]);

  return { videos, loading, error };
}
