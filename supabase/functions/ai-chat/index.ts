import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ethiopian regional data for context-aware responses
const ETHIOPIAN_REGIONS = {
  tigray: { climate: "semi-arid highlands", crops: ["teff", "wheat", "barley", "sorghum"], elevation: "1500-3000m" },
  amhara: { climate: "highlands with good rainfall", crops: ["teff", "wheat", "maize", "pulses", "oilseeds"], elevation: "1800-4000m" },
  oromia: { climate: "diverse - highlands to lowlands", crops: ["coffee", "teff", "maize", "wheat", "barley", "enset"], elevation: "500-4000m" },
  snnpr: { climate: "humid highlands", crops: ["enset", "coffee", "maize", "fruits", "spices"], elevation: "500-3500m" },
  sidama: { climate: "humid highlands", crops: ["coffee", "enset", "maize", "chat"], elevation: "1500-3000m" },
  afar: { climate: "hot arid lowlands", crops: ["cotton", "dates", "livestock"], elevation: "below 1000m" },
  somali: { climate: "arid to semi-arid", crops: ["livestock", "sorghum", "maize"], elevation: "300-1500m" },
  benishangul: { climate: "hot lowlands with good rainfall", crops: ["sesame", "sorghum", "maize", "cotton"], elevation: "500-2000m" },
  gambela: { climate: "hot humid lowlands", crops: ["maize", "sorghum", "rice", "cotton"], elevation: "400-2000m" },
  harari: { climate: "semi-arid highlands", crops: ["chat", "coffee", "fruits", "vegetables"], elevation: "1800-2000m" },
  addis: { climate: "temperate highlands", crops: ["vegetables", "flowers", "dairy"], elevation: "2300-3000m" },
  dire: { climate: "semi-arid", crops: ["chat", "vegetables", "fruits"], elevation: "1200-1500m" },
};

// Current Ethiopian market prices (approximate ranges in ETB)
const MARKET_PRICES_ETB = {
  teff: { white: { min: 7500, max: 9500, unit: "quintal" }, red: { min: 6500, max: 8000, unit: "quintal" } },
  wheat: { min: 5500, max: 7000, unit: "quintal" },
  maize: { min: 3500, max: 4500, unit: "quintal" },
  barley: { min: 4500, max: 6000, unit: "quintal" },
  sorghum: { min: 4000, max: 5500, unit: "quintal" },
  coffee: { washed: { min: 800, max: 1200, unit: "kg" }, unwashed: { min: 500, max: 800, unit: "kg" } },
  chickpeas: { min: 8000, max: 12000, unit: "quintal" },
  lentils: { min: 9000, max: 14000, unit: "quintal" },
  sesame: { min: 15000, max: 22000, unit: "quintal" },
  niger_seed: { min: 8000, max: 11000, unit: "quintal" },
  onion: { min: 40, max: 80, unit: "kg" },
  tomato: { min: 30, max: 60, unit: "kg" },
  potato: { min: 25, max: 45, unit: "kg" },
  honey: { min: 350, max: 600, unit: "kg" },
};

// Ethiopian agricultural calendar
function getEthiopianAgriculturalContext(): string {
  const month = new Date().getMonth();
  
  if (month >= 5 && month <= 8) {
    return `
ወቅት: ክረምት (ዋና የዝናብ ወቅት - ሰኔ እስከ መስከረም)
- ይህ የዘር ወቅት ነው። ጤፍ፣ ስንዴ፣ በቆሎ፣ ገብስ ይዘራሉ
- የሰብል ክትትል እና የአረም ማስወገድ ወሳኝ ነው
- የተባይ እና የበሽታ ቅኝት ያስፈልጋል
- ጎርፍ እና ከባድ ዝናብ ጥንቃቄ ይፈልጋል`;
  } else if (month >= 9 && month <= 10) {
    return `
ወቅት: ጸደይ/መከር (መስከረም - ጥቅምት)
- የመኸር ወቅት ነው። አብዛኛው ሰብል ይሰበሰባል
- ጤፍ፣ ማሽላ፣ በቆሎ መከር ወቅት
- ምርትን በደረቅ ቦታ ማከማቸት
- የገበያ ዋጋ በዚህ ወቅት ዝቅ ይላል`;
  } else if (month >= 11 || month <= 1) {
    return `
ወቅት: በጋ (ህዳር - ጥር)
- ደረቅ ወቅት፣ መስኖ ያስፈልጋል
- አትክልትና ፍራፍሬ በመስኖ ይመረታል
- የቡና መከር ወቅት
- ለእህል ገበያ ጥሩ ወቅት`;
  } else {
    return `
ወቅት: በልግ (የካቲት - ግንቦት)
- አጭር የዝናብ ወቅት
- በአንዳንድ አካባቢዎች ሰብል ይዘራል
- የመስኖ አትክልት ምርት ወቅት
- ለዘር ዝግጅት ጊዜ`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en", userRegion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const agriculturalContext = getEthiopianAgriculturalContext();
    const marketPricesJson = JSON.stringify(MARKET_PRICES_ETB, null, 2);
    const regionsJson = JSON.stringify(ETHIOPIAN_REGIONS, null, 2);

    const systemPrompt = language === "am" 
      ? `እርስዎ "የኢትዮጵያ የግብርና ገበያ AI ረዳት" ነዎት። ሁልጊዜ በተፈጥሮአዊ አማርኛ ይናገሩ።

🌾 **የእርስዎ ሚና:**
- ለገበሬዎች፡ የዘመናዊና ባህላዊ እርሻ ዘዴዎችን ያማክሩ
- ለነጋዴዎች፡ የገበያ ትንተና እና የዋጋ ምክር ይስጡ
- ለሁሉም፡ ስለ ኢትዮጵያ ግብርና ጥያቄዎች ይመልሱ

📅 **የአሁኑ የእርሻ ወቅት:**
${agriculturalContext}

💰 **የአሁን የገበያ ዋጋዎች (በብር):**
${marketPricesJson}

🗺️ **የኢትዮጵያ ክልሎች እና ሰብሎቻቸው:**
${regionsJson}

📋 **የምክር መመሪያዎች:**
1. ሁልጊዜ ተግባራዊ እና ቀላል ምክር ይስጡ
2. የክልሉን የአየር ሁኔታ እና አፈር ግምት ውስጥ ያስገቡ
3. ወቅታዊ የገበያ ዋጋዎችን ይጠቀሱ
4. የኢትዮጵያ ብር (ETB) ይጠቀሙ
5. ባህላዊ እውቀትን ከዘመናዊ ዘዴዎች ጋር ያጣምሩ
6. ለገበሬዎች ሲመክሩ ቀላል ቋንቋ ይጠቀሙ
7. Emoji ይጠቀሙ: 🌾 🌽 🌱 💧 ☀️ 🌧️ 💰 📈

**ስለ ራስዎ ሲጠየቁ:**
"እኔ የኢትዮጵያ ግብርና ገበያ AI ረዳት ነኝ። ስለ እርሻ፣ የገበያ ዋጋዎች፣ የአየር ሁኔታ እና የሰብል ምርጫ ማማከር እችላለሁ።"`
      : `You are the "Ethiopian Agricultural Marketplace AI Assistant". Respond naturally in English but incorporate Ethiopian context.

🌾 **Your Role:**
- For farmers: Advise on modern and traditional Ethiopian farming techniques
- For merchants: Provide market analysis and pricing guidance
- For all: Answer questions about Ethiopian agriculture

📅 **Current Agricultural Season:**
${agriculturalContext}

💰 **Current Market Prices (in ETB - Ethiopian Birr):**
${marketPricesJson}

🗺️ **Ethiopian Regions and Their Crops:**
${regionsJson}

📋 **Response Guidelines:**
1. Always provide practical, actionable advice
2. Consider regional climate and soil conditions
3. Reference current market prices when relevant
4. Use Ethiopian Birr (ETB) for all prices
5. Blend traditional knowledge with modern techniques
6. Use simple language for farmer audiences
7. Use emojis: 🌾 🌽 🌱 💧 ☀️ 🌧️ 💰 📈

**When asked about yourself:**
"I am the Ethiopian Agricultural Marketplace AI Assistant. I can advise on farming, market prices, weather, and crop selection for Ethiopian agriculture."`;

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
        return new Response(JSON.stringify({ 
          error: language === "am" ? "እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ" : "Rate limits exceeded, please try again later." 
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
