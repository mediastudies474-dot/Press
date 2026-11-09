// Translate article HTML/text into siSwati using the Lovable AI Gateway.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { html, text, target = 'ss' } = await req.json();
    const source = (html ?? text ?? '').toString();
    if (!source || source.length < 5) {
      return new Response(JSON.stringify({ error: 'Empty content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI gateway not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const langName = target === 'ss' ? 'siSwati (Swati)' : 'English';

    // Truncate to keep latency reasonable.
    const trimmed = source.slice(0, 12000);

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator translating news articles into ${langName}. Preserve any HTML tags exactly. Translate proper nouns naturally; keep place/person names as-is. Return ONLY the translated content, no preface.`,
          },
          { role: 'user', content: trimmed },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: `AI error: ${resp.status}`, detail: errText }), {
        status: resp.status === 429 || resp.status === 402 ? resp.status : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const translated = data?.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ translated, lang: target }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
