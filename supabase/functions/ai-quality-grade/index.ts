import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ethiopian product quality standards
const QUALITY_STANDARDS = {
  grains: {
    grades: ["A1 (Premium)", "A2 (High)", "B1 (Standard)", "B2 (Fair)", "C (Low)"],
    criteria: {
      am: "ንጽህና፣ ደረቅነት፣ የተባይ ጉዳት፣ የቀለም ወጥነት፣ መጠን",
      en: "Cleanliness, moisture content, pest damage, color uniformity, size"
    }
  },
  coffee: {
    grades: ["Grade 1 (Specialty)", "Grade 2 (Premium)", "Grade 3 (Commercial)", "Grade 4 (Standard)", "Grade 5 (Under Grade)"],
    criteria: {
      am: "የፍሬ መጠን፣ ጉድለት ብዛት፣ ቀለም፣ መዓዛ፣ ጣዕም",
      en: "Bean size, defect count, color, aroma, cup quality"
    }
  },
  vegetables: {
    grades: ["Extra Class", "Class I", "Class II", "Class III"],
    criteria: {
      am: "ትኩስነት፣ ቅርጽ፣ ቀለም፣ የተባይ ጉዳት፣ ብስለት",
      en: "Freshness, shape, color, pest damage, ripeness"
    }
  },
  fruits: {
    grades: ["Extra Class", "Class I", "Class II", "Class III"],
    criteria: {
      am: "ብስለት፣ መጠን፣ ቀለም፣ ጉዳት፣ ጣዕም",
      en: "Ripeness, size, color, damage, taste"
    }
  },
  honey: {
    grades: ["White (Premium)", "Light Amber", "Amber", "Dark"],
    criteria: {
      am: "ቀለም፣ ንጽህና፣ እርጥበት፣ የአበባ ምንጭ",
      en: "Color, purity, moisture, floral source"
    }
  },
  oilseeds: {
    grades: ["Grade 1", "Grade 2", "Grade 3", "FAQ (Fair Average Quality)"],
    criteria: {
      am: "የዘይት ይዘት፣ እርጥበት፣ ቆሻሻ፣ የተሰባበሩ ዘሮች",
      en: "Oil content, moisture, impurities, broken seeds"
    }
  },
  livestock: {
    grades: ["Prime", "Choice", "Good", "Standard"],
    criteria: {
      am: "ክብደት፣ ጤና፣ እድሜ፣ ዝርያ፣ አመጋገብ",
      en: "Weight, health, age, breed, feeding condition"
    }
  },
  dairy: {
    grades: ["Grade A", "Grade B", "Grade C"],
    criteria: {
      am: "ስብ ይዘት፣ ፕሮቲን፣ ባክቴሪያ ብዛት፣ ትኩስነት",
      en: "Fat content, protein, bacterial count, freshness"
    }
  },
  legumes: {
    grades: ["Grade 1", "Grade 2", "Grade 3", "Under Grade"],
    criteria: {
      am: "መጠን፣ ቀለም፣ ንጽህና፣ እርጥበት፣ ጉዳት",
      en: "Size, color, cleanliness, moisture, damage"
    }
  },
  spices: {
    grades: ["Premium", "Standard", "Fair"],
    criteria: {
      am: "መዓዛ፣ ቀለም፣ ንጽህና፣ ደረቅነት",
      en: "Aroma, color, purity, dryness"
    }
  }
};

// Price adjustment based on grade - using functions to handle duplicates
function getGradePriceMultiplier(grade: string, category: string): number {
  const multipliers: Record<string, Record<string, number>> = {
    grains: {
      "A1 (Premium)": 1.3,
      "A2 (High)": 1.15,
      "B1 (Standard)": 1.0,
      "B2 (Fair)": 0.85,
      "C (Low)": 0.7,
    },
    coffee: {
      "Grade 1 (Specialty)": 1.5,
      "Grade 2 (Premium)": 1.25,
      "Grade 3 (Commercial)": 1.0,
      "Grade 4 (Standard)": 0.8,
      "Grade 5 (Under Grade)": 0.6,
    },
    vegetables: {
      "Extra Class": 1.3,
      "Class I": 1.1,
      "Class II": 1.0,
      "Class III": 0.8,
    },
    fruits: {
      "Extra Class": 1.3,
      "Class I": 1.1,
      "Class II": 1.0,
      "Class III": 0.8,
    },
    honey: {
      "White (Premium)": 1.4,
      "Light Amber": 1.2,
      "Amber": 1.0,
      "Dark": 0.8,
    },
    oilseeds: {
      "Grade 1": 1.2,
      "Grade 2": 1.0,
      "Grade 3": 0.85,
      "FAQ (Fair Average Quality)": 0.7,
    },
    livestock: {
      "Prime": 1.35,
      "Choice": 1.15,
      "Good": 1.0,
      "Standard": 0.85,
    },
    dairy: {
      "Grade A": 1.2,
      "Grade B": 1.0,
      "Grade C": 0.8,
    },
    legumes: {
      "Grade 1": 1.2,
      "Grade 2": 1.0,
      "Grade 3": 0.85,
      "Under Grade": 0.65,
    },
    spices: {
      "Premium": 1.25,
      "Standard": 1.0,
      "Fair": 0.8,
    },
  };

  return multipliers[category]?.[grade] || 1.0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, category, productName, language = "am" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const standards = QUALITY_STANDARDS[category as keyof typeof QUALITY_STANDARDS] || QUALITY_STANDARDS.grains;

    const systemPrompt = language === "am"
      ? `እርስዎ የኢትዮጵያ ግብርና ምርቶች ጥራት ደረጃ ባለሙያ ነዎት። ምርቱን ከምስሉ በመመልከት ደረጃውን ይወስኑ።

ለ${category} ያሉት ደረጃዎች: ${standards.grades.join(", ")}

የመደብ መስፈርቶች: ${standards.criteria.am}

ምላሽዎን በሚከተለው ቅርጸት ያቅርቡ:

📊 **ደረጃ:** [ከላይ ካሉት ደረጃዎች አንዱን ይምረጡ]

🔍 **ምልከታዎች:**
[ከምስሉ የተመለከቱትን ዋና ነጥቦች ይዘርዝሩ]

✅ **ጥንካሬዎች:**
[የምርቱ ጥሩ ጎኖች]

⚠️ **ማሻሻያ የሚያስፈልጋቸው:**
[ካሉ ችግሮች ወይም ማሻሻያዎች]

💰 **የዋጋ ተጽዕኖ:**
[ይህ ደረጃ በዋጋ ላይ ያለው ተጽዕኖ]

💡 **ምክር:**
[ለገበሬው ተግባራዊ ምክር]`
      : `You are an Ethiopian agricultural product quality grading expert. Analyze the product image and determine its grade.

Available grades for ${category}: ${standards.grades.join(", ")}

Grading criteria: ${standards.criteria.en}

Provide your response in this format:

📊 **Grade:** [Select one of the grades above]

🔍 **Observations:**
[Key observations from the image]

✅ **Strengths:**
[Positive aspects of the product]

⚠️ **Areas for Improvement:**
[Any issues or suggestions]

💰 **Price Impact:**
[How this grade affects pricing]

💡 **Recommendations:**
[Practical advice for the farmer]`;

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
          { 
            role: "user", 
            content: [
              { 
                type: "text", 
                text: language === "am" 
                  ? `እባክዎ ይህን ${productName || category} ምርት ይመርምሩና ደረጃውን ይወስኑ።`
                  : `Please analyze this ${productName || category} product and determine its quality grade.`
              },
              { 
                type: "image_url", 
                image_url: { url: imageUrl }
              }
            ]
          }
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

    // Extract grade from response
    let detectedGrade = "";
    for (const grade of standards.grades) {
      if (analysis.includes(grade)) {
        detectedGrade = grade;
        break;
      }
    }

    // Get price multiplier
    const priceMultiplier = getGradePriceMultiplier(detectedGrade, category);

    return new Response(JSON.stringify({ 
      analysis,
      grade: detectedGrade,
      priceMultiplier,
      availableGrades: standards.grades,
      criteria: standards.criteria
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Quality grading error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
