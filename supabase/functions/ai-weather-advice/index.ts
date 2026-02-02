import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ethiopian Regional Weather Patterns and Agricultural Zones
const ETHIOPIAN_AGRO_ZONES = {
  tigray: {
    zone: "Northern Highlands",
    rainfall: { annual: "450-700mm", pattern: "unimodal (June-September)" },
    temperature: { min: 10, max: 28 },
    elevation: "1500-3000m",
    soilTypes: ["Vertisols", "Cambisols", "Luvisols"],
    majorCrops: ["ጤፍ (Teff)", "ስንዴ (Wheat)", "ገብስ (Barley)", "ማሽላ (Sorghum)"],
    challenges: ["ድርቅ", "የአፈር መሸርሸር"],
  },
  amhara: {
    zone: "Central Highlands",
    rainfall: { annual: "800-1400mm", pattern: "bimodal in east, unimodal in west" },
    temperature: { min: 8, max: 25 },
    elevation: "1800-4000m",
    soilTypes: ["Nitosols", "Vertisols", "Luvisols"],
    majorCrops: ["ጤፍ (Teff)", "ስንዴ (Wheat)", "በቆሎ (Maize)", "ሽምብራ (Chickpea)", "ምስር (Lentils)"],
    challenges: ["የበረዶ ጉዳት", "ውሃ ማጠር"],
  },
  oromia: {
    zone: "Diverse - Highlands to Rift Valley",
    rainfall: { annual: "600-2000mm", pattern: "varies by area" },
    temperature: { min: 15, max: 30 },
    elevation: "500-4000m",
    soilTypes: ["Nitosols", "Andosols", "Vertisols"],
    majorCrops: ["ቡና (Coffee)", "ጤፍ (Teff)", "በቆሎ (Maize)", "ስንዴ (Wheat)", "እንሰት (Enset)"],
    challenges: ["ጎርፍ", "ተባይ"],
  },
  snnpr: {
    zone: "Southern Highlands",
    rainfall: { annual: "1000-1800mm", pattern: "bimodal" },
    temperature: { min: 12, max: 26 },
    elevation: "500-3500m",
    soilTypes: ["Nitosols", "Andosols"],
    majorCrops: ["እንሰት (Enset)", "ቡና (Coffee)", "ፍራፍሬ (Fruits)", "ቅመማ ቅመም (Spices)"],
    challenges: ["ከመጠን በላይ ዝናብ", "የአፈር ኮረት"],
  },
  sidama: {
    zone: "Southern Highlands",
    rainfall: { annual: "1200-1600mm", pattern: "bimodal" },
    temperature: { min: 14, max: 24 },
    elevation: "1500-3000m",
    soilTypes: ["Nitosols", "Andosols"],
    majorCrops: ["ቡና (Coffee)", "እንሰት (Enset)", "ጫት (Chat)", "በቆሎ (Maize)"],
    challenges: ["የቡና በሽታዎች"],
  },
  afar: {
    zone: "Lowlands (Pastoral)",
    rainfall: { annual: "150-500mm", pattern: "erratic" },
    temperature: { min: 25, max: 45 },
    elevation: "below 1000m",
    soilTypes: ["Arenosols", "Calcisols"],
    majorCrops: ["የከብት እርባታ (Livestock)", "ጥጥ (Cotton)", "ተምር (Dates)"],
    challenges: ["ከፍተኛ ድርቅ", "የውሃ እጥረት"],
  },
  somali: {
    zone: "Eastern Lowlands (Agro-pastoral)",
    rainfall: { annual: "200-600mm", pattern: "bimodal but unreliable" },
    temperature: { min: 20, max: 38 },
    elevation: "300-1500m",
    soilTypes: ["Arenosols", "Vertisols"],
    majorCrops: ["የከብት እርባታ (Livestock)", "ማሽላ (Sorghum)", "በቆሎ (Maize)"],
    challenges: ["ድርቅ", "የግጦሽ እጥረት"],
  },
  benishangul: {
    zone: "Western Lowlands",
    rainfall: { annual: "900-1400mm", pattern: "unimodal (May-October)" },
    temperature: { min: 18, max: 35 },
    elevation: "500-2000m",
    soilTypes: ["Vertisols", "Nitosols"],
    majorCrops: ["ሰሊጥ (Sesame)", "ማሽላ (Sorghum)", "በቆሎ (Maize)", "ጥጥ (Cotton)"],
    challenges: ["ወባ", "የትራንስፖርት ችግር"],
  },
  gambela: {
    zone: "Western Lowlands (Humid)",
    rainfall: { annual: "1000-1500mm", pattern: "unimodal" },
    temperature: { min: 20, max: 38 },
    elevation: "400-2000m",
    soilTypes: ["Fluvisols", "Gleysols"],
    majorCrops: ["በቆሎ (Maize)", "ማሽላ (Sorghum)", "ሩዝ (Rice)"],
    challenges: ["ጎርፍ", "ወባ"],
  },
  harari: {
    zone: "Eastern Highlands",
    rainfall: { annual: "600-900mm", pattern: "bimodal" },
    temperature: { min: 14, max: 26 },
    elevation: "1800-2000m",
    soilTypes: ["Cambisols", "Luvisols"],
    majorCrops: ["ጫት (Chat)", "ቡና (Coffee)", "ፍራፍሬ (Fruits)", "አትክልት (Vegetables)"],
    challenges: ["የውሃ እጥረት"],
  },
  addis: {
    zone: "Central Highlands (Urban Agriculture)",
    rainfall: { annual: "1000-1200mm", pattern: "unimodal" },
    temperature: { min: 7, max: 23 },
    elevation: "2300-3000m",
    soilTypes: ["Vertisols", "Cambisols"],
    majorCrops: ["አትክልት (Vegetables)", "አበባ (Flowers)", "የወተት ምርት (Dairy)"],
    challenges: ["የመሬት እጥረት", "ብክለት"],
  },
  dire: {
    zone: "Eastern Semi-arid",
    rainfall: { annual: "500-700mm", pattern: "bimodal but erratic" },
    temperature: { min: 18, max: 32 },
    elevation: "1200-1500m",
    soilTypes: ["Cambisols", "Luvisols"],
    majorCrops: ["ጫት (Chat)", "አትክልት (Vegetables)", "ፍራፍሬ (Fruits)"],
    challenges: ["የውሃ እጥረት", "ከፍተኛ ሙቀት"],
  },
};

// Ethiopian seasons and agricultural calendar
function getEthiopianSeasonDetails(): { 
  season: string; 
  seasonAm: string; 
  month: string;
  activities: string[];
  activitiesAm: string[];
  warnings: string[];
  warningsAm: string[];
} {
  const month = new Date().getMonth();
  
  if (month >= 5 && month <= 8) {
    return { 
      season: "Kiremt (Main Rainy Season)", 
      seasonAm: "ክረምት (ዋናው የዝናብ ወቅት)", 
      month: "June-September",
      activities: [
        "Plant teff, wheat, maize, barley, sorghum",
        "Apply fertilizers early in the season",
        "Control weeds regularly",
        "Monitor for pests and diseases",
        "Prepare drainage for excess water"
      ],
      activitiesAm: [
        "ጤፍ፣ ስንዴ፣ በቆሎ፣ ገብስ፣ ማሽላ ይዘሩ",
        "ማዳበሪያ በወቅቱ ይጨምሩ",
        "አረሙን በተከታታይ ያስወግዱ",
        "ተባይና በሽታ ይቆጣጠሩ",
        "ለጎርፍ የማስወጫ ቦይ ያዘጋጁ"
      ],
      warnings: [
        "Heavy rainfall may cause flooding",
        "Waterlogging risk in lowland areas",
        "Army worm outbreak possible",
        "Fungal diseases spread quickly"
      ],
      warningsAm: [
        "ከባድ ዝናብ ጎርፍ ሊያስከትል ይችላል",
        "ዝቅተኛ ቦታዎች ውሃ ሊያጥለቀልቃቸው ይችላል",
        "የጦር ትል ወረርሽኝ ሊኖር ይችላል",
        "የፈንገስ በሽታዎች በፍጥነት ይሰራጫሉ"
      ]
    };
  } else if (month >= 9 && month <= 10) {
    return { 
      season: "Tseday (Post-Rainy/Harvest)", 
      seasonAm: "ጸደይ (ድህረ-ዝናብ/የመከር ወቅት)", 
      month: "October-November",
      activities: [
        "Harvest teff, sorghum, maize crops",
        "Proper drying and storage of grains",
        "Prepare threshing areas",
        "Sort and grade products for market",
        "Sell when prices are reasonable"
      ],
      activitiesAm: [
        "ጤፍ፣ ማሽላ፣ በቆሎ ይሰብስቡ",
        "እህሉን በደረቅ ቦታ ያድርቁና ያከማቹ",
        "የውቂያ ቦታ ያዘጋጁ",
        "ለገበያ ምርቱን ይመድቡ",
        "ዋጋ ሲጥም ይሽጡ"
      ],
      warnings: [
        "Store grains properly to prevent weevil damage",
        "Don't sell everything at once - prices are low",
        "Watch for post-harvest losses",
        "Prepare land for irrigation crops"
      ],
      warningsAm: [
        "ጎተራ ተባይ እንዳይበላው በደንብ ያከማቹ",
        "ዋጋው ዝቅ ስለሚል ሁሉንም አንድ ጊዜ አይሽጡ",
        "የመከር በኋላ ብክነት ይጠንቀቁ",
        "ለመስኖ ሰብል መሬት ያዘጋጁ"
      ]
    };
  } else if (month >= 11 || month <= 1) {
    return { 
      season: "Bega (Dry Season)", 
      seasonAm: "በጋ (ደረቅ ወቅት)", 
      month: "December-February",
      activities: [
        "Irrigated vegetable farming",
        "Coffee harvesting and processing",
        "Land preparation for next season",
        "Livestock management and feeding",
        "Market your stored grains at better prices"
      ],
      activitiesAm: [
        "በመስኖ አትክልት ይዝሩ",
        "ቡና ይሰብስቡና ያዘጋጁ",
        "ለሚቀጥለው ወቅት መሬት ያዘጋጁ",
        "የእንስሳት እንክብካቤና ምግብ",
        "ያከማቹትን እህል በተሻለ ዋጋ ይሽጡ"
      ],
      warnings: [
        "Water scarcity for irrigation",
        "Frost risk in highland areas",
        "Livestock feed shortage",
        "Fire risk in dry vegetation"
      ],
      warningsAm: [
        "ለመስኖ ውሃ ሊያጥር ይችላል",
        "ደጋማ አካባቢ በረዶ ሊጥል ይችላል",
        "የእንስሳት መኖ ሊያጥር ይችላል",
        "በደረቁ ሳር ላይ የእሳት አደጋ"
      ]
    };
  } else {
    return { 
      season: "Belg (Small Rainy Season)", 
      seasonAm: "በልግ (አጭር የዝናብ ወቅት)", 
      month: "March-May",
      activities: [
        "Plant short-season crops (maize, haricot beans)",
        "Prepare main season seeds",
        "Soil preparation and plowing",
        "Apply compost and manure",
        "Plant potatoes in suitable areas"
      ],
      activitiesAm: [
        "አጭር ወቅት ሰብል ይዘሩ (በቆሎ፣ ቦሎቄ)",
        "የዋናውን ወቅት ዘር ያዘጋጁ",
        "መሬት ያዘጋጁና ያርሱ",
        "ኮምፖስትና ፍግ ይጨምሩ",
        "በሚስማማ አካባቢ ድንች ይዘሩ"
      ],
      warnings: [
        "Belg rains are unpredictable",
        "Don't plant too much - risk of failure",
        "Pest buildup from previous season",
        "Prepare for main Kiremt season"
      ],
      warningsAm: [
        "የበልግ ዝናብ እርግጠኛ አይደለም",
        "ብዙ አይዝሩ - ሊከስር ይችላል",
        "ካለፈው ወቅት የቀረ ተባይ ሊኖር ይችላል",
        "ለዋናው ክረምት ይዘጋጁ"
      ]
    };
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

    const currentSeason = getEthiopianSeasonDetails();
    const regionKey = region?.toLowerCase() as keyof typeof ETHIOPIAN_AGRO_ZONES;
    const regionData = regionKey && ETHIOPIAN_AGRO_ZONES[regionKey] ? ETHIOPIAN_AGRO_ZONES[regionKey] : null;
    const regionsJson = JSON.stringify(ETHIOPIAN_AGRO_ZONES, null, 2);

    const systemPrompt = language === "am" 
      ? `እርስዎ የኢትዮጵያ የእርሻ አማካሪ ባለሙያ ነዎት። በኢትዮጵያ የአየር ሁኔታ፣ ወቅቶች እና የእርሻ ዘዴዎች ላይ ጥልቅ እውቀት አለዎት።
      
ሁልጊዜ በአማርኛ ብቻ ይመልሱ።

📅 **የአሁኑ ወቅት:** ${currentSeason.seasonAm}
📆 **ወራት:** ${currentSeason.month}

✅ **በዚህ ወቅት የሚሰሩ ስራዎች:**
${currentSeason.activitiesAm.map((a, i) => `${i + 1}. ${a}`).join('\n')}

⚠️ **ማስጠንቀቂያዎች:**
${currentSeason.warningsAm.map(w => `• ${w}`).join('\n')}

🗺️ **የኢትዮጵያ ክልሎች መረጃ:**
${regionsJson}

${regionData ? `
📍 **የተመረጠው ክልል መረጃ:**
- የአየር ዞን: ${regionData.zone}
- ዓመታዊ ዝናብ: ${regionData.rainfall.annual}
- የሙቀት መጠን: ${regionData.temperature.min}°C - ${regionData.temperature.max}°C
- ከፍታ: ${regionData.elevation}
- ዋና ሰብሎች: ${regionData.majorCrops.join(', ')}
- ዋና ተግዳሮቶች: ${regionData.challenges.join(', ')}
` : ''}

ምላሾችዎን በሚከተለው መዋቅር ያቅርቡ:

🌤️ **የአሁኑ ወቅት:** [ወቅቱን እና ባህሪያቱን ይግለጹ]

🌱 **የዘር ምክር:** [በዚህ ወቅት ምን እንደሚዘሩ ይምከሩ]

🌾 **የመከር ጊዜ:** [መቼ እንደሚሰበስቡ ይግለጹ]

💧 **የውሃ አያያዝ:** [የመስኖ እና የውሃ ምክር ይስጡ]

🐛 **ተባይ ማስጠንቀቂያ:** [በዚህ ወቅት የሚመጡ ተባዮችና መከላከያ]

🌡️ **የአየር ሁኔታ ተጽዕኖ:** [የአየር ሁኔታ እንዴት ሰብሉን እንደሚነካው]

📋 **ተጨማሪ ምክር:** [ሌሎች አስፈላጊ ምክሮች]

ለኢትዮጵያ ገበሬዎች የተሻሻሉ ዘመናዊና ባህላዊ የእርሻ ዘዴዎችን በቀላል አማርኛ ያካፍሉ። Emoji ይጠቀሙ።`
      : `You are an Ethiopian agricultural advisor expert. You have deep knowledge of Ethiopian weather patterns, seasons, and farming techniques.

📅 **Current Season:** ${currentSeason.season}
📆 **Months:** ${currentSeason.month}

✅ **Recommended Activities:**
${currentSeason.activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}

⚠️ **Warnings:**
${currentSeason.warnings.map(w => `• ${w}`).join('\n')}

🗺️ **Ethiopian Regions Data:**
${regionsJson}

${regionData ? `
📍 **Selected Region Information:**
- Agro-ecological Zone: ${regionData.zone}
- Annual Rainfall: ${regionData.rainfall.annual}
- Temperature Range: ${regionData.temperature.min}°C - ${regionData.temperature.max}°C
- Elevation: ${regionData.elevation}
- Major Crops: ${regionData.majorCrops.join(', ')}
- Main Challenges: ${regionData.challenges.join(', ')}
` : ''}

Structure your responses:

🌤️ **Current Season:** [Describe the season and characteristics]

🌱 **Planting Advice:** [What to plant now]

🌾 **Harvest Time:** [When to harvest]

💧 **Water Management:** [Irrigation advice]

🐛 **Pest Warning:** [Seasonal pests and prevention]

🌡️ **Weather Impact:** [How weather affects crops]

📋 **Additional Tips:** [Other important advice]

Share both modern and traditional Ethiopian farming techniques in simple language. Use emojis.`;

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
      season: currentSeason,
      regionData: regionData
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
