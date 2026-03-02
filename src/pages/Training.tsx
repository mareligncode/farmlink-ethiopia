import React, { useState } from 'react';
import { BookOpen, Sprout, Droplets, Bug, Wheat, Sun, ChevronRight, ChevronLeft, CheckCircle2, PlayCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  titleEn: string;
  titleAm: string;
  descEn: string;
  descAm: string;
  icon: React.ElementType;
  color: string;
  steps: { titleEn: string; titleAm: string; contentEn: string; contentAm: string }[];
}

const trainingModules: Lesson[] = [
  {
    id: 'soil',
    titleEn: 'Soil Preparation',
    titleAm: 'የአፈር ዝግጅት',
    descEn: 'Learn proper soil preparation techniques for Ethiopian farming',
    descAm: 'ለኢትዮጵያ ግብርና ተገቢ የአፈር ዝግጅት ቴክኒኮችን ይማሩ',
    icon: Sprout,
    color: 'bg-amber-500/10 text-amber-600',
    steps: [
      {
        titleEn: 'Soil Testing',
        titleAm: 'የአፈር ምርመራ',
        contentEn: '1. Collect soil from 5-6 spots in your field at 15-20cm depth\n2. Mix samples together thoroughly\n3. Send to the nearest agricultural research center\n4. Test for: pH, Nitrogen, Phosphorus, Potassium, Organic matter\n\n📌 Ethiopian soils vary greatly by region:\n- Highland (Dega): Usually acidic, needs lime\n- Mid-altitude (Woina Dega): Often balanced\n- Lowland (Kolla): May be alkaline\n\n💡 Tip: Test every 2-3 years before planting season',
        contentAm: '1. ከ5-6 ቦታ 15-20 ሴ.ሜ ጥልቀት ያለ አፈር ይሰብስቡ\n2. ናሙናዎችን በደንብ ይቀላቅሉ\n3. ወደ ቅርብ ግብርና ምርምር ማዕከል ይላኩ\n4. የሚፈተሽ: pH, ናይትሮጅን, ፎስፈረስ, ፖታሲየም\n\n📌 የኢትዮጵያ አፈር በክልል ይለያያል:\n- ደጋ: ብዙ ጊዜ አሲዳማ, ኖራ ያስፈልጋል\n- ወይና ደጋ: ብዙ ጊዜ ሚዛናዊ\n- ቆላ: አልካላይን ሊሆን ይችላል\n\n💡 ምክር: በየ2-3 ዓመቱ ከመዝራት በፊት ይፈትሹ'
      },
      {
        titleEn: 'Land Clearing & Plowing',
        titleAm: 'መሬት ማጽዳትና ማረስ',
        contentEn: '1. Remove crop residues, weeds, and stones\n2. First plowing (Mäkäfäl): Deep plow 20-25cm after first rains\n3. Second plowing (cross-plow): 2-3 weeks later, perpendicular direction\n4. Third plowing: Just before sowing for fine seedbed\n\n🐂 Oxen plowing tips:\n- Use well-rested, fed oxen\n- Plow when soil is moist but not waterlogged\n- Maintain consistent depth\n\n⚠️ Avoid: Over-plowing destroys soil structure',
        contentAm: '1. ቅሪት ሰብል, አረም, ድንጋይ ያስወግዱ\n2. የመጀመሪያ ማረስ (መከፈል): ከመጀመሪያ ዝናብ በኋላ 20-25 ሴ.ሜ\n3. ሁለተኛ ማረስ: ከ2-3 ሳምንት በኋላ በተቃራኒ አቅጣጫ\n4. ሶስተኛ ማረስ: ከመዝራት በፊት ለስላሳ አልጋ\n\n🐂 በበሬ ማረስ ምክር:\n- የተዘጋጁ, የተመገቡ በሬዎች ይጠቀሙ\n- አፈር እርጥብ ሲሆን ይቆፍሩ\n\n⚠️ ማስጠንቀቂያ: ከመጠን በላይ ማረስ አፈርን ያጠፋል'
      },
      {
        titleEn: 'Composting & Fertilization',
        titleAm: 'ኮምፖስትና ማዳበሪያ',
        contentEn: '1. Collect: crop residues, animal manure, kitchen waste, leaves\n2. Layer: green (nitrogen) + brown (carbon) materials in 1:3 ratio\n3. Add water to keep moist (like wrung sponge)\n4. Turn pile every 2-3 weeks\n5. Ready in 2-3 months when dark brown and earthy\n\n📊 Application rates:\n- Compost: 5-10 tons/hectare\n- DAP: 100kg/hectare (at planting)\n- Urea: 50-100kg/hectare (split: at planting + 30 days)\n\n💰 Save money: 50% compost + 50% chemical = best results',
        contentAm: '1. ሰብስቡ: የሰብል ቅሪት, ፍግ, የወጥ ቤት ቆሻሻ, ቅጠሎች\n2. ደረጃ: አረንጓዴ + ቡኒ ቁሳቁሶችን በ1:3 ሬሾ\n3. ውሃ ጨምሩ እርጥብ እንዲሆን\n4. በየ2-3 ሳምንቱ ገልብጡ\n5. በ2-3 ወር ጥቁር ቡኒ ሲሆን ዝግጁ ነው\n\n📊 የአጠቃቀም መጠን:\n- ኮምፖስት: 5-10 ቶን/ሄክታር\n- DAP: 100ኪ.ግ/ሄክታር\n- ዩሪያ: 50-100ኪ.ግ/ሄክታር\n\n💰 ቆጥቡ: 50% ኮምፖስት + 50% ኬሚካል = ምርጥ ውጤት'
      }
    ]
  },
  {
    id: 'irrigation',
    titleEn: 'Irrigation Techniques',
    titleAm: 'የመስኖ ቴክኒኮች',
    descEn: 'Water management strategies for Ethiopian conditions',
    descAm: 'ለኢትዮጵያ ሁኔታ የውሃ አያያዝ ስትራቴጂዎች',
    icon: Droplets,
    color: 'bg-blue-500/10 text-blue-600',
    steps: [
      {
        titleEn: 'Water Harvesting',
        titleAm: 'ውሃ መሰብሰብ',
        contentEn: '1. Roof water collection: Use gutters to direct rain to storage tanks\n2. Micro-catchments: Create small basins (half-moon) around trees\n3. Farm ponds: Dig 3x3x2m ponds lined with plastic/clay\n4. Percolation pits: 1x1x1m holes filled with stones for groundwater recharge\n\n🏔️ Ethiopian highland technique:\n- Terracing: Build stone/earth bunds along contours\n- Check dams in gullies to slow runoff\n\n💧 Storage: Cover ponds to reduce evaporation by 30-50%',
        contentAm: '1. የጣራ ውሃ: ጎርጎሮ በመጠቀም ዝናብ ወደ ታንክ ያዙ\n2. ማይክሮ ማጠራቀሚያ: በዛፎች ዙሪያ ትንሽ ገንዳ ይስሩ\n3. የእርሻ ገንዳ: 3x3x2ሜ ገንዳ ቆፍሩ\n4. የመሳብ ጉድጓድ: 1x1x1ሜ በድንጋይ ሙሉ\n\n🏔️ የደጋ ቴክኒክ:\n- ቴራሲንግ: በመሬት ገጽ ላይ ድንጋይ/አፈር\n\n💧 ማከማቸት: ገንዳ ይሸፍኑ ትነት 30-50% ይቀንሳል'
      },
      {
        titleEn: 'Drip & Furrow Irrigation',
        titleAm: 'ጠብታና ቦይ መስኖ',
        contentEn: '1. Drip irrigation (best for vegetables):\n   - Use plastic bottles with small holes\n   - Or buy affordable drip kits (2000-5000 ETB)\n   - Saves 50-70% water vs flooding\n\n2. Furrow irrigation:\n   - Dig channels 15-20cm deep, 60cm apart\n   - Grade furrows with slight slope (0.5-1%)\n   - Alternate furrow method: water every other row\n\n3. Schedule:\n   - Sandy soil: Water every 2-3 days\n   - Clay soil: Water every 5-7 days\n   - Check: Insert finger 5cm deep - if dry, water needed',
        contentAm: '1. ጠብታ መስኖ (ለአትክልት ምርጥ):\n   - ትንሽ ቀዳዳ ያለው ፕላስቲክ ጠርሙስ\n   - ወይም ተመጣጣኝ ዋጋ ያለው ኪት ይግዙ\n   - ከጎርፍ 50-70% ውሃ ይቆጥባል\n\n2. ቦይ መስኖ:\n   - 15-20 ሴ.ሜ ጥልቀት, 60 ሴ.ሜ ርቀት ቦይ ቆፍሩ\n   - ትንሽ ዳገት ያድርጉ\n\n3. ፕሮግራም:\n   - አሸዋማ: በየ2-3 ቀን\n   - ሸክላ: በየ5-7 ቀን\n   - ፈትሹ: ጣት 5 ሴ.ሜ ክተቱ - ደረቅ ከሆነ ውሃ ያስፈልጋል'
      }
    ]
  },
  {
    id: 'pest',
    titleEn: 'Pest & Disease Management',
    titleAm: 'ተባይና በሽታ አያያዝ',
    descEn: 'Identify and control common crop pests in Ethiopia',
    descAm: 'በኢትዮጵያ የሚገኙ የተለመዱ ተባዮችን ይለዩና ይቆጣጠሩ',
    icon: Bug,
    color: 'bg-red-500/10 text-red-600',
    steps: [
      {
        titleEn: 'Common Pests & Signs',
        titleAm: 'የተለመዱ ተባዮችና ምልክቶች',
        contentEn: '🐛 Fall Armyworm (FAW):\n- Signs: Holes in leaves, frass (sawdust-like droppings)\n- Affects: Maize, sorghum, teff\n- Season: Peaks during Kiremt\n\n🦗 Stalk Borer:\n- Signs: Dead heart in young plants, holes in stems\n- Affects: Maize, sorghum\n\n🐜 Aphids:\n- Signs: Curled/yellowing leaves, sticky residue\n- Affects: Vegetables, pulses, wheat\n\n🍂 Coffee Berry Disease (CBD):\n- Signs: Dark sunken lesions on berries\n- Affects: Coffee (especially in wet areas)\n\n📸 Use the Disease Diagnosis tool on dashboard for AI-powered identification!',
        contentAm: '🐛 ፎል ዎርም:\n- ምልክት: በቅጠል ላይ ቀዳዳ\n- የሚጎዳ: በቆሎ, ማሽላ, ጤፍ\n- ወቅት: ክረምት\n\n🦗 ስቶክ ቦረር:\n- ምልክት: ወጣት ተክል ይሞታል\n- የሚጎዳ: በቆሎ, ማሽላ\n\n🐜 አፊድ:\n- ምልክት: የተጠቀለለ/ቢጫ ቅጠል\n- የሚጎዳ: አትክልት, ጥራጥሬ\n\n🍂 የቡና ቤሪ በሽታ:\n- ምልክት: በቡና ፍሬ ላይ ጥቁር ነጠብጣብ\n\n📸 AI ምርመራ ለመጠቀም ዳሽቦርድ ላይ ያለውን ይክፈቱ!'
      },
      {
        titleEn: 'Control Methods',
        titleAm: 'የመቆጣጠሪያ ዘዴዎች',
        contentEn: '🌿 Cultural Control (Prevention):\n1. Crop rotation: Don\'t plant same crop 2 years in a row\n2. Early planting: Avoid peak pest periods\n3. Clean fields: Remove crop residues\n4. Resistant varieties: Use improved seeds from research centers\n\n🐦 Biological Control:\n1. Encourage birds (natural predators)\n2. Neem extract spray: Grind neem seeds, soak in water 24hrs\n3. Trichogramma wasps for stalk borer\n\n💊 Chemical Control (Last resort):\n1. Follow dosage instructions exactly\n2. Wear protective gear\n3. Observe pre-harvest interval\n4. Store chemicals away from food/water\n\n⚠️ Always try cultural/biological methods first!',
        contentAm: '🌿 ባህላዊ ቁጥጥር (መከላከል):\n1. ሰብል ማዞር: ተመሳሳይ ሰብል 2 ዓመት አትዝሩ\n2. ቀደም ብሎ መዝራት\n3. ማሳ ማጽዳት\n4. ተቋቋሚ ዝርያዎች ይጠቀሙ\n\n🐦 ባዮሎጂካል:\n1. ወፎችን ያበረታቱ\n2. ኒም ቅጠል ጭማቂ ይረጩ\n\n💊 ኬሚካል (የመጨረሻ አማራጭ):\n1. የመጠን መመሪያ ይከተሉ\n2. መከላከያ ይልበሱ\n3. ከመሰብሰብ በፊት ያለውን ጊዜ ይጠብቁ\n\n⚠️ ሁልጊዜ ባህላዊ/ባዮሎጂካል ዘዴ ቅድሚያ ይስጡ!'
      }
    ]
  },
  {
    id: 'teff',
    titleEn: 'Teff Production Guide',
    titleAm: 'የጤፍ ምርት መመሪያ',
    descEn: 'Complete guide to growing Ethiopia\'s staple grain',
    descAm: 'የኢትዮጵያን ዋና እህል ለማምረት ሙሉ መመሪያ',
    icon: Wheat,
    color: 'bg-yellow-500/10 text-yellow-600',
    steps: [
      {
        titleEn: 'Varieties & Planting',
        titleAm: 'ዝርያዎችና መዝራት',
        contentEn: '🌾 Improved Varieties:\n- Quncho (DZ-Cr-387): White, high yield (2-2.5 t/ha)\n- Magna (DZ-01-196): White, lodging resistant\n- Tsedey (DZ-Cr-37): Brown, early maturing\n- Boset: Good for lowlands\n\n📅 Planting Time:\n- Main season: Late June - mid July (Kiremt)\n- Altitude 1800-2400m: Best growing zone\n\n🌱 Planting Method:\n1. Seed rate: 25-30 kg/hectare (broadcast)\n2. Row planting: 15-20 kg/ha at 20cm spacing (better yields!)\n3. Depth: Just surface broadcast, lightly cover\n4. Seedbed: Fine and firm (3+ plowings)\n\n💡 Row planting increases yield by 20-30% vs broadcast!',
        contentAm: '🌾 የተሻሻሉ ዝርያዎች:\n- ቅናጮ: ነጭ, ከፍተኛ ምርት (2-2.5 ቶን/ሄ)\n- ማኘ: ነጭ, አይወድቅም\n- ጸደይ: ቡኒ, ቀደም ብሎ ይበስላል\n- ቦሰት: ለቆላ ጥሩ\n\n📅 የመዝራት ጊዜ:\n- ዋና ወቅት: ሰኔ መጨረሻ - ሐምሌ አጋማሽ\n- ከ1800-2400ሜ ከፍታ: ምርጥ\n\n🌱 የመዝራት ዘዴ:\n1. 25-30 ኪ.ግ/ሄ (በመበተን)\n2. በረድፍ: 15-20 ኪ.ግ/ሄ በ20 ሴ.ሜ ርቀት\n3. ጥልቀት: ላይ ላይ ብቻ\n\n💡 በረድፍ መዝራት ምርትን 20-30% ይጨምራል!'
      },
      {
        titleEn: 'Care & Harvesting',
        titleAm: 'እንክብካቤና መሰብሰብ',
        contentEn: '🌿 Fertilization:\n- DAP: 100 kg/ha at planting\n- Urea: 50 kg/ha at planting + 50 kg/ha at tillering (30 days)\n- NPS: 100 kg/ha (in NPS areas)\n\n🌱 Weed Management:\n- First weeding: 20-25 days after planting\n- Second weeding: 40-45 days (critical!)\n- Hand weeding is most common\n\n⚠️ Common Problems:\n- Lodging: Don\'t over-apply nitrogen\n- Rust: Use resistant varieties\n- Waterlogging: Ensure drainage\n\n🌾 Harvesting:\n- When panicle turns yellow-brown (90-120 days)\n- Cut at ground level\n- Stack for 3-5 days to dry\n- Thresh on clean floor\n- Yield target: 1.5-2.5 t/ha with good practices',
        contentAm: '🌿 ማዳበሪያ:\n- DAP: 100 ኪ.ግ/ሄ ሲዘራ\n- ዩሪያ: 50 ኪ.ግ/ሄ ሲዘራ + 50 ኪ.ግ/ሄ ከ30 ቀን\n\n🌱 አረም:\n- የመጀመሪያ: ከ20-25 ቀን\n- ሁለተኛ: ከ40-45 ቀን (ወሳኝ!)\n\n⚠️ ችግሮች:\n- መውደቅ: ናይትሮጅን አብዙ\n- ዝገት: ተቋቋሚ ዝርያ ይጠቀሙ\n\n🌾 መሰብሰብ:\n- ፓኒክል ቢጫ-ቡኒ ሲሆን (90-120 ቀን)\n- ከመሬት ቁረጡ\n- 3-5 ቀን ያድርቁ\n- ንጹህ ቦታ ላይ ውቃ\n- ግብ: 1.5-2.5 ቶን/ሄ'
      }
    ]
  },
  {
    id: 'climate',
    titleEn: 'Climate-Smart Farming',
    titleAm: 'የአየር ንብረት ብልህ እርሻ',
    descEn: 'Adapt your farming to changing weather patterns',
    descAm: 'እርሻዎን ለሚለዋወጥ የአየር ሁኔታ ያስማሙ',
    icon: Sun,
    color: 'bg-orange-500/10 text-orange-600',
    steps: [
      {
        titleEn: 'Adaptation Strategies',
        titleAm: 'የማስተካከያ ስትራቴጂዎች',
        contentEn: '🌡️ Ethiopian Climate Changes:\n- Rainfall becoming more unpredictable\n- Temperature increasing 0.2°C per decade\n- More frequent droughts and floods\n\n🛡️ Adaptation Strategies:\n1. Diversify crops: Don\'t rely on one crop\n2. Use drought-tolerant varieties\n3. Agroforestry: Plant trees in cropland\n4. Mulching: Cover soil with crop residues\n5. Conservation tillage: Reduce plowing\n\n🌳 Recommended Trees:\n- Moringa: Fast-growing, nutritious leaves\n- Grevillea: Good shade, doesn\'t compete much\n- Sesbania: Fixes nitrogen in soil\n\n📊 Result: Diversified farms earn 30-50% more consistently',
        contentAm: '🌡️ የኢትዮጵያ አየር ለውጥ:\n- ዝናብ ሊገመት አይችልም\n- ሙቀት በየ10 ዓመቱ 0.2°C ይጨምራል\n\n🛡️ ስትራቴጂዎች:\n1. ሰብል ማበራከት: በአንድ ሰብል አትደገፉ\n2. ድርቅ ተቋቋሚ ዝርያዎች\n3. ዛፍ ከሰብል ጋር ይተክሉ\n4. ሙልቺንግ: አፈር በቅሪት ሸፍኑ\n5. ያልተለመደ ማረስ ይቀንሱ\n\n🌳 የሚመከሩ ዛፎች:\n- ሞሪንጋ: ፈጣን, ገንቢ ቅጠሎች\n- ግሪቪሊያ: ጥሩ ጥላ\n- ሰስባኒያ: ናይትሮጅን ይጨምራል\n\n📊 ውጤት: የተለያዩ ሰብል 30-50% ተጨማሪ ገቢ'
      }
    ]
  }
];

const Training: React.FC = () => {
  const { language } = useLanguage();
  const [selectedModule, setSelectedModule] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem('completedSteps') || '[]'))
  );

  const markComplete = (moduleId: string, stepIdx: number) => {
    const key = `${moduleId}-${stepIdx}`;
    const updated = new Set(completedSteps);
    updated.add(key);
    setCompletedSteps(updated);
    localStorage.setItem('completedSteps', JSON.stringify([...updated]));
  };

  const getProgress = (moduleId: string, totalSteps: number) => {
    let count = 0;
    for (let i = 0; i < totalSteps; i++) {
      if (completedSteps.has(`${moduleId}-${i}`)) count++;
    }
    return Math.round((count / totalSteps) * 100);
  };

  if (selectedModule) {
    const step = selectedModule.steps[currentStep];
    const isCompleted = completedSteps.has(`${selectedModule.id}-${currentStep}`);

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-hero px-6 pt-8 pb-6 rounded-b-3xl">
          <button onClick={() => { setSelectedModule(null); setCurrentStep(0); }} className="flex items-center gap-1 text-primary-foreground/80 mb-4">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">{language === 'am' ? 'ተመለስ' : 'Back'}</span>
          </button>
          <h1 className="text-xl font-bold text-primary-foreground">
            {language === 'am' ? selectedModule.titleAm : selectedModule.titleEn}
          </h1>
          <p className="text-primary-foreground/60 text-sm mt-1">
            {language === 'am' ? `ደረጃ ${currentStep + 1} ከ ${selectedModule.steps.length}` : `Step ${currentStep + 1} of ${selectedModule.steps.length}`}
          </p>
          {/* Progress */}
          <div className="h-1.5 bg-card/20 rounded-full mt-3">
            <div className="h-full bg-primary-foreground rounded-full transition-all" style={{ width: `${((currentStep + 1) / selectedModule.steps.length) * 100}%` }} />
          </div>
        </div>

        <div className="px-6 py-6">
          <Card className="p-5">
            <h2 className="text-lg font-bold mb-4">
              {language === 'am' ? step.titleAm : step.titleEn}
            </h2>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {language === 'am' ? step.contentAm : step.contentEn}
            </div>
          </Card>

          <div className="flex items-center justify-between mt-6 gap-3">
            <Button variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep(c => c - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {language === 'am' ? 'ቀዳሚ' : 'Previous'}
            </Button>

            {!isCompleted ? (
              <Button onClick={() => markComplete(selectedModule.id, currentStep)} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {language === 'am' ? 'አጠናቅቄያለሁ' : 'Mark Complete'}
              </Button>
            ) : (
              <Badge variant="secondary" className="px-4 py-2">
                ✅ {language === 'am' ? 'ተጠናቋል' : 'Completed'}
              </Badge>
            )}

            {currentStep < selectedModule.steps.length - 1 ? (
              <Button onClick={() => setCurrentStep(c => c + 1)}>
                {language === 'am' ? 'ቀጣይ' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button variant="outline" onClick={() => { setSelectedModule(null); setCurrentStep(0); }}>
                {language === 'am' ? 'ጨርስ' : 'Finish'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero px-6 pt-8 pb-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-primary-foreground">
          {language === 'am' ? '📚 የግብርና ስልጠና' : '📚 Agricultural Training'}
        </h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          {language === 'am' ? 'ደረጃ-በ-ደረጃ የግብርና ትምህርቶች' : 'Step-by-step farming lessons'}
        </p>
      </div>

      <div className="px-6 py-6 space-y-4">
        {trainingModules.map((module) => {
          const progress = getProgress(module.id, module.steps.length);
          return (
            <button key={module.id} onClick={() => setSelectedModule(module)} className="w-full text-left">
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={cn("rounded-xl p-3 flex-shrink-0", module.color)}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {language === 'am' ? module.titleAm : module.titleEn}
                      </h3>
                      {progress === 100 && <Badge variant="secondary" className="text-xs">✅</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm mt-0.5 line-clamp-1">
                      {language === 'am' ? module.descAm : module.descEn}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 bg-muted rounded-full flex-1">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <PlayCircle className="h-3 w-3" />
                      <span>{module.steps.length} {language === 'am' ? 'ደረጃዎች' : 'steps'}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Training;
