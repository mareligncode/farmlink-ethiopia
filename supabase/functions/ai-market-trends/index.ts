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
    const { category, language = "am" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch market data
    let marketData = "";
    let orderTrends = "";
    
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Get products by category
      const { data: products } = await supabase
        .from("products")
        .select("name_en, name_am, price, unit, category, quantity")
        .eq("is_available", true)
        .limit(20);

      if (products && products.length > 0) {
        const categoryCounts: Record<string, number> = {};
        const categoryPrices: Record<string, number[]> = {};
        
        products.forEach(p => {
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
          if (!categoryPrices[p.category]) categoryPrices[p.category] = [];
          categoryPrices[p.category].push(p.price);
        });

        marketData = `\nAvailable products by category:\n${Object.entries(categoryCounts)
          .map(([cat, count]) => {
            const prices = categoryPrices[cat];
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            return `- ${cat}: ${count} products, avg price ${avgPrice.toFixed(0)} ETB`;
          }).join('\n')}`;
      }

      // Get recent orders for demand analysis
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: orders } = await supabase
        .from("orders")
        .select("created_at, total_amount, status")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .limit(50);

      if (orders && orders.length > 0) {
        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        orderTrends = `\nRecent order trends (30 days):\n- Total orders: ${orders.length}\n- Completed: ${completedOrders}\n- Total revenue: ${totalRevenue.toFixed(0)} ETB`;
      }
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentSeason = getEthiopianSeason();

    const systemPrompt = language === "am"
      ? `እርስዎ የኢትዮጵያ የግብርና ገበያ ትንተና ባለሙያ ነዎት። ለገበሬዎች የገበያ አዝማሚያዎችን ይተነትኑ።

ዋና ተግባራትዎ:
1. የገበያ ትንተና - አሁን ያለውን የገበያ ሁኔታ ይተንትኑ
2. የፍላጎት ትንበያ - ምን ዓይነት ምርቶች ፍላጎት እንዳላቸው ይተነብዩ
3. የወቅት ምክር - በዚህ ወቅት ምን መሸጥ እንደሚሻል ይምከሩ
4. የዋጋ አዝማሚያ - ዋጋዎች ወደ ላይ ወይም ወደ ታች እየሄዱ እንደሆነ ይግለጹ
5. እድሎች - ገበሬዎች ሊጠቀሙባቸው የሚችሉ እድሎችን ይጠቁሙ

አሁን ያለው ወቅት: ${currentSeason}
ወር: ${currentMonth}

ምላሾችዎን በሚከተለው መዋቅር ያቅርቡ:

📈 **የገበያ አዝማሚያ:**
[አጠቃላይ የገበያ ሁኔታ]

🔥 **ከፍተኛ ፍላጎት ያላቸው ምርቶች:**
[በዚህ ወቅት ፍላጎት ያላቸው ምርቶች]

📅 **ምርጥ የሽያጭ ጊዜ:**
[መቼ መሸጥ እንደሚሻል]

💡 **ምክሮች:**
[ለገበሬዎች ልዩ ምክሮች]

⚠️ **ጥንቃቄ:**
[መጠንቀቅ ያለባቸው ነገሮች]

ሁልጊዜ በአማርኛ ይመልሱ። ለኢትዮጵያ ገበሬዎች ተግባራዊ ምክር ይስጡ።`
      : `You are an Ethiopian agricultural market analyst. Analyze market trends for farmers.

Current season: ${currentSeason}
Month: ${currentMonth}

Structure your response:

📈 **Market Trend:**
[Overall market conditions]

🔥 **High Demand Products:**
[Products in high demand this season]

📅 **Best Time to Sell:**
[When to sell for best prices]

💡 **Recommendations:**
[Specific advice for farmers]

⚠️ **Caution:**
[Things to be careful about]`;

    const userPrompt = category
      ? (language === "am" 
          ? `${category} ምድብ ላይ ያተኩሩ።${marketData}${orderTrends}`
          : `Focus on ${category} category.${marketData}${orderTrends}`)
      : (language === "am"
          ? `አጠቃላይ የገበያ ትንተና ያቅርቡ።${marketData}${orderTrends}`
          : `Provide general market analysis.${marketData}${orderTrends}`);

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
    const analysis = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Market trends error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getEthiopianSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return "ክረምት (Kiremt - Rainy Season)";
  if (month >= 10 && month <= 1) return "በጋ (Bega - Dry Season)";
  return "በልግ (Belg - Short Rainy Season)";
}
