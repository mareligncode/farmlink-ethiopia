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
    const { userId, language = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's order history
    const { data: orders } = await supabase
      .from("orders")
      .select(`
        id,
        order_items (
          product_id,
          quantity,
          products (
            name_en,
            name_am,
            category,
            price
          )
        )
      `)
      .eq("merchant_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get available products
    const { data: availableProducts } = await supabase
      .from("products")
      .select("id, name_en, name_am, category, price, quantity, unit")
      .eq("is_available", true)
      .gt("quantity", 0)
      .limit(20);

    // Build context for AI
    const orderHistory = orders?.map(order => 
      order.order_items?.map((item: any) => ({
        product: item.products?.name_en,
        category: item.products?.category,
        quantity: item.quantity
      }))
    ).flat().filter(Boolean) || [];

    const prompt = language === "am"
      ? `ከዚህ በታች ያለውን የግዢ ታሪክ እና ያሉ ምርቶችን በመመልከት፣ ለነጋዴው 3-5 ምርቶችን ይምከሩ።

የግዢ ታሪክ: ${JSON.stringify(orderHistory)}

ያሉ ምርቶች: ${JSON.stringify(availableProducts)}

በJSON ቅርጸት መልስ ይስጡ:
{
  "recommendations": [
    {"productId": "id", "reason": "ምክንያት በአማርኛ"}
  ]
}`
      : `Based on the purchase history and available products below, recommend 3-5 products for this merchant.

Purchase history: ${JSON.stringify(orderHistory)}

Available products: ${JSON.stringify(availableProducts)}

Respond in JSON format:
{
  "recommendations": [
    {"productId": "id", "reason": "reason in English"}
  ]
}`;

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
            content: "You are a product recommendation AI for an Ethiopian agricultural marketplace. Analyze purchase patterns and suggest relevant products. Always respond in valid JSON format."
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
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Parse AI response
    let recommendations;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] };
    } catch {
      recommendations = { recommendations: [] };
    }

    // Enrich with product details
    const enrichedRecommendations = recommendations.recommendations?.map((rec: any) => {
      const product = availableProducts?.find(p => p.id === rec.productId);
      return product ? { ...product, reason: rec.reason } : null;
    }).filter(Boolean) || [];

    return new Response(
      JSON.stringify({ recommendations: enrichedRecommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
