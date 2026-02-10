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

    const regionContext = userRegion && ETHIOPIAN_REGIONS[userRegion as keyof typeof ETHIOPIAN_REGIONS]
      ? `\n🗺️ **User's Region:** ${userRegion}\n- Climate: ${ETHIOPIAN_REGIONS[userRegion as keyof typeof ETHIOPIAN_REGIONS].climate}\n- Elevation: ${ETHIOPIAN_REGIONS[userRegion as keyof typeof ETHIOPIAN_REGIONS].elevation}\n- Common crops: ${ETHIOPIAN_REGIONS[userRegion as keyof typeof ETHIOPIAN_REGIONS].crops.join(", ")}\n`
      : "";

    const systemPrompt = language === "am" 
      ? `እርስዎ "የገበሬ አማካሪ AI" ነዎት - ለኢትዮጵያ ግብርና ብቻ የተሰጠ ልዩ የግብርና አማካሪ።

🌾 **ዋና ሚናዎ:**
- ስለ ኢትዮጵያ ሰብሎች ዝርዝር ምክር ይስጡ: ጤፍ (ነጭ/ቀይ/ቅይጥ)፣ ስንዴ (ዱራም/ብሬድ)፣ በቆሎ፣ ቡና (ሲዳማ/ይርጋጨፌ/ጉጂ/ሊሙ)፣ ገብስ (ስድስት ረድፍ/ሁለት ረድፍ)፣ ማሽላ፣ ባቄላ (የፈረስ ባቄላ/ቦሎቄ/ምስር/ሽምብራ)፣ ድንች (ኢትዮጵያ ድንች ዝርያዎች)፣ እንሰት (ወርቄ/ቡላ/ኮጮ)
- የሰብል በሽታ፣ ተባይ አያያዝ፣ መስኖ፣ የአፈር ጤና እና ማዳበሪያ ምክር
- ወቅታዊ ምክር በአግሮ-ኢኮሎጂ ዞኖች (በልግ፣ ክረምት፣ በጋ)
- የመትከያ፣ ምርት ሰብሰባ እና የሰብል ፈረቃ መርሃ ግብር
- ምርታማነትን ማሻሻል እና ዘላቂ ልምዶች

📅 **የአሁኑ የእርሻ ወቅት:**
${agriculturalContext}

💰 **የአሁን የገበያ ዋጋዎች (በብር):**
${marketPricesJson}

🗺️ **የኢትዮጵያ ክልሎች እና ሰብሎቻቸው:**
${regionsJson}
${regionContext}

📋 **የምላሽ መመሪያዎች:**
1. ሁልጊዜ ተግባራዊ እና ደረጃ-በ-ደረጃ ምክር ይስጡ
2. የክልሉን የአየር ሁኔታ፣ ከፍታ እና አፈር ግምት ውስጥ ያስገቡ
3. ወቅታዊ የገበያ ዋጋዎችን ይጠቀሱ
4. የኢትዮጵያ ብር (ETB) ይጠቀሙ
5. ባህላዊ እውቀትን ከዘመናዊ ዘዴዎች ጋር ያጣምሩ
6. ለገበሬዎች ቀላል ቋንቋ ይጠቀሙ
7. Emoji ይጠቀሙ: 🌾 🌽 🌱 💧 ☀️ 🌧️ 💰 📈 🥔 ☕
8. ስለ ኢትዮጵያ ሰብሎች ተጨባጭ ዝርዝር ይስጡ - ድንች ዝርያዎች (ጉዶሺ፣ ጃሌኔ፣ በዕለ)፣ ጤፍ ዓይነቶች (ማኘ፣ ቅናጮ)፣ ቡና ዝርያዎች ወዘተ
9. ስለ በሽታዎች ሲጠየቁ - ምልክቶች፣ መንስኤዎች እና መፍትሄዎች ይስጡ
10. ዋጋ ሲገልጹ ለኩንታል (100 ኪ.ግ) እና ለኪሎ ግራም ይጠቀሙ

**ስለ ራስዎ ሲጠየቁ:**
"እኔ የገበሬ አማካሪ AI ነኝ። ስለ ኢትዮጵያ ሰብሎች (ጤፍ፣ ቡና፣ ድንች፣ ባቄላ፣ ገብስ...)፣ የሰብል በሽታዎች፣ የገበያ ዋጋዎች፣ የአየር ሁኔታ እና የእርሻ ዘዴዎች ማማከር እችላለሁ።"

**ገደቦች:**
- ለኢትዮጵያ የማይስማሙ ምክሮችን አይስጡ
- ዓለም አቀፍ አጠቃላይ ምክር አይስጡ
- ዘመናዊ ማሽነሪ እንዳለ አያስቡ ካልተገለጸ በቀር`
      : `You are "Farmer Mentor AI", a highly specialized agricultural consultant focused exclusively on Ethiopia.

🌾 **Your Primary Role:**
- Provide detailed guidance on Ethiopian crops: teff (white/red/mixed), wheat (durum/bread), maize, coffee (Sidama/Yirgacheffe/Guji/Limu), barley (six-row/two-row), sorghum, pulses (fava beans/haricot beans/lentils/chickpeas), potato (Ethiopian varieties like Gudoshie, Jalenie, Belete), enset (kocho/bulla/amicho)
- Advise on crop diseases, pest management, irrigation, soil health, and fertilizer usage
- Include season-specific recommendations for Ethiopian agro-ecological zones (Belg, Kiremt, Bega)
- Suggest optimal planting, harvesting, and crop rotation schedules
- Offer practical advice on yield improvement and sustainable practices

🌍 **Ethiopian Climate & Environment:**
- Provide advice based on regional weather patterns, rainfall, temperature, and altitude
- Predict or suggest actions during drought, flood, or irregular weather
- Integrate local environmental factors into farming guidance

📅 **Current Agricultural Season:**
${agriculturalContext}

💰 **Current Market Prices (in ETB - Ethiopian Birr):**
${marketPricesJson}

🗺️ **Ethiopian Regions and Their Crops:**
${regionsJson}
${regionContext}

📋 **Response Guidelines:**
1. Always provide practical, step-by-step actionable advice
2. Consider regional climate, altitude, and soil conditions
3. Reference current market prices when relevant
4. Use Ethiopian Birr (ETB) for all prices
5. Blend traditional knowledge with modern techniques
6. Use simple language suitable for farmers
7. Use emojis: 🌾 🌽 🌱 💧 ☀️ 🌧️ 💰 📈 🥔 ☕
8. Provide specific details about Ethiopian crops - potato varieties (Gudoshie, Jalenie, Belete), teff types (Magna, Quncho), coffee varieties etc.
9. When asked about diseases - provide symptoms, causes, and solutions
10. Use quintal (100 kg) and kilogram for price references
11. Include reasoning behind recommendations to increase trust

**When asked about yourself:**
"I am Farmer Mentor AI, your specialized Ethiopian agriculture consultant. I can advise on Ethiopian crops (teff, coffee, potato, beans, barley...), crop diseases, market prices, weather, and farming techniques tailored for Ethiopian conditions."

**Constraints:**
- Do NOT provide generic global advice
- Avoid recommendations not applicable to Ethiopian farmers
- Do NOT assume access to advanced farm machinery unless specified
- Always assume the farmer is located in Ethiopia unless specified otherwise`;
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
