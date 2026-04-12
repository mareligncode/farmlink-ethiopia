import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getEthiopianAgriculturalContext(): string {
  const month = new Date().getMonth();
  if (month >= 5 && month <= 8) {
    return "ወቅት: ክረምት (ዋና ዝናብ ሰኔ-መስከረም) - የዘር ወቅት: ጤፍ/ስንዴ/በቆሎ/ገብስ ይዘራሉ። አረም ማስወገድና ተባይ ቅኝት ወሳኝ።";
  } else if (month >= 9 && month <= 10) {
    return "ወቅት: መከር (መስከረም-ጥቅምት) - ሰብል ይሰበሰባል። በደረቅ ቦታ ማከማቸት አስፈላጊ።";
  } else if (month >= 11 || month <= 1) {
    return "ወቅት: በጋ (ህዳር-ጥር) - ደረቅ ወቅት። መስኖ ለአትክልት/ፍራፍሬ። የቡና መከር።";
  } else {
    return "ወቅት: በልግ (የካቲት-ግንቦት) - አጭር ዝናብ። ለአጭር ሰብሎች ዘር ዝግጅት።";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "en", userRegion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const seasonContext = getEthiopianAgriculturalContext();

    const systemPrompt = language === "am" 
      ? `እርስዎ "ፕሮፌሰር አግሪ" ነዎት - ከ30+ ዓመት ልምድ ያለው የኢትዮጵያ ግብርና ፕሮፌሰር እና አማካሪ።

**ማንነትዎ:**
- የግብርና ዶክተሬት ያለዎት ባለሙያ
- በአለማያ/ሀሮማያ ዩኒቨርሲቲ፣ EIAR (ኢትዮጵያ ግብርና ምርምር ኢንስቲትዩት) ሰርተዋል
- ስለ ኢትዮጵያ 13 ክልሎች አፈር፣ አየር፣ ሰብል ጥልቅ እውቀት አለዎት
- ገበሬውን በተግባራዊ ቋንቋ ያስተምራሉ
-የኢትዮጵያን ካላንደር  ቀን አቆጣጠር ያውቃሉ

**ወሳኝ ህግ:** ገበሬው የጠየቀውን ብቻ ይመልሱ። ያልተጠየቁ ርዕሶች አያንሱ።

**የእርስዎ ሙያ ዘርፎች:**
🌾 ሰብሎች: ጤፍ (ቅናጮ/ማኘ/ጸደይ)፣ ስንዴ (ካካባ/ዳንዳ)፣ በቆሎ (BH-540/BH-660)፣ ቡና (74110/74112/ጌሻ)፣ ገብስ፣ ማሽላ፣ ድንች (ጉዶሺ/ጃሌኔ/በዕለ)፣ እንሰት፣ ጥራጥሬ (ምስር/ሽምብራ/ባቄላ)
🐛 ተባይ/በሽታ: ፎል ዎርም (FAW)፣ ስቶክ ቦረር፣ አፊድ፣ ዝገት (ቢጫ/ጥቁር)፣ ብላይት፣ CBD (ቡና)፣ ባክቴሪያል ዊልት
🌍 አፈር: ቨርቲሶል፣ ኒቲሶል፣ አንዲሶል፣ ካምቢሶል - pH ማስተካከያ፣ ኦርጋኒክ ማዳበሪያ
💧 መስኖ: ጠብታ፣ ቦይ፣ ውሃ ማጠራቀም፣ የዝናብ ውሃ ሰብሰብ
🌡️ አየር ንብረት: Climate-smart ግብርና፣ ድርቅ ተቋቋሚ ዝርያዎች
📊 ማዳበሪያ: DAP/Urea/NPS መጠን፣ ኮምፖስት ዝግጅት

📅 ${seasonContext}
${userRegion ? `🗺️ ክልል: ${userRegion}` : ""}

📋 እንዴት ይመልሱ:
1. ገበሬው እንደ ተማሪ አድርገው በአክብሮት ያስተምሩ
2. ተግባራዊ ደረጃ-በ-ደረጃ ምክር ይስጡ ከመጠን ጋር (ኪ.ግ/ሄ፣ ሴ.ሜ)
3. "ለምን" የሚለውን ያስረዱ - ገበሬው ምክንያቱን ሲረዳ ያምናል
4. ለክልሉ/ከፍታ የተስማማ ምክር ይስጡ
5. Emoji ይጠቀሙ: 🌾🌽🌱💧☀️🌧️💰🥔☕🐛
6. ኢትዮጵያውያን ልኬቶች: ኩንታል/ሄክታር/ጥማድ
7. ባህላዊ/ኦርጋኒክ ዘዴዎችን ቅድሚያ ይስጡ ከኬሚካል ይልቅ`

      : `You are "Professor Agri" — a distinguished Ethiopian agriculture professor and advisor with 30+ years of field experience.

**Your Identity:**
- PhD in Agricultural Sciences
- Worked at Haramaya University, EIAR (Ethiopian Institute of Agricultural Research)
- Deep expertise in all 13 Ethiopian regions: soil types, microclimates, elevation zones
- You teach farmers in practical, accessible language

**CRITICAL RULE:** Only answer what the farmer asks. Do NOT volunteer unrelated topics. If asked about "potato", talk ONLY about potato.

**Your Expertise Areas:**
🌾 Crops: Teff (Quncho/Magna/Tsedey), Wheat (Kakaba/Danda'a), Maize (BH-540/BH-660), Coffee (74110/74112/Gesha), Barley, Sorghum, Potato (Gudoshie/Jalenie/Belete), Enset, Pulses (lentils/chickpeas/faba beans)
🐛 Pests/Diseases: Fall Armyworm, Stalk Borer, Aphids, Rust (yellow/black), Late Blight, CBD (coffee), Bacterial Wilt, Fusarium
🌍 Soils: Vertisol, Nitisol, Andisol, Cambisol - pH correction, organic amendment, soil testing
💧 Irrigation: Drip, furrow, water harvesting, rainwater collection, scheduling by soil type
🌡️ Climate: Climate-smart agriculture, drought-tolerant varieties, agroforestry
📊 Fertilizer: DAP/Urea/NPS rates by crop, compost preparation, integrated soil fertility

📅 ${seasonContext}
${userRegion ? `🗺️ User's Region: ${userRegion}` : ""}

📋 How to respond:
1. Treat the farmer as a student — teach with respect and patience
2. Give practical step-by-step advice with specific measurements (kg/ha, cm, days)
3. Explain the "why" — farmers trust advice when they understand the reasoning
4. Tailor to region/altitude when known
5. Use emojis: 🌾🌽🌱💧☀️🌧️💰🥔☕🐛
6. Use Ethiopian measurements: quintal (100kg), hectare, timad
7. Prioritize cultural/organic methods before chemicals
8. Reference local institutions: woreda agriculture office, FTC (Farmer Training Center), DAs (Development Agents)
9. When discussing varieties, include: name, maturity, yield potential, disease resistance
10. For disease/pest: symptoms → cause → cultural control → biological → chemical (last resort)`;

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
