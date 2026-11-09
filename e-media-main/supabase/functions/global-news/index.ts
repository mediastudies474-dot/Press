import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { cacheIsFresh, safeUrl } from './policy.ts';

Deno.serve(async (req) => {
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return reply({ error: 'Sign in to read global news.' }, 401);
  const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  // Allow the hourly scheduler in with its private token; everyone else needs a user session.
  const { data: cronRow } = await db.from('cron_config').select('value').eq('key', 'global_news_token').maybeSingle();
  const isCron = !!cronRow && token === cronRow.value;
  if (!isCron) {
    const auth = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
    const { data: user, error: authError } = await auth.auth.getUser(token);
    if (authError || !user.user) return reply({ error: 'Please sign in again.' }, 401);
  }
  const id = 'global-english';
  let cached: { payload: Record<string, unknown>; fetched_at: string | null } | null = null;
  try {
    const { data } = await db.from('global_news_cache').select('payload,fetched_at').eq('id', id).maybeSingle();
    cached = data;
    if (cached && cacheIsFresh(cached.fetched_at, Date.now())) return reply(cached.payload);
    const { error: initError } = await db.from('global_news_cache').upsert({ id }, { onConflict: 'id', ignoreDuplicates: true });
    if (initError) throw new Error('Cache unavailable');
    const now = new Date().toISOString();
    const { data: lease, error: leaseError } = await db.from('global_news_cache').update({ lease_until: new Date(Date.now() + 60000).toISOString() }).eq('id', id).lt('lease_until', now).select('id');
    if (leaseError) throw new Error('Cache unavailable');
    if (!lease?.length) return cached?.fetched_at ? reply({ ...cached.payload, stale: true }) : reply({ error: 'News is updating. Please try again shortly.' }, 503);
    const key = Deno.env.get('NEWSDATA_API_KEY');
    if (!key) throw new Error('News service not configured');
    const url = new URL('https://newsdata.io/api/1/latest');
    url.searchParams.set('apikey', key);
    url.searchParams.set('language', 'en');
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const upstream = await res.json();
    if (!res.ok || upstream.status !== 'success') throw new Error('News provider unavailable');
    const articles = (Array.isArray(upstream.results) ? upstream.results : []).flatMap((r: Record<string, unknown>) => {
      const link = safeUrl(r.link);
      if (!link || typeof r.title !== 'string') return [];
      const rawDate = typeof r.pubDate === 'string' ? r.pubDate.replace(' ', 'T') + 'Z' : '';
      return [{ id: String(r.article_id ?? link), title: r.title, url: link, source: String(r.source_name ?? r.source_id ?? 'Publisher'), sourceId: String(r.source_id ?? 'global'), image: safeUrl(r.image_url), summary: typeof r.description === 'string' ? r.description : null, publishedAt: Number.isNaN(Date.parse(rawDate)) ? null : new Date(rawDate).toISOString(), topics: Array.isArray(r.category) ? r.category.filter((x) => typeof x === 'string') : [] }];
    });
    const fetchedAt = new Date().toISOString();
    const payload = { articles, fetchedAt, stale: false };
    const { error: saveError } = await db.from('global_news_cache').update({ payload, fetched_at: fetchedAt, lease_until: fetchedAt }).eq('id', id);
    if (saveError) throw new Error('Cache unavailable');
    if (articles.length) {
      await db.from('articles').upsert(articles.map((a) => ({ external_id: a.id, source_id: `global-${a.sourceId}`, source_name: a.source, title: a.title, summary: a.summary, url: a.url, image_url: a.image, published_at: a.publishedAt, category: 'global', content_type: 'article' })), { onConflict: 'source_id,external_id', ignoreDuplicates: true });
    }
    return reply(payload);
  } catch {
    return cached?.fetched_at ? reply({ ...cached.payload, stale: true }) : reply({ error: 'Global news is temporarily unavailable. Please try again shortly.' }, 503);
  }
});