// Server-side article extractor: fetches the source URL, strips chrome,
// returns clean title/byline/HTML content for the in-app reader. Bypasses
// X-Frame-Options/CSP restrictions that block iframe rendering.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function absolutize(html: string, baseUrl: string): string {
  let base: URL;
  try { base = new URL(baseUrl); } catch { return html; }
  return html
    .replace(/(<img[^>]+src=["'])(\/[^"']+)/gi, `$1${base.origin}$2`)
    .replace(/(<a[^>]+href=["'])(\/[^"']+)/gi, `$1${base.origin}$2`);
}

function extractContent(html: string): string {
  // Try common content containers
  const patterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class=["'][^"']*(entry-content|post-content|article-content|article-body|td-post-content|single-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<footer|<aside)/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      const c = (m[2] || m[1]).trim();
      if (c.length > 400) return c;
    }
  }
  // Fallback: collect <p> tags from body
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[0])
    .filter(p => p.replace(/<[^>]+>/g, "").trim().length > 40)
    .slice(0, 40)
    .join("\n");
  return paragraphs;
}

function sanitize(html: string): string {
  return html
    // Remove script/style/iframe/form
    .replace(/<(script|style|iframe|form|noscript|svg)[\s\S]*?<\/\1>/gi, "")
    // Remove inline event handlers and javascript: hrefs
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/href=["']javascript:[^"']*["']/gi, 'href="#"')
    // Strip class/style/id (keep things tidy and theme-able)
    .replace(/\s(class|style|id)="[^"]*"/gi, "")
    // Remove ad/sharing widgets
    .replace(/<(div|aside|section)[^>]*(advert|ad-|sharedaddy|jp-relatedposts|widget|promo|newsletter)[\s\S]*?<\/\1>/gi, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: "Valid url required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ES-PRESS-Reader/1.0)",
          "Accept": "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(20_000),
        redirect: "follow",
      });
    } catch (err) {
      const msg = (err as Error)?.name === "TimeoutError" || /timed out/i.test((err as Error)?.message || "")
        ? "The source site took too long to respond. Try opening it in a browser instead."
        : `Could not reach the source: ${(err as Error).message}`;
      return new Response(JSON.stringify({ error: msg }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Source returned ${res.status}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const html = await res.text();

    const title =
      pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      pick(html, /<title[^>]*>([^<]+)<\/title>/i) || "";
    const image =
      pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      pick(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    const author =
      pick(html, /<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i) ||
      pick(html, /<meta[^>]+property=["']article:author["'][^>]+content=["']([^"']+)["']/i);
    const published =
      pick(html, /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i);
    const siteName =
      pick(html, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);

    let content = extractContent(html);
    content = sanitize(content);
    content = absolutize(content, url);

    return new Response(JSON.stringify({
      title: decodeEntities(title),
      author: author ? decodeEntities(author) : null,
      published_at: published,
      site_name: siteName ? decodeEntities(siteName) : null,
      lead_image: image,
      content_html: content,
      url,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
