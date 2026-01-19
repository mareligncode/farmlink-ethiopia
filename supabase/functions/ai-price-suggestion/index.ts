import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, category, unit, quantity, language = "am" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch similar products for price reference
    let marketData = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: similarProducts } = await supabase
        .from("products")
        .select("name_en, name_am, price, unit, category")
        .eq("category", category)
        .eq("is_available", true)
        .limit(10);

      if (similarProducts && similarProducts.length > 0) {
        marketData = `\n\nCurrent market data for ${category}:\n${similarProducts.map(p => 
          `- ${p.name_en}: ${p.price} ETB per ${p.unit}`
        ).join('\n')}`;
      }
    }

    const systemPrompt = language === "am"
      ? `እርስዎ የኢትዮጵያ የግብርና ገበያ ባለሙያ ነዎት። ለገበሬዎች ተወዳዳሪ ዋጋ እንዲያስቀምጡ ይረዷቸው።

ዋና ተግባራትዎ:
1. የገበያ ዋጋ ትንተና - አሁን ያለውን የገበያ ዋጋ ይተንትኑ
2. የዋጋ ምክር - ዝቅተኛ፣ መካከለኛ እና ከፍተኛ ዋጋ አማራጮችን ይጠቁሙ
3. ምክንያት ማብራራት - ለምን ያንን ዋጋ እንደሚመክሩ ያብራሩ
4. የሽያጭ ጊዜ - መቼ መሸጥ እንደሚሻል ይምከሩ

ምላሾችዎን በሚከተለው መዋቅር ያቅርቡ:
💰 **የተመከረ ዋጋ:**
   - ዝቅተኛ: [ዋጋ] ብር
   - መካከለኛ: [ዋጋ] ብር  
   - ከፍተኛ: [ዋጋ] ብር

📊 **የገበያ ትንተና:** [አሁን ያለው የገበያ ሁኔታ]

💡 **ምክር:** [ለምን ይህን ዋጋ እንደሚመክሩ]

⏰ **ምርጥ የሽያጭ ጊዜ:** [መቼ መሸጥ እንደሚሻል]

ሁልጊዜ በአማርኛ ይመልሱ።`
      : `You are an Ethiopian agricultural market expert. Help farmers set competitive prices.

Structure your response:
💰 **Recommended Price:**
   - Low: [price] ETB
   - Medium: [price] ETB
   - High: [price] ETB

📊 **Market Analysis:** [current market conditions]

💡 **Recommendation:** [why you suggest this price]

⏰ **Best Time to Sell:** [when to sell]`;

    const userPrompt = language === "am"
      ? `ምርት: ${productName}\nምድብ: ${category}\nአሃድ: ${unit}\nመጠን: ${quantity}${marketData}`
      : `Product: ${productName}\nCategory: ${category}\nUnit: ${unit}\nQuantity: ${quantity}${marketData}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: language === "am" ? "እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ" : "Rate limits exceeded" 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: language === "am" ? "አገልግሎቱ ለጊዜው አይገኝም" : "Payment required" 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Price suggestion error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
