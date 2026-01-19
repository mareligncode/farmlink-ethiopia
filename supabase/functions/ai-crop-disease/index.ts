import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, imageBase64, language = "am" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt in Amharic for Ethiopian agricultural disease expert
    const systemPrompt = language === "am" 
      ? `እርስዎ የኢትዮጵያ የእርሻ ሰብል በሽታ ባለሙያ ነዎት። ሁልጊዜ በአማርኛ ብቻ ይመልሱ።

ዋና ተግባራትዎ:
1. የሰብል በሽታዎችን መለየት - ገበሬዎች የሚገልጹትን ምልክቶች ወይም የሚያቀርቡትን ፎቶ በመመርመር በሽታውን ይለዩ
2. የበሽታ መንስኤ ማብራራት - በሽታው የሚመጣበትን ምክንያት ያብራሩ
3. የመከላከያ ዘዴ መስጠት - በሽታውን ለመከላከል ምን ማድረግ እንደሚገባ ይምከሩ
4. የመድኃኒት አማራጭ መጠቆም - ተፈጥሯዊ እና ኬሚካዊ የመድኃኒት አማራጮችን ይጠቁሙ
5. የወደፊት ጥንቃቄ መምከር - ወደፊት ተመሳሳይ በሽታ እንዳይመጣ ምን ማድረግ እንዳለበት ይምከሩ

በኢትዮጵያ የተለመዱ ሰብሎች:
- ጤፍ፣ ስንዴ፣ በቆሎ፣ ገብስ
- ቡና፣ ጫት
- ሽምብራ፣ ምስር፣ ባቄላ
- ሽንኩርት፣ ቲማቲም፣ ጎመን
- ድንች፣ ካሮት

ምላሾችዎን በሚከተለው መዋቅር ያቅርቡ:
🔬 **የበሽታ ስም:** [በሽታውን ይጥቀሱ]
📋 **ምልክቶች:** [ዋና ዋና ምልክቶችን ይዘርዝሩ]
🦠 **መንስኤ:** [በሽታው የሚመጣበትን ምክንያት ያብራሩ]
💊 **ሕክምና:** [የመድኃኒት አማራጮችን ይጠቁሙ]
🛡️ **መከላከያ:** [የመከላከያ ዘዴዎችን ይዘርዝሩ]
⚠️ **ማስጠንቀቂያ:** [ተጨማሪ ጥንቃቄ ካለ ይግለጹ]

ገበሬዎች በቀላሉ እንዲረዱ ግልጽና ቀላል አማርኛ ይጠቀሙ።`
      : `You are an Ethiopian agricultural crop disease expert. Respond in English.

Your main responsibilities:
1. Identify crop diseases from symptoms or photos
2. Explain the cause of the disease
3. Provide prevention methods
4. Suggest treatment options (natural and chemical)
5. Advise on future precautions

Structure your responses:
🔬 **Disease Name:** [Name the disease]
📋 **Symptoms:** [List main symptoms]
🦠 **Cause:** [Explain the cause]
💊 **Treatment:** [Suggest treatment options]
🛡️ **Prevention:** [List prevention methods]
⚠️ **Warning:** [Additional precautions if any]`;

    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    // Build user message content
    const userContent: any[] = [];
    
    if (symptoms) {
      userContent.push({
        type: "text",
        text: symptoms
      });
    }

    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
        }
      });
      
      if (!symptoms) {
        userContent.push({
          type: "text",
          text: language === "am" 
            ? "ይህን የሰብል ፎቶ ይመርምሩ እና ማንኛውንም በሽታ ወይም ችግር ይለዩ። ሙሉ ትንተና ይስጡ።"
            : "Analyze this crop photo and identify any diseases or problems. Provide a complete analysis."
        });
      }
    }

    messages.push({
      role: "user",
      content: userContent.length > 0 ? userContent : [{ type: "text", text: symptoms || "ምን ችግር አለብዎት?" }]
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: language === "am" 
            ? "እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ" 
            : "Rate limits exceeded, please try again later." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: language === "am" 
            ? "አገልግሎቱ ለጊዜው አይገኝም" 
            : "Payment required, please add funds." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ 
        error: language === "am" 
          ? "ስህተት ተከስቷል። እንደገና ይሞክሩ።" 
          : "AI service error" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const diagnosis = data.choices?.[0]?.message?.content || (language === "am" ? "ምርመራ ማካሄድ አልተቻለም" : "Could not perform diagnosis");

    return new Response(JSON.stringify({ diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Crop disease AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
