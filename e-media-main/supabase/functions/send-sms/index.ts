// Send SMS headlines via Vonage (Nexmo) REST API.
// Used by daily-digest fan-out and for a one-off "test SMS" from settings.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VONAGE_API_KEY = Deno.env.get("VONAGE_API_KEY") || "";
const VONAGE_API_SECRET = Deno.env.get("VONAGE_API_SECRET") || "";
const FROM = "ESPRESS"; // alphanumeric sender ID (max 11 chars)

function normalize(num: string): string {
  const t = num.replace(/[^\d+]/g, "");
  if (t.startsWith("+")) return t.slice(1);
  if (t.startsWith("00")) return t.slice(2);
  // assume Eswatini if 8 digits
  if (t.length === 8) return "268" + t;
  return t;
}

export async function sendSms(to: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!VONAGE_API_KEY || !VONAGE_API_SECRET) return { ok: false, error: "Vonage not configured" };
  const body = new URLSearchParams({
    api_key: VONAGE_API_KEY,
    api_secret: VONAGE_API_SECRET,
    from: FROM,
    to: normalize(to),
    text: text.slice(0, 480),
  });
  try {
    const r = await fetch("https://rest.nexmo.com/sms/json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const j = await r.json();
    const status = j?.messages?.[0]?.status;
    if (status === "0") return { ok: true };
    return { ok: false, error: j?.messages?.[0]?.["error-text"] || `status ${status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { to, text } = await req.json();
    if (!to || !text) {
      return new Response(JSON.stringify({ error: "to and text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const res = await sendSms(String(to), String(text));
    return new Response(JSON.stringify(res), {
      status: res.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
