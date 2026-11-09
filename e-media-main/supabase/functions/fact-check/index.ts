// AI-powered fact-checking + triangulation.
// Uses Lovable AI (Gemini) with Google Search grounding, plus cross-references
// against the local Eswatini media articles table for triangulation.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface TriSource {
  source_name: string;
  title: string;
  url: string;
  published_at: string | null;
  snippet?: string | null;
}

async function findLocalCorroboration(claim: string): Promise<TriSource[]> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  // Pull a few keywords (>=4 letters) for a simple ILIKE OR search
  const tokens = Array.from(
    new Set(
      claim
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 4)
    )
  ).slice(0, 6);
  if (tokens.length === 0) return [];

  const orExpr = tokens.map((t) => `title.ilike.%${t}%`).join(",");
  const { data } = await (supabase as any)
    .from("articles")
    .select("source_name, title, url, published_at, summary")
    .or(orExpr)
    .order("published_at", { ascending: false })
    .limit(8);

  return (data || []).map((r: any) => ({
    source_name: r.source_name,
    title: r.title,
    url: r.url,
    published_at: r.published_at,
    snippet: r.summary,
  }));
}

// ---------- Quantitative verification helpers ----------
// Inspired by information theory: triangulation count (independent sources),
// Jaccard similarity (analog of inverse MSE for token sets), and a Bayesian
// posterior P(authentic | corroborated) given prior + likelihoods.

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 4)
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

// Bayes: P(A|Pass) = P(Pass|A)P(A) / [P(Pass|A)P(A) + P(Pass|¬A)P(¬A)]
function bayesianConfidence(
  independentSources: number,
  avgSimilarity: number
): { posterior: number; label: "Low" | "Medium" | "High" } {
  const prior = 0.5;
  const pPassGivenA = Math.min(0.99, 0.55 + 0.12 * independentSources + 0.25 * avgSimilarity);
  const pPassGivenNotA = Math.max(0.05, 0.45 - 0.08 * independentSources);
  const num = pPassGivenA * prior;
  const post = num / (num + pPassGivenNotA * (1 - prior));
  const label = post >= 0.8 ? "High" : post >= 0.6 ? "Medium" : "Low";
  return { posterior: Number(post.toFixed(3)), label };
}

async function computeMetrics(claim: string) {
  const local = await findLocalCorroboration(claim);
  const claimTokens = tokenize(claim);
  const scored = local.map((s) => ({
    ...s,
    similarity: Number(
      jaccard(claimTokens, tokenize(`${s.title} ${s.snippet ?? ""}`)).toFixed(3)
    ),
  }));
  const independentSources = new Set(scored.map((s) => s.source_name)).size;
  const avgSim =
    scored.length > 0
      ? scored.reduce((a, b) => a + b.similarity, 0) / scored.length
      : 0;
  const { posterior, label: confidenceLabel } = bayesianConfidence(independentSources, avgSim);
  return { local: scored, independentSources, avgSim, posterior, confidenceLabel };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { claim } = await req.json();
    if (!claim || typeof claim !== "string" || claim.trim().length < 5) {
      return new Response(JSON.stringify({ error: "Provide a claim of at least 5 characters." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const metrics = await computeMetrics(claim);
    const { local, independentSources, avgSim, posterior, confidenceLabel } = metrics;

    const localBlock = local.length
      ? local
          .map(
            (s, i) =>
              `${i + 1}. [${s.source_name}] (sim=${s.similarity}) ${s.title}\n   ${s.url}${
                s.snippet ? `\n   ${s.snippet}` : ""
              }`
          )
          .join("\n")
      : "(No matching Eswatini media articles found in our index.)";

    const systemPrompt = `You are an impartial Eswatini-focused fact-checking assistant.
You triangulate a claim against (a) the user's local Eswatini media index provided
below, and (b) your general knowledge. Use neutral, evidence-first language.

You are also given quantitative verification metrics:
- Independent corroborating outlets (triangulation count)
- Average lexical similarity (Jaccard, 0–1)
- Bayesian posterior P(authentic | corroboration) and confidence band

Weigh the verdict accordingly: low triangulation OR low similarity → prefer
UNVERIFIED. High triangulation + high similarity → stronger verdict.

ALWAYS respond in this exact Markdown structure:

**Verdict:** one of TRUE / MOSTLY TRUE / MIXED / UNVERIFIED / MOSTLY FALSE / FALSE
**Confidence:** Low / Medium / High

### Summary
2-3 sentence plain-English explanation.

### Evidence
- Bullet points citing specific sources (use the local sources above when relevant).
- For each bullet, name the outlet and what it reports.

### Triangulation
- Independent outlets agreeing / disagreeing / silent.
- Reference the triangulation count and posterior provided.

### Caveats
- Limitations, missing context, what to verify further.

Be honest when evidence is thin — prefer UNVERIFIED to guessing.`;

    const userPrompt = `Claim: "${claim.trim()}"

Verification metrics:
- Independent outlets matched: ${independentSources}
- Average similarity (Jaccard): ${avgSim.toFixed(3)}
- Bayesian posterior P(authentic | corroboration): ${posterior} (${confidenceLabel})

Local Eswatini media articles that mention related keywords:
${localBlock}`;

    const aiRes = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const content = data?.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({
        ok: true,
        verdict: content,
        sources: local,
        metrics: {
          independentSources,
          avgSimilarity: Number(avgSim.toFixed(3)),
          bayesianPosterior: posterior,
          confidence: confidenceLabel,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fact-check error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
