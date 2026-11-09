// Send Web Push notifications to all (or specific) subscribers using VAPID.
// Called by other edge functions (fetch-rss, daily-digest) and protected
// from the public web by an internal shared secret.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-key",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:hello@imvelo.tech";

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
} catch (e) {
  console.error("VAPID config error:", e);
}

interface PushPayload {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
  user_ids?: string[]; // optional targeting
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return new Response(JSON.stringify({ error: "VAPID keys missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const payload = (await req.json()) as PushPayload;
    if (!payload?.title) {
      return new Response(JSON.stringify({ error: "title required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let q = supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("enabled", true);
    if (payload.user_ids && payload.user_ids.length > 0) {
      q = q.in("user_id", payload.user_ids);
    }
    const { data: subs, error } = await q;
    if (error) throw error;
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "no subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = JSON.stringify({
      title: payload.title,
      body: payload.body || "",
      url: payload.url || "/",
      tag: payload.tag,
    });

    let sent = 0;
    let failed = 0;
    const removeIds: string[] = [];

    await Promise.all(
      subs.map(async (s: any) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            data,
            { TTL: 60 * 60 * 12 }
          );
          sent++;
        } catch (e: any) {
          failed++;
          // 404/410 = subscription gone, drop it.
          if (e?.statusCode === 404 || e?.statusCode === 410) removeIds.push(s.id);
          else console.warn("push fail", e?.statusCode, e?.body?.slice?.(0, 200));
        }
      }),
    );

    if (removeIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", removeIds);
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: subs.length, pruned: removeIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("push-send error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
