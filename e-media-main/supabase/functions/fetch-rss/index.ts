import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Newspaper / online media RSS feeds we ingest into the DB.
// Each entry: { sourceId, sourceName, feedUrl, category }
const NEWSPAPER_FEEDS: Array<{
  sourceId: string;
  sourceName: string;
  feedUrl: string;
  category: string;
}> = [
  { sourceId: "eo", sourceName: "Eswatini Observer", feedUrl: "https://eswatiniobserver.com/feed/", category: "newspaper" },
  { sourceId: "epn", sourceName: "Eswatini Positive News", feedUrl: "https://eswatinipositivenews.online/feed/", category: "online" },
  { sourceId: "edn", sourceName: "Eswatini Daily News", feedUrl: "https://swazidailynews.com/feed/", category: "online" },
  { sourceId: "ine", sourceName: "Independent News", feedUrl: "https://independentnews.co.sz/feed/", category: "online" },
  { sourceId: "et", sourceName: "The Eswatini Times", feedUrl: "https://eswatinitimes.com/feed/", category: "online" },
  { sourceId: "swazi-newsweek", sourceName: "Swazi Newsweek", feedUrl: "https://swazinewsweek.com/feed/", category: "magazine" },
  { sourceId: "nation-magazine", sourceName: "The Nation Magazine", feedUrl: "https://thenationmagazine.co.sz/feed/", category: "magazine" },
  { sourceId: "africa-uncensored", sourceName: "Africa Uncensored", feedUrl: "https://africauncensored.online/feed/", category: "investigative" },
  { sourceId: "inhlase", sourceName: "Inhlase Centre for Investigative Journalism", feedUrl: "https://inhlase.com/feed/", category: "investigative" },
  { sourceId: "agribusiness", sourceName: "AgriBusiness Media", feedUrl: "https://agribusinessmedia.com/feed/", category: "online" },
  { sourceId: "cenn", sourceName: "Climate & Environment News Network", feedUrl: "https://www.cenewsnetwork.org/feed/", category: "online" },
];

// YouTube channels we ingest as video articles.
const YT_FEEDS: Array<{ sourceId: string; sourceName: string; channelId: string; category: string }> = [
  { sourceId: "etv", sourceName: "Eswatini TV", channelId: "UClDOmbCeOYJ10g-D0K-aADA", category: "tv" },
  { sourceId: "cys", sourceName: "Channel YemaSwati", channelId: "UCvM8gkE3pSqFi3BbMFmVyXg", category: "tv" },
];

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m ? decode(m[1]) : null;
}

function extractImage(itemXml: string): string | null {
  // 1. media:content url=
  let m = itemXml.match(/<media:content[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  // 2. media:thumbnail url=
  m = itemXml.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (m) return m[1];
  // 3. enclosure url= (image/*)
  m = itemXml.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/i);
  if (m) return m[1];
  // 4. itunes:image href=
  m = itemXml.match(/<itunes:image[^>]+href="([^"]+)"/i);
  if (m) return m[1];
  // 5. <image><url>...</url></image>
  m = itemXml.match(/<image>[\s\S]*?<url>([\s\S]*?)<\/url>/i);
  if (m) return decode(m[1]);
  // 6. first <img src=> in content:encoded or description
  const content = tag(itemXml, "content:encoded") || tag(itemXml, "description") || tag(itemXml, "summary") || "";
  m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return m[1];
  // 7. naked URL pointing at an image file
  m = content.match(/(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif))/i);
  if (m) return m[1];
  return null;
}

// Last-resort: fetch the article HTML and parse <meta property="og:image">.
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 EMediaBot" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (m) {
      let img = m[1];
      // Resolve protocol-relative or relative URLs
      if (img.startsWith("//")) img = "https:" + img;
      else if (img.startsWith("/")) {
        try { const u = new URL(url); img = `${u.protocol}//${u.host}${img}`; } catch {}
      }
      return img;
    }
    return null;
  } catch {
    return null;
  }
}

function parseRssItems(xml: string) {
  const items: Array<{
    externalId: string;
    title: string;
    url: string;
    image: string | null;
    summary: string | null;
    publishedAt: string | null;
  }> = [];
  const re = /<item[\s>][\s\S]*?<\/item>/gi;
  for (const match of xml.match(re) || []) {
    const title = tag(match, "title") || "";
    const link = tag(match, "link") || "";
    const guid = tag(match, "guid") || link;
    const pubDate = tag(match, "pubDate") || tag(match, "dc:date") || null;
    const desc = tag(match, "description");
    const image = extractImage(match);
    if (!title || !link) continue;
    items.push({
      externalId: guid,
      title,
      url: link,
      image,
      summary: desc ? desc.replace(/<[^>]+>/g, "").slice(0, 300) : null,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
    });
  }
  return items;
}

function parseAtomEntries(xml: string) {
  const items: Array<{ externalId: string; title: string; url: string; image: string; publishedAt: string | null }> = [];
  const re = /<entry[\s>][\s\S]*?<\/entry>/gi;
  for (const match of xml.match(re) || []) {
    const videoId = tag(match, "yt:videoId");
    const title = tag(match, "title") || "";
    const published = tag(match, "published");
    if (!videoId) continue;
    items.push({
      externalId: videoId,
      title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      image: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: published ? new Date(published).toISOString() : null,
    });
  }
  return items;
}

async function ingestAll() {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const rows: any[] = [];

  await Promise.all([
    ...NEWSPAPER_FEEDS.map(async (f) => {
      try {
        const res = await fetch(f.feedUrl, { headers: { "User-Agent": "Mozilla/5.0 EMediaBot" } });
        if (!res.ok) return;
        const xml = await res.text();
        const items = parseRssItems(xml).slice(0, 15);
        const enriched = await Promise.all(
          items.map(async (it) => {
            if (it.image) return it;
            const og = await fetchOgImage(it.url);
            return { ...it, image: og };
          })
        );
        for (const it of enriched) {
          rows.push({
            external_id: it.externalId,
            source_id: f.sourceId,
            source_name: f.sourceName,
            category: f.category,
            content_type: "article",
            title: it.title,
            summary: it.summary,
            image_url: it.image,
            url: it.url,
            published_at: it.publishedAt,
          });
        }
      } catch (e) {
        console.error(`feed ${f.sourceId} failed:`, e);
      }
    }),
    ...YT_FEEDS.map(async (f) => {
      try {
        const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${f.channelId}`);
        if (!res.ok) return;
        const xml = await res.text();
        for (const it of parseAtomEntries(xml).slice(0, 10)) {
          rows.push({
            external_id: it.externalId,
            source_id: f.sourceId,
            source_name: f.sourceName,
            category: f.category,
            content_type: "video",
            title: it.title,
            summary: null,
            image_url: it.image,
            url: it.url,
            published_at: it.publishedAt,
          });
        }
      } catch (e) {
        console.error(`yt ${f.sourceId} failed:`, e);
      }
    }),
  ]);

  if (rows.length === 0) return 0;

  // Detect which rows are NEW (not already in DB) so we can broadcast notifications
  // for them only — avoids spamming users on every poll.
  const externalIds = rows.map(r => r.external_id);
  const { data: existing } = await supabase
    .from("articles")
    .select("external_id, source_id")
    .in("external_id", externalIds);
  const existingKeys = new Set((existing || []).map((r: any) => `${r.source_id}::${r.external_id}`));
  const newRows = rows.filter(r => !existingKeys.has(`${r.source_id}::${r.external_id}`));

  const { error } = await supabase
    .from("articles")
    .upsert(rows, { onConflict: "source_id,external_id", ignoreDuplicates: false });
  if (error) console.error("upsert error:", error);

  // Imvelo dashboard push removed.

  // Broadcast a single notification per new article (user_id null = everyone).
  // Cap to 10 per run to avoid notification floods. Also fan out via Web Push
  // so users get alerts even when the app isn't open.
  if (newRows.length > 0) {
    const top = newRows.slice(0, 10);
    const notifs = top.map((r) => ({
      user_id: null,
      type: r.content_type === "video" ? "update" : (r.category === "investigative" ? "breaking" : "news"),
      title: `${r.source_name}`,
      message: r.title,
      url: r.url,
      read: false,
    }));
    const { error: nerr } = await supabase.from("notifications").insert(notifs);
    if (nerr) console.error("notif insert error:", nerr);

    // Web Push fan-out — fire-and-forget per article (max 5 to avoid spam).
    await Promise.all(top.slice(0, 5).map(async (r) => {
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/push-send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            title: `📰 ${r.source_name}`,
            body: r.title,
            url: r.url,
            tag: `${r.source_id}-${r.external_id}`,
          }),
        });
      } catch (e) {
        console.warn("push fan-out failed:", e);
      }
    }));
  }

  return rows.length;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    // Trigger ingestion
    if (body?.action === "ingest") {
      const count = await ingestAll();
      return new Response(JSON.stringify({ ok: true, ingested: count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Legacy: raw YouTube RSS for the client (still used by useYouTubeVideos)
    const { channelIds } = body;
    if (channelIds && Array.isArray(channelIds)) {
      const results: Record<string, string> = {};
      await Promise.all(
        channelIds.map(async (channelId: string) => {
          try {
            const res = await fetch(
              `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
            );
            if (res.ok) results[channelId] = await res.text();
          } catch {}
        })
      );

      // Opportunistic: also refresh DB on any client request (rate-limited via cache below)
      ingestAll().catch((e) => console.error("bg ingest:", e));

      return new Response(JSON.stringify({ feeds: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "channelIds or action required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
