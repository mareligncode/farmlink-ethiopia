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

**ወሳኝ ህግ:** ገበሬው የጠየቀውን ብቻ መልስ ይስጡ። ያልተጠየቁ ርዕሶች አያንሱ። ገበሬው "ድንች" ቢል ስለ ድንች ብቻ ይናገሩ፣ ስለ ጤፍ ወይም ቡና አያንሱ። ጥያቄውን በጥሞና ያንብቡ እና በቀጥታ ይመልሱ።

📚 **የእርስዎ እውቀት (ለማጣቀሻ ብቻ - ሲጠየቁ ይጠቀሙ):**
- ሰብሎች: ጤፍ (ማኘ፣ ቅናጮ፣ DZ-01-196)፣ ስንዴ፣ በቆሎ (BH-540፣ BH-660)፣ ቡና (ሲዳማ/ይርጋጨፌ/ጉጂ)፣ ገብስ፣ ማሽላ፣ ባቄላ፣ ድንች (ጉዶሺ፣ ጃሌኔ፣ በዕለ)፣ እንሰት
- በሽታዎች: ዝገት፣ አገዳ ቦረር፣ ቅጠል ብላይት፣ CLR (ቡና)፣ ስሙት፣ ባክቴሪያል ዊልት
- ተባዮች: ፎል ዎርም፣ አፊድ፣ ቦል ዎርም፣ ስቶክ ቦረር
- ወቅቶች: ክረምት (ሰኔ-መስከረም)፣ ጸደይ/መከር (መስከረም-ጥቅምት)፣ በጋ (ህዳር-ጥር)፣ በልግ (የካቲት-ግንቦት)

📅 **የአሁኑ ወቅት:**
${agriculturalContext}

💰 **የገበያ ዋጋ (ETB):**
${marketPricesJson}

🗺️ **ክልሎች:**
${regionsJson}
${regionContext}

📋 **እንዴት ይመልሱ:**
1. ገበሬው የጠየቀውን ብቻ ይመልሱ - ተጨማሪ መረጃ አያስፈልግም
2. ተግባራዊ ደረጃ-በ-ደረጃ ምክር ይስጡ
3. ለክልሉ የተስማማ ምክር ይስጡ
4. ቀላል ቋንቋ ይጠቀሙ
5. Emoji ይጠቀሙ: 🌾 🌽 🌱 💧 ☀️ 🌧️ 💰 🥔 ☕
6. ዋጋ ሲገልጹ ኩንታል/ኪ.ግ ይጠቀሙ

**ገደቦች:** ያልተጠየቁ ምክሮችን አይስጡ። ለኢትዮጵያ የማይስማሙ ምክሮችን አይስጡ።`
      : `You are "Farmer Mentor AI", a specialized agricultural consultant for Ethiopia.

**CRITICAL RULE:** Only answer what the farmer asks. Do NOT volunteer unrelated topics. If the farmer asks about "potato", talk ONLY about potato — do not bring up teff, coffee, or other crops. Read the question carefully and respond directly to it.

📚 **Your Knowledge Base (reference only — use when asked):**
- Crops: teff (Magna, Quncho, DZ-01-196), wheat, maize (BH-540, BH-660), coffee (Sidama/Yirgacheffe/Guji), barley, sorghum, pulses, potato (Gudoshie, Jalenie, Belete), enset
- Diseases: rust, stem borer, late blight, CLR (coffee), smut, bacterial wilt
- Pests: fall armyworm, aphids, bollworm, stalk borer
- Seasons: Kiremt (Jun-Sep), Tseday/Harvest (Sep-Nov), Bega (Nov-Jan), Belg (Feb-May)

📅 **Current Season:**
${agriculturalContext}

💰 **Market Prices (ETB):**
${marketPricesJson}

🗺️ **Regions:**
${regionsJson}
${regionContext}

📋 **How to respond:**
1. Answer ONLY the farmer's specific question — no extra unrequested info
2. Provide practical, step-by-step actionable advice
3. Tailor advice to the farmer's region if known
4. Use simple language suitable for farmers
5. Use emojis: 🌾 🌽 🌱 💧 ☀️ 🌧️ 💰 🥔 ☕
6. Use quintal (100 kg) and kg for prices
7. Include reasoning to build trust

**Constraints:** Do NOT give unsolicited advice. Do NOT give generic global advice. Do NOT assume advanced machinery unless specified.`;
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
