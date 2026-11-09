import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CHANNELS = [
  { id: 'UCIaT-n4pOkMY9bpCsZk6YTQ', name: 'Eswatini TV' },
  { id: 'UC9aB1D5UfLzJklMrJQi0KDg', name: 'Channel YemaSwati' },
];

const NEWS_QUERIES = [
  { query: 'Eswatini breaking news today', source: 'Eswatini News' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notifications: { title: string; message: string; type: string; url: string }[] = [];

    // Check for new YouTube videos from channels
    for (const channel of CHANNELS) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&type=video&maxResults=1&order=date&key=${YOUTUBE_API_KEY}`
      );
      if (!res.ok) continue;
      const data = await res.json();
      const video = data.items?.[0];
      if (!video) continue;

      const videoId = video.id.videoId;
      const publishedAt = new Date(video.snippet.publishedAt);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Only notify for videos published in last hour
      if (publishedAt > hourAgo) {
        notifications.push({
          title: `New Video: ${channel.name}`,
          message: video.snippet.title,
          type: 'update',
          url: `https://www.youtube.com/watch?v=${videoId}`,
        });
      }
    }

    // Check for new news
    for (const source of NEWS_QUERIES) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(source.query)}&type=video&maxResults=1&order=date&key=${YOUTUBE_API_KEY}`
      );
      if (!res.ok) continue;
      const data = await res.json();
      const video = data.items?.[0];
      if (!video) continue;

      const publishedAt = new Date(video.snippet.publishedAt);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (publishedAt > hourAgo) {
        notifications.push({
          title: `Breaking: ${source.source}`,
          message: video.snippet.title,
          type: 'breaking',
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        });
      }
    }

    // Insert notifications (broadcast to all users with user_id = null)
    if (notifications.length > 0) {
      // Check for duplicate notifications in last hour
      const { data: existing } = await supabase
        .from('notifications')
        .select('url')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      const existingUrls = new Set((existing || []).map((n: any) => n.url));
      const newNotifs = notifications.filter(n => !existingUrls.has(n.url));

      if (newNotifs.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .insert(newNotifs.map(n => ({ ...n, user_id: null, read: false })));

        if (error) {
          console.error('Insert error:', error);
        }
      }

      return new Response(
        JSON.stringify({ success: true, new: newNotifs.length, skipped: notifications.length - newNotifs.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, new: 0, message: 'No new content found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
