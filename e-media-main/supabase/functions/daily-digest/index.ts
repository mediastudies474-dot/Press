import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const APP_URL = "https://e-media.lovable.app";
const BRAND_PRIMARY = "#1e3a8a";
const BRAND_ACCENT = "#f97316";
const FROM_EMAIL = "ES-PRESS <onboarding@resend.dev>";

function htmlDigest(stories: Array<{ title: string; url: string; source_name: string; summary: string | null }>) {
  const items = stories.slice(0, 8).map((s, i) => `
    <tr><td style="padding:14px 0;border-bottom:1px solid #eef2f7;">
      <a href="${s.url}" style="text-decoration:none;color:#0f172a;font-weight:700;font-size:15px;line-height:1.35;">${i + 1}. ${escape(s.title)}</a>
      <div style="margin-top:4px;font-size:11px;color:${BRAND_PRIMARY};font-weight:700;text-transform:uppercase;letter-spacing:0.4px;">${escape(s.source_name)}</div>
      ${s.summary ? `<div style="margin-top:6px;font-size:13px;color:#475569;line-height:1.45;">${escape(s.summary.slice(0, 180))}…</div>` : ""}
    </td></tr>
  `).join("");
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:24px 0;"><tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06);">
        <tr><td style="background:linear-gradient(135deg, ${BRAND_PRIMARY}, ${BRAND_ACCENT});padding:24px 28px;color:#fff;">
          <div style="font-size:13px;font-weight:700;letter-spacing:2px;opacity:0.9;">ES-PRESS · DAILY DIGEST</div>
          <div style="font-size:22px;font-weight:800;margin-top:4px;">${new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</div>
        </td></tr>
        <tr><td style="padding:20px 28px 8px;">
          <p style="margin:0 0 8px;font-size:14px;color:#334155;">Today's top stories from across Eswatini media — straight to your inbox.</p>
        </td></tr>
        <tr><td style="padding:0 28px 12px;"><table width="100%" cellpadding="0" cellspacing="0">${items}</table></td></tr>
        <tr><td style="padding:18px 28px 28px;text-align:center;">
          <a href="${APP_URL}" style="display:inline-block;background:${BRAND_PRIMARY};color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;font-size:14px;">Open ES-PRESS</a>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f8fafc;font-size:11px;color:#64748b;text-align:center;line-height:1.5;">
          You're receiving this because you subscribed to the ES-PRESS Daily Digest.<br/>
          © ${new Date().getFullYear()} Imvelo Tech Group · Content belongs to its respective publishers.
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]);
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.warn("resend fail", res.status, (await res.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.warn("resend error", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: articles } = await supabase
      .from("articles")
      .select("title, url, source_name, summary, published_at")
      .gte("published_at", since)
      .order("published_at", { ascending: false })
      .limit(20);

    if (!articles || articles.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No new stories" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: subs } = await supabase
      .from("daily_subscribers")
      .select("user_id, enabled, email_enabled, email, sms_enabled, phone, last_sent_at");

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, message: "No subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const top = articles[0] as any;
    const top3 = articles.slice(0, 3) as any[];
    const inAppTitle = `📰 Daily Digest — ${articles.length} new stories`;
    const inAppMessage = `${top.source_name}: ${top.title}`;
    const smsText = `ES-PRESS Daily Digest:\n` +
      top3.map((s: any, i: number) => `${i + 1}. ${s.title} (${s.source_name})`).join("\n") +
      `\nMore: https://e-media.lovable.app`;

    // Idempotency: skip users already sent today
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const { data: already } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("type", "update")
      .like("title", "📰 Daily Digest%")
      .gte("created_at", todayStart.toISOString());
    const sentUsers = new Set((already || []).map((r: any) => r.user_id));

    // In-app notifications
    const notifRows = subs
      .filter((s: any) => s.enabled && !sentUsers.has(s.user_id))
      .map((s: any) => ({
        user_id: s.user_id,
        title: inAppTitle,
        message: inAppMessage,
        type: "update",
        url: top.url,
        read: false,
      }));
    if (notifRows.length > 0) {
      const { error } = await supabase.from("notifications").insert(notifRows);
      if (error) console.error("notif insert:", error);
    }

    // Fan-out Web Push to all in-app subscribers
    let pushed = 0;
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/push-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
        body: JSON.stringify({
          title: inAppTitle,
          body: inAppMessage,
          url: top.url,
          tag: `digest-${todayStart.toISOString().slice(0, 10)}`,
          user_ids: subs.filter((s: any) => s.enabled).map((s: any) => s.user_id),
        }),
      });
      if (r.ok) { const j = await r.json(); pushed = j.sent || 0; }
    } catch (e) { console.warn("push fan-out:", e); }

    // Email subscribers
    const subject = `📰 ES-PRESS Daily Digest — ${articles.length} new stories`;
    const html = htmlDigest(articles as any);
    let emailsSent = 0;
    const emailSubs = subs.filter((s: any) => s.email_enabled && s.email);
    await Promise.all(
      emailSubs.map(async (s: any) => {
        const ok = await sendEmail(s.email, subject, html);
        if (ok) {
          emailsSent++;
          await supabase.from("daily_subscribers")
            .update({ last_sent_at: new Date().toISOString() })
            .eq("user_id", s.user_id);
        }
      }),
    );

    // SMS fan-out via Vonage
    let smsSent = 0;
    const smsSubs = subs.filter((s: any) => s.sms_enabled && s.phone);
    await Promise.all(
      smsSubs.map(async (s: any) => {
        try {
          const r = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
            body: JSON.stringify({ to: s.phone, text: smsText }),
          });
          if (r.ok) smsSent++;
        } catch (e) { console.warn("sms fail", e); }
      }),
    );

    return new Response(
      JSON.stringify({
        success: true,
        stories: articles.length,
        in_app_sent: notifRows.length,
        push_sent: pushed,
        emails_sent: emailsSent,
        email_subscribers: emailSubs.length,
        sms_sent: smsSent,
        sms_subscribers: smsSubs.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("daily-digest error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
