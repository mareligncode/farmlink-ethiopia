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
    const { productName, category, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = language === "am"
      ? `ለ "${productName}" (ምድብ: ${category}) የኢትዮጵያ ግብርና ምርት አጭር እና ማራኪ የምርት መግለጫ ፃፍ። 
በ2-3 ዓረፍተ ነገሮች ውስጥ የምርቱን ጥራት፣ ትኩስነት እና ጠቀሜታ አጉልተህ አሳይ። በአማርኛ ብቻ መልስ።`
      : `Write a short and compelling product description for "${productName}" (category: ${category}) - an Ethiopian agricultural product.
In 2-3 sentences, highlight the quality, freshness, and benefits of this product. Keep it professional and appealing to buyers.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: language === "am" 
              ? "እርስዎ የኢትዮጵያ ግብርና ምርቶች ባለሙያ የግብይት ጸሐፊ ነዎት። አጭር፣ ማራኪ እና ባለሙያ የምርት መግለጫዎችን በአማርኛ ይፃፉ።"
              : "You are an expert marketing copywriter for Ethiopian agricultural products. Write concise, compelling, and professional product descriptions."
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI generate description error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
