import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = language === "am" 
      ? `እርስዎ የኢትዮጵያ ግብርና ገበያ አማካሪ ነዎት። በአማርኛ ይመልሱ።
ስለ እርሻ ቴክኒኮች፣ የገበያ ዋጋዎች፣ የምርት ምክሮች እና በኢትዮጵያ የግብርና ልምዶች ይረዱ።
ለገበሬዎች የአፈር ዝግጅት፣ ዘር አመራረጥ፣ ውሃ አሰጣጥ እና ምርት አሰባሰብ ምክር ይስጡ።
ለነጋዴዎች የዋጋ ትንታኔ፣ ምርጥ ምርቶች እና የገበያ አዝማሚያዎች ይስጡ።
ምላሾችዎን ግልጽ እና ተግባራዊ ያድርጉ።`
      : `You are an Ethiopian agricultural marketplace assistant. 
Help users with farming techniques, market prices, product recommendations, and Ethiopian agricultural practices.
For farmers: Provide advice on soil preparation, seed selection, irrigation, and harvesting.
For merchants: Provide market analysis, best products to buy, and pricing trends.
Keep responses clear, practical, and actionable.
Support both English and Amharic languages based on user preference.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
