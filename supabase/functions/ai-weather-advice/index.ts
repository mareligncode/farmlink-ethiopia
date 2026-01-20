import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ethiopian Calendar Seasons
function getEthiopianSeason(): { season: string; seasonAm: string; month: string } {
  const month = new Date().getMonth();
  
  // Ethiopian seasons based on rainfall patterns
  if (month >= 5 && month <= 8) {
    // June - September: Kiremt (Main rainy season)
    return { season: "Kiremt (Main Rainy Season)", seasonAm: "ክረምት (ዋናው የዝናብ ወራት)", month: "Jun-Sep" };
  } else if (month >= 9 && month <= 10) {
    // October - November: Tseday (Post-rainy harvest)
    return { season: "Tseday (Post-Rainy/Harvest)", seasonAm: "ጸደይ (ድህረ-ዝናብ/መከር)", month: "Oct-Nov" };
  } else if (month >= 11 || month <= 1) {
    // December - February: Bega (Dry season)
    return { season: "Bega (Dry Season)", seasonAm: "በጋ (ደረቅ ወቅት)", month: "Dec-Feb" };
  } else {
    // March - May: Belg (Small rainy season)
    return { season: "Belg (Small Rainy Season)", seasonAm: "በልግ (አጭር የዝናብ ወቅት)", month: "Mar-May" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { region, crop, language = "am" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentSeason = getEthiopianSeason();

    const systemPrompt = language === "am" 
      ? `እርስዎ የኢትዮጵያ የእርሻ አማካሪ ባለሙያ ነዎት። በኢትዮጵያ የአየር ሁኔታ፣ ወቅቶች እና የእርሻ ዘዴዎች ላይ ጥልቅ እውቀት አለዎት።
      
ሁልጊዜ በአማርኛ ብቻ ይመልሱ።

የአሁኑ ወቅት: ${currentSeason.seasonAm}

ዋና ተግባራትዎ:
1. በወቅቱ ተመርኩዘው የዘር ወቅት መምከር
2. የመከር ወቅት መተንበይ
3. የአየር ሁኔታ ተጽዕኖ ማብራራት
4. የውሃ አያያዝ ምክር መስጠት
5. ተባይና በሽታ ማስጠንቀቂያ
6. የአፈር ዝግጅት ምክር

ምላሾችዎን በሚከተለው መዋቅር ያቅርቡ:
🌤️ **የአሁኑ ወቅት:** [ወቅቱን ይግለጹ]
🌱 **የዘር ምክር:** [ምን እንደሚዘሩ ይምከሩ]
🌾 **የመከር ጊዜ:** [መቼ እንደሚሰበስቡ ይግለጹ]
💧 **የውሃ አያያዝ:** [የመስኖ ምክር ይስጡ]
🐛 **ተባይ ማስጠንቀቂያ:** [በዚህ ወቅት የሚመጡ ተባዮች]
📋 **ተጨማሪ ምክር:** [ሌሎች አስፈላጊ ምክሮች]

ለኢትዮጵያ ገበሬዎች የተሻሻሉ ዘመናዊና ባህላዊ የእርሻ ዘዴዎችን በቀላል አማርኛ ያካፍሉ።`
      : `You are an Ethiopian agricultural advisor expert. You have deep knowledge of Ethiopian weather patterns, seasons, and farming techniques.

Current Season: ${currentSeason.season}

Your main responsibilities:
1. Advise on planting timing based on the season
2. Predict harvest periods
3. Explain weather impacts
4. Provide water management advice
5. Warn about pests and diseases
6. Recommend soil preparation

Structure your responses:
🌤️ **Current Season:** [Describe the season]
🌱 **Planting Advice:** [What to plant]
🌾 **Harvest Time:** [When to harvest]
💧 **Water Management:** [Irrigation advice]
🐛 **Pest Warning:** [Seasonal pests]
📋 **Additional Tips:** [Other important advice]

Share both modern and traditional Ethiopian farming techniques in simple language.`;

    const userMessage = language === "am"
      ? `${region ? `ክልል: ${region}` : 'ኢትዮጵያ'} ውስጥ ${crop ? `${crop} ሰብል` : 'አጠቃላይ ሰብሎች'} ለማምረት በአሁኑ ወቅት ምን ማድረግ አለብኝ? ዝርዝር የእርሻ ምክር ይስጡኝ።`
      : `What should I do to farm ${crop ? crop : 'crops'} in ${region ? region : 'Ethiopia'} during the current season? Give me detailed farming advice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || (language === "am" ? "ምክር ማግኘት አልተቻለም" : "Could not get advice");

    return new Response(JSON.stringify({ 
      advice,
      season: currentSeason
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Weather advice AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
