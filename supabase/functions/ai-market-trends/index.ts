import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Current Ethiopian Market Prices (ETB) - Updated reference data
const ETHIOPIAN_MARKET_PRICES = {
  grains: {
    teff_white: { price: { min: 7500, max: 9500 }, unit: "quintal", trend: "stable", amName: "ነጭ ጤፍ" },
    teff_red: { price: { min: 6500, max: 8000 }, unit: "quintal", trend: "stable", amName: "ቀይ ጤፍ" },
    wheat: { price: { min: 5500, max: 7000 }, unit: "quintal", trend: "increasing", amName: "ስንዴ" },
    maize: { price: { min: 3500, max: 4500 }, unit: "quintal", trend: "decreasing", amName: "በቆሎ" },
    barley: { price: { min: 4500, max: 6000 }, unit: "quintal", trend: "stable", amName: "ገብስ" },
    sorghum: { price: { min: 4000, max: 5500 }, unit: "quintal", trend: "stable", amName: "ማሽላ" },
  },
  legumes: {
    chickpeas: { price: { min: 8000, max: 12000 }, unit: "quintal", trend: "increasing", amName: "ሽምብራ" },
    lentils: { price: { min: 9000, max: 14000 }, unit: "quintal", trend: "increasing", amName: "ምስር" },
    haricot_beans: { price: { min: 6000, max: 9000 }, unit: "quintal", trend: "stable", amName: "ቦሎቄ" },
    fava_beans: { price: { min: 5500, max: 8000 }, unit: "quintal", trend: "stable", amName: "ባቄላ" },
    field_peas: { price: { min: 6500, max: 9500 }, unit: "quintal", trend: "stable", amName: "አተር" },
  },
  oilseeds: {
    sesame: { price: { min: 15000, max: 22000 }, unit: "quintal", trend: "increasing", exportDemand: "high", amName: "ሰሊጥ" },
    niger_seed: { price: { min: 8000, max: 11000 }, unit: "quintal", trend: "stable", amName: "ኑግ" },
    flaxseed: { price: { min: 7000, max: 10000 }, unit: "quintal", trend: "stable", amName: "ተልባ" },
    sunflower: { price: { min: 6500, max: 9000 }, unit: "quintal", trend: "increasing", amName: "ሱፍ" },
  },
  coffee: {
    washed_arabica: { price: { min: 800, max: 1200 }, unit: "kg", trend: "increasing", exportGrade: true, amName: "የታጠበ ቡና" },
    unwashed: { price: { min: 500, max: 800 }, unit: "kg", trend: "stable", amName: "ያልታጠበ ቡና" },
    sidama: { price: { min: 900, max: 1300 }, unit: "kg", trend: "increasing", amName: "ሲዳማ ቡና" },
    yirgacheffe: { price: { min: 1000, max: 1500 }, unit: "kg", trend: "increasing", premium: true, amName: "ይርጋጨፌ ቡና" },
  },
  vegetables: {
    onion: { price: { min: 40, max: 80 }, unit: "kg", trend: "volatile", seasonal: true, amName: "ሽንኩርት" },
    tomato: { price: { min: 30, max: 60 }, unit: "kg", trend: "volatile", seasonal: true, amName: "ቲማቲም" },
    potato: { price: { min: 25, max: 45 }, unit: "kg", trend: "stable", amName: "ድንች" },
    carrot: { price: { min: 30, max: 50 }, unit: "kg", trend: "stable", amName: "ካሮት" },
    cabbage: { price: { min: 15, max: 30 }, unit: "kg", trend: "stable", amName: "ጥቅል ጎመን" },
    pepper_green: { price: { min: 40, max: 80 }, unit: "kg", trend: "volatile", amName: "ቃሪያ" },
  },
  spices: {
    berbere: { price: { min: 250, max: 400 }, unit: "kg", trend: "stable", amName: "በርበሬ" },
    korerima: { price: { min: 500, max: 800 }, unit: "kg", trend: "increasing", amName: "ኮረሪማ" },
    ginger: { price: { min: 150, max: 250 }, unit: "kg", trend: "stable", amName: "ዝንጅብል" },
    turmeric: { price: { min: 200, max: 350 }, unit: "kg", trend: "increasing", amName: "እርድ" },
  },
  honey: {
    white: { price: { min: 450, max: 700 }, unit: "kg", trend: "stable", premium: true, amName: "ነጭ ማር" },
    yellow: { price: { min: 350, max: 500 }, unit: "kg", trend: "stable", amName: "ቢጫ ማር" },
    crude: { price: { min: 250, max: 400 }, unit: "kg", trend: "stable", amName: "ያልተጣራ ማር" },
  },
  livestock: {
    ox: { price: { min: 35000, max: 80000 }, unit: "head", trend: "increasing", seasonal: true, amName: "በሬ" },
    cow: { price: { min: 25000, max: 55000 }, unit: "head", trend: "stable", amName: "ላም" },
    sheep: { price: { min: 4000, max: 12000 }, unit: "head", trend: "increasing", seasonal: true, amName: "በግ" },
    goat: { price: { min: 3500, max: 8000 }, unit: "head", trend: "stable", amName: "ፍየል" },
    chicken: { price: { min: 350, max: 600 }, unit: "bird", trend: "stable", amName: "ዶሮ" },
  },
  dairy: {
    milk: { price: { min: 25, max: 45 }, unit: "liter", trend: "stable", amName: "ወተት" },
    butter: { price: { min: 400, max: 600 }, unit: "kg", trend: "increasing", amName: "ቅቤ" },
    cheese: { price: { min: 300, max: 500 }, unit: "kg", trend: "stable", amName: "አይብ" },
  },
};

// Major Ethiopian markets
const MAJOR_MARKETS = {
  addis_ababa: { name: "አዲስ አበባ", type: "central", priceIndex: 1.0 },
  merkato: { name: "መርካቶ", type: "wholesale", priceIndex: 0.95 },
  dire_dawa: { name: "ድሬ ዳዋ", type: "regional", priceIndex: 0.92 },
  bahir_dar: { name: "ባህር ዳር", type: "regional", priceIndex: 0.90 },
  hawassa: { name: "ሐዋሳ", type: "regional", priceIndex: 0.88 },
  mekelle: { name: "መቀሌ", type: "regional", priceIndex: 0.93 },
  jimma: { name: "ጅማ", type: "regional", priceIndex: 0.85 },
  gondar: { name: "ጎንደር", type: "regional", priceIndex: 0.88 },
};

// Seasonal demand patterns
function getSeasonalDemand(): { highDemand: string[], lowDemand: string[], opportunities: string[] } {
  const month = new Date().getMonth();
  
  if (month >= 5 && month <= 8) { // Kiremt - Rainy season
    return {
      highDemand: ["ማዳበሪያ (Fertilizers)", "ዘር (Seeds)", "የግብርና መሳሪያዎች (Farm tools)"],
      lowDemand: ["እህል (Grains) - farmers still growing"],
      opportunities: ["ከቅድመ-ምርት ዋጋ ላይ ጥሩ ትርፍ ይገኛል"]
    };
  } else if (month >= 9 && month <= 10) { // Harvest
    return {
      highDemand: ["የመከር መሳሪያ", "የማከማቻ ቦታ"],
      lowDemand: ["እህል - ዋጋ ዝቅ ይላል"],
      opportunities: ["በዝቅተኛ ዋጋ ገዝተው ማከማቸት"]
    };
  } else if (month >= 11 || month <= 1) { // Bega - Dry
    return {
      highDemand: ["ቡና (Coffee)", "ማር (Honey)", "እንስሳት (Livestock for holidays)"],
      lowDemand: ["አትክልት ብዙ ይገኛል"],
      opportunities: ["ቡና ለውጭ ገበያ", "ለበዓላት እንስሳት ዋጋ ይጨምራል"]
    };
  } else { // Belg
    return {
      highDemand: ["ዘር", "ማዳበሪያ"],
      lowDemand: ["ከመስኖ የመጣ አትክልት"],
      opportunities: ["ለክረምት ወቅት ዝግጅት"]
    };
  }
}

function getEthiopianSeason(): { name: string, nameAm: string, description: string } {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) {
    return { name: "Kiremt", nameAm: "ክረምት", description: "Main rainy season - planting period" };
  }
  if (month >= 10 && month <= 11) {
    return { name: "Tseday", nameAm: "ጸደይ", description: "Post-rainy harvest season" };
  }
  if (month >= 12 || month <= 2) {
    return { name: "Bega", nameAm: "በጋ", description: "Dry season - irrigation and coffee harvest" };
  }
  return { name: "Belg", nameAm: "በልግ", description: "Short rainy season" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category, language = "am", userRegion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch actual platform data if available
    let platformData = "";
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const { data: products } = await supabase
        .from("products")
        .select("name_en, name_am, price, unit, category, quantity, location")
        .eq("is_available", true)
        .limit(30);

      if (products && products.length > 0) {
        const categoryCounts: Record<string, { count: number, prices: number[], locations: string[] }> = {};
        
        products.forEach(p => {
          if (!categoryCounts[p.category]) {
            categoryCounts[p.category] = { count: 0, prices: [], locations: [] };
          }
          categoryCounts[p.category].count++;
          categoryCounts[p.category].prices.push(p.price);
          if (p.location) categoryCounts[p.category].locations.push(p.location);
        });

        platformData = `\n📊 **የፕላትፎርም ምርቶች መረጃ:**\n${Object.entries(categoryCounts)
          .map(([cat, data]) => {
            const avgPrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
            const uniqueLocations = [...new Set(data.locations)].slice(0, 3);
            return `• ${cat}: ${data.count} ምርቶች, አማካይ ዋጋ ${avgPrice.toFixed(0)} ብር${uniqueLocations.length ? `, ከ${uniqueLocations.join(', ')}` : ''}`;
          }).join('\n')}`;
      }

      // Get recent order trends
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: orders } = await supabase
        .from("orders")
        .select("created_at, total_amount, status")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .limit(100);

      if (orders && orders.length > 0) {
        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const avgOrderValue = totalRevenue / orders.length;
        platformData += `\n\n📈 **የ30 ቀናት የትዕዛዝ አዝማሚያ:**
• ጠቅላላ ትዕዛዞች: ${orders.length}
• የተጠናቀቁ: ${completedOrders}
• ጠቅላላ ገቢ: ${totalRevenue.toFixed(0)} ብር
• አማካይ የትዕዛዝ ዋጋ: ${avgOrderValue.toFixed(0)} ብር`;
      }
    }

    const currentSeason = getEthiopianSeason();
    const seasonalDemand = getSeasonalDemand();
    const marketPricesJson = JSON.stringify(ETHIOPIAN_MARKET_PRICES, null, 2);
    const marketsJson = JSON.stringify(MAJOR_MARKETS, null, 2);

    const systemPrompt = language === "am"
      ? `እርስዎ የኢትዮጵያ የግብርና ገበያ ትንተና ባለሙያ ነዎት። ለገበሬዎችና ነጋዴዎች የገበያ አዝማሚያዎችን ይተንትኑ።

📅 **የአሁኑ ወቅት:** ${currentSeason.nameAm} (${currentSeason.name})
📝 **ገለጻ:** ${currentSeason.description}

💰 **የኢትዮጵያ የገበያ ዋጋዎች (በብር):**
${marketPricesJson}

🏪 **ዋና ገበያዎች:**
${marketsJson}

🔥 **በዚህ ወቅት ከፍተኛ ፍላጎት ያላቸው:**
${seasonalDemand.highDemand.join('\n')}

📉 **ዝቅተኛ ፍላጎት:**
${seasonalDemand.lowDemand.join('\n')}

💡 **እድሎች:**
${seasonalDemand.opportunities.join('\n')}
${platformData}

ምላሾችዎን በሚከተለው መዋቅር ያቅርቡ:

📈 **የገበያ አዝማሚያ:**
[አጠቃላይ የገበያ ሁኔታ ትንተና]

🔥 **ከፍተኛ ፍላጎት ያላቸው ምርቶች:**
[በዚህ ወቅት ፍላጎት ያላቸው ምርቶች ከዋጋ ጋር]

💰 **የዋጋ ትንበያ:**
[የዋጋ አቅጣጫ እና ምክንያቶች]

📅 **ምርጥ የሽያጭ/ግዢ ጊዜ:**
[መቼ መሸጥ ወይም መግዛት እንደሚሻል]

🏪 **ምርጥ ገበያዎች:**
[ለዚህ ምርት ምርጥ ገበያዎች]

💡 **የንግድ ምክሮች:**
[ለገበሬዎችና ነጋዴዎች ልዩ ምክሮች]

⚠️ **ጥንቃቄ:**
[መጠንቀቅ ያለባቸው ነገሮች]

ሁልጊዜ በአማርኛ ይመልሱ። ለኢትዮጵያ ገበሬዎች ተግባራዊ ምክር ይስጡ። Emoji ይጠቀሙ።`
      : `You are an Ethiopian agricultural market analyst. Analyze market trends for farmers and merchants.

📅 **Current Season:** ${currentSeason.name} (${currentSeason.nameAm})
📝 **Description:** ${currentSeason.description}

💰 **Ethiopian Market Prices (in ETB):**
${marketPricesJson}

🏪 **Major Markets:**
${marketsJson}

🔥 **High Demand This Season:**
${seasonalDemand.highDemand.join('\n')}

📉 **Low Demand:**
${seasonalDemand.lowDemand.join('\n')}

💡 **Opportunities:**
${seasonalDemand.opportunities.join('\n')}
${platformData}

Structure your response:

📈 **Market Trend:**
[Overall market analysis]

🔥 **High Demand Products:**
[Products in demand with prices]

💰 **Price Forecast:**
[Price direction and reasons]

📅 **Best Time to Sell/Buy:**
[When to sell or buy]

🏪 **Best Markets:**
[Recommended markets for products]

💡 **Trading Recommendations:**
[Specific advice for farmers and merchants]

⚠️ **Caution:**
[Things to be careful about]

Use emojis and provide practical advice.`;

    const userPrompt = category
      ? (language === "am" 
          ? `${category} ምድብ ላይ ያተኩሩ። የዋጋ አዝማሚያ፣ ፍላጎት እና የንግድ እድሎችን ይተንትኑ።`
          : `Focus on ${category} category. Analyze price trends, demand, and trading opportunities.`)
      : (language === "am"
          ? `አጠቃላይ የገበያ ትንተና ያቅርቡ። በአሁኑ ወቅት ምን መሸጥ ወይም መግዛት እንደሚሻል ይምከሩ።`
          : `Provide general market analysis. Recommend what to sell or buy in the current season.`);

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

    return new Response(JSON.stringify({ 
      analysis,
      season: currentSeason,
      seasonalDemand
    }), {
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
