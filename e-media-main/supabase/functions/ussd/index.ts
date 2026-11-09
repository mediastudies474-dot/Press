// Generic USSD webhook for *4700# (operator-agnostic).
// Accepts both Africa's Talking style (form-encoded: sessionId, phoneNumber, serviceCode, text)
// and JSON aggregator payloads. Responds with plain text:
//   "CON ..."  -> keep session open, more input expected
//   "END ..."  -> terminate session
//
// IMPORTANT: USSD responses must stay under ~182 characters per screen on most
// telco gateways. We keep menus short and headlines truncated.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Sources surfaced in the USSD menu (newspapers first, as requested).
// Order matters — index = menu number.
const SOURCES: Array<{ id: string; label: string }> = [
  { id: "eo",  label: "Eswatini Observer" },
  { id: "edn", label: "Eswatini Daily News" },
  { id: "et",  label: "The Eswatini Times" },
  { id: "ine", label: "Independent News" },
  { id: "epn", label: "Positive News" },
  { id: "nation-magazine", label: "The Nation" },
  { id: "swazi-newsweek",  label: "Newsweek" },
];

const MAX_USSD_LEN = 180;

function truncate(s: string, n: number) {
  s = (s || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function buildMainMenu(): string {
  let out = "CON ES-PRESS Latest News\nSelect a source:";
  SOURCES.forEach((s, i) => {
    out += `\n${i + 1}. ${s.label}`;
  });
  out += "\n0. Exit";
  return out;
}

async function buildHeadlines(sb: any, sourceId: string, sourceLabel: string): Promise<string> {
  const { data, error } = await sb
    .from("articles")
    .select("title, published_at")
    .eq("source_id", sourceId)
    .order("published_at", { ascending: false })
    .limit(5);

  if (error || !data || data.length === 0) {
    return `END ${sourceLabel}\nNo recent headlines available. Try again later.`;
  }

  // Budget per headline so we stay under telco limit.
  const header = `END ${sourceLabel} - Top headlines:\n`;
  const budget = MAX_USSD_LEN - header.length;
  const perItem = Math.max(40, Math.floor(budget / data.length) - 3);

  const lines = data.map((r: any, i: number) => `${i + 1}. ${truncate(r.title, perItem)}`);
  let body = lines.join("\n");
  // Hard-cap final length defensively.
  if (header.length + body.length > MAX_USSD_LEN) {
    body = body.slice(0, MAX_USSD_LEN - header.length - 1) + "…";
  }
  return header + body;
}

async function parsePayload(req: Request): Promise<{ text: string; sessionId: string; phoneNumber: string; serviceCode: string }> {
  const ct = req.headers.get("content-type") || "";
  let text = "", sessionId = "", phoneNumber = "", serviceCode = "";

  if (ct.includes("application/json")) {
    const j = await req.json().catch(() => ({}));
    text = j.text ?? "";
    sessionId = j.sessionId ?? j.session_id ?? "";
    phoneNumber = j.phoneNumber ?? j.msisdn ?? "";
    serviceCode = j.serviceCode ?? j.service_code ?? "";
  } else {
    // form-urlencoded (Africa's Talking default) or query string fallback
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    text = params.get("text") ?? "";
    sessionId = params.get("sessionId") ?? "";
    phoneNumber = params.get("phoneNumber") ?? "";
    serviceCode = params.get("serviceCode") ?? "";

    if (!text && !sessionId) {
      const u = new URL(req.url);
      text = u.searchParams.get("text") ?? text;
      sessionId = u.searchParams.get("sessionId") ?? sessionId;
      phoneNumber = u.searchParams.get("phoneNumber") ?? phoneNumber;
      serviceCode = u.searchParams.get("serviceCode") ?? serviceCode;
    }
  }
  return { text, sessionId, phoneNumber, serviceCode };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // GET = simple health/menu preview for dashboards.
  if (req.method === "GET") {
    return new Response(buildMainMenu(), {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    const { text, sessionId, phoneNumber } = await parsePayload(req);

    // Africa's Talking convention: empty text = first dial.
    // Subsequent inputs are joined with `*` (e.g. "1", "1*2").
    const steps = (text || "").split("*").map(s => s.trim()).filter(s => s.length > 0);

    let response: string;

    if (steps.length === 0) {
      response = buildMainMenu();
    } else {
      const choice = steps[0];
      if (choice === "0") {
        response = "END Goodbye. Open the ES-PRESS app for more.";
      } else {
        const idx = parseInt(choice, 10) - 1;
        if (Number.isInteger(idx) && idx >= 0 && idx < SOURCES.length) {
          const src = SOURCES[idx];
          response = await buildHeadlines(sb, src.id, src.label);
        } else {
          response = "END Invalid selection. Dial *4700# again.";
        }
      }
    }

    // Best-effort analytics — never block the response.
    try {
      await sb.from("user_interactions").insert({
        user_id: null as any, // RLS allows service role; column is NOT NULL so wrap in try
        media_id: "ussd",
        interaction_type: "ussd",
        source_id: "ussd",
        source_name: "USSD *4700#",
        category: "ussd",
        metadata: { sessionId, phoneNumber, text, response: response.slice(0, 200) },
      });
    } catch { /* ignore — user_interactions requires user_id; safe to skip */ }

    return new Response(response, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    return new Response("END Service temporarily unavailable. Try again.", {
      status: 200, // USSD gateways expect 200 + END message on errors
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
});
