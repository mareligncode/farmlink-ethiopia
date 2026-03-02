import React, { useState } from 'react';
import { ChevronLeft, Search, Wheat, Leaf, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface CropInfo {
  id: string;
  nameEn: string;
  nameAm: string;
  category: string;
  altitudeEn: string;
  altitudeAm: string;
  seasonEn: string;
  seasonAm: string;
  yieldEn: string;
  yieldAm: string;
  descEn: string;
  descAm: string;
  varietiesEn: string[];
  varietiesAm: string[];
  tipsEn: string[];
  tipsAm: string[];
  emoji: string;
}

const crops: CropInfo[] = [
  {
    id: 'teff',
    nameEn: 'Teff', nameAm: 'ጤፍ', category: 'grains', emoji: '🌾',
    altitudeEn: '1800-2400m', altitudeAm: '1800-2400 ሜ',
    seasonEn: 'Kiremt (Jun-Sep)', seasonAm: 'ክረምት (ሰኔ-መስከረም)',
    yieldEn: '1.5-2.5 t/ha', yieldAm: '1.5-2.5 ቶን/ሄ',
    descEn: 'Ethiopia\'s most important cereal, used to make injera. Grows well in highlands with good rainfall.',
    descAm: 'የኢትዮጵያ ዋና እህል፣ ለእንጀራ ይጠቅማል። በደጋ ጥሩ ዝናብ ባለበት ይበቅላል።',
    varietiesEn: ['Quncho (DZ-Cr-387) - White, high yield', 'Magna (DZ-01-196) - Lodging resistant', 'Tsedey - Early maturing'],
    varietiesAm: ['ቅናጮ - ነጭ, ከፍተኛ ምርት', 'ማኘ - የማይወድቅ', 'ጸደይ - ቀደም ብሎ ይበስላል'],
    tipsEn: ['Row planting increases yield 20-30%', 'Apply DAP 100kg/ha at planting', 'First weeding at 20-25 days is critical'],
    tipsAm: ['በረድፍ መዝራት ምርትን 20-30% ይጨምራል', 'DAP 100ኪ.ግ/ሄ ሲዘራ ይጨምሩ', 'የመጀመሪያ አረም ከ20-25 ቀን ወሳኝ ነው'],
  },
  {
    id: 'wheat',
    nameEn: 'Wheat', nameAm: 'ስንዴ', category: 'grains', emoji: '🌾',
    altitudeEn: '1500-3000m', altitudeAm: '1500-3000 ሜ',
    seasonEn: 'Kiremt & Belg', seasonAm: 'ክረምት እና በልግ',
    yieldEn: '2-4 t/ha', yieldAm: '2-4 ቶን/ሄ',
    descEn: 'Major cereal for bread and pasta. Ethiopia is the largest wheat producer in Sub-Saharan Africa.',
    descAm: 'ለዳቦና ፓስታ ዋና እህል። ኢትዮጵያ በአፍሪካ ቀንድ ትልቁ አምራች ነች።',
    varietiesEn: ['Kakaba - Bread wheat, rust resistant', 'Danda\'a - High yield', 'Shorima - Disease resistant'],
    varietiesAm: ['ካካባ - ለዳቦ, ዝገት ተቋቋሚ', 'ዳንዳ - ከፍተኛ ምርት', 'ሾሪማ - በሽታ ተቋቋሚ'],
    tipsEn: ['Plant at 150kg/ha seed rate', 'Watch for yellow rust - most damaging disease', 'Harvest when grain is hard and dry'],
    tipsAm: ['150ኪ.ግ/ሄ ዘር ይዝሩ', 'ቢጫ ዝገት ይጠንቀቁ - ከባድ በሽታ', 'እህሉ ጠንካራና ደረቅ ሲሆን ይሰብስቡ'],
  },
  {
    id: 'maize',
    nameEn: 'Maize', nameAm: 'በቆሎ', category: 'grains', emoji: '🌽',
    altitudeEn: '500-2200m', altitudeAm: '500-2200 ሜ',
    seasonEn: 'Kiremt (Mar-Apr planting)', seasonAm: 'ክረምት (መጋቢት-ሚያዝያ ዘር)',
    yieldEn: '3-8 t/ha', yieldAm: '3-8 ቶን/ሄ',
    descEn: 'Most widely grown cereal in Ethiopia. Used for food, feed, and fuel.',
    descAm: 'በኢትዮጵያ በስፋት የሚመረት እህል። ለምግብ፣ ለእንስሳ መኖ ይጠቅማል።',
    varietiesEn: ['BH-540 - Medium maturity, high yield', 'BH-660 - Late maturity, very high yield', 'BHQPY-545 - Quality protein'],
    varietiesAm: ['BH-540 - መካከለኛ, ከፍተኛ ምርት', 'BH-660 - ዘግይቶ, በጣም ከፍተኛ ምርት', 'BHQPY-545 - ጥራት ያለው ፕሮቲን'],
    tipsEn: ['Watch for Fall Armyworm - check fields weekly', 'Space 75cm between rows, 25cm between plants', 'Apply fertilizer in split doses'],
    tipsAm: ['ፎል ዎርም ይጠንቀቁ - በየሳምንቱ ያረጋግጡ', 'በረድፍ 75ሴ.ሜ, በተክል 25ሴ.ሜ ርቀት', 'ማዳበሪያ በሁለት ክፍል ይስጡ'],
  },
  {
    id: 'coffee',
    nameEn: 'Coffee', nameAm: 'ቡና', category: 'cash', emoji: '☕',
    altitudeEn: '1200-2200m', altitudeAm: '1200-2200 ሜ',
    seasonEn: 'Year-round (harvest Oct-Feb)', seasonAm: 'ዓመቱን ሙሉ (መከር ጥቅ-የካ)',
    yieldEn: '0.5-2 t/ha', yieldAm: '0.5-2 ቶን/ሄ',
    descEn: 'Ethiopia is the birthplace of Arabica coffee. #1 export commodity. Sidama, Yirgacheffe, and Guji are world-famous origins.',
    descAm: 'ኢትዮጵያ የአረቢካ ቡና መገኛ ናት። #1 የወጪ ንግድ ሸቀጥ። ሲዳማ፣ ይርጋጨፌ፣ ጉጂ በዓለም ታዋቂ ናቸው።',
    varietiesEn: ['74110 - CBD resistant', '74112 - High cup quality', 'Geisha/Gesha - Premium specialty'],
    varietiesAm: ['74110 - CBD ተቋቋሚ', '74112 - ከፍተኛ ጥራት', 'ጌሻ - ፕሪሚየም ልዩ'],
    tipsEn: ['Shade trees essential: 40-60% shade', 'Prune after harvest to improve next yield', 'Pick only red ripe cherries for best price'],
    tipsAm: ['ጥላ ዛፍ አስፈላጊ: 40-60% ጥላ', 'ከመከር በኋላ መግረዝ ለሚቀጥል ምርት', 'ቀይ የበሰለ ፍሬ ብቻ ይልቀሙ ለምርጥ ዋጋ'],
  },
  {
    id: 'potato',
    nameEn: 'Potato', nameAm: 'ድንች', category: 'vegetables', emoji: '🥔',
    altitudeEn: '1500-3000m', altitudeAm: '1500-3000 ሜ',
    seasonEn: 'Belg & Kiremt', seasonAm: 'በልግ እና ክረምት',
    yieldEn: '15-30 t/ha', yieldAm: '15-30 ቶን/ሄ',
    descEn: 'Important food security crop. Fast-growing, high calorie per hectare. Grows well in highlands.',
    descAm: 'ለምግብ ዋስትና አስፈላጊ ሰብል። ፈጣን ምርት፣ ከፍተኛ ካሎሪ። በደጋ ጥሩ ያድጋል።',
    varietiesEn: ['Gudoshie - Late blight tolerant', 'Jalenie - High yield, red skin', 'Belete - Very high yield, white'],
    varietiesAm: ['ጉዶሺ - ብላይት ተቋቋሚ', 'ጃሌኔ - ከፍተኛ ምርት, ቀይ ቆዳ', 'በዕለ - በጣም ከፍተኛ ምርት, ነጭ'],
    tipsEn: ['Use certified seed tubers', 'Hill up soil around stems 2-3 times', 'Late blight is the #1 threat - spray Ridomil preventatively'],
    tipsAm: ['የተረጋገጠ ዘር ድንች ይጠቀሙ', 'ዙሪያ አፈር 2-3 ጊዜ ያራግፉ', 'ብላይት #1 ስጋት - Ridomil በመከላከል ይረጩ'],
  },
  {
    id: 'enset',
    nameEn: 'Enset (False Banana)', nameAm: 'እንሰት', category: 'roots', emoji: '🌿',
    altitudeEn: '1500-3100m', altitudeAm: '1500-3100 ሜ',
    seasonEn: 'Year-round', seasonAm: 'ዓመቱን ሙሉ',
    yieldEn: '30-40 t/ha fresh', yieldAm: '30-40 ቶን/ሄ ትኩስ',
    descEn: 'The "tree against hunger" - feeds 20M+ Ethiopians. Provides food, fiber, and animal feed from a single plant.',
    descAm: 'የረሃብ ተከላካይ ዛፍ - ከ20 ሚ. ኢትዮጵያውያን ይመገባሉ። ምግብ፣ ፋይበር፣ እንስሳ መኖ ይሰጣል።',
    varietiesEn: ['Maziya - High yield kocho', 'Gena - Early maturing', 'Astara - Disease resistant'],
    varietiesAm: ['ማዝያ - ከፍተኛ ቆጮ', 'ገና - ቀደም ብሎ ይበስላል', 'አስታራ - በሽታ ተቋቋሚ'],
    tipsEn: ['Transplant suckers at onset of rains', 'Takes 3-5 years to mature', 'Bacterial wilt is the major disease - remove infected plants'],
    tipsAm: ['ችግኞችን ዝናብ ሲጀምር ይተክሉ', 'ለመብሰል 3-5 ዓመት ይፈጃል', 'ባክቴሪያል ዊልት ዋና በሽታ - የታመሙ ያስወግዱ'],
  },
];

const CropLibrary: React.FC = () => {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<CropInfo | null>(null);

  const filtered = crops.filter(c => {
    const q = search.toLowerCase();
    return c.nameEn.toLowerCase().includes(q) || c.nameAm.includes(search) || c.category.includes(q);
  });

  if (selectedCrop) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-hero px-6 pt-8 pb-6 rounded-b-3xl">
          <button onClick={() => setSelectedCrop(null)} className="flex items-center gap-1 text-primary-foreground/80 mb-3">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">{language === 'am' ? 'ተመለስ' : 'Back'}</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{selectedCrop.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">
                {language === 'am' ? selectedCrop.nameAm : selectedCrop.nameEn}
              </h1>
              <p className="text-primary-foreground/70 text-sm">{selectedCrop.category}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              {language === 'am' ? selectedCrop.descAm : selectedCrop.descEn}
            </p>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{language === 'am' ? 'ከፍታ' : 'Altitude'}</p>
              <p className="font-semibold text-sm mt-1">{language === 'am' ? selectedCrop.altitudeAm : selectedCrop.altitudeEn}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{language === 'am' ? 'ወቅት' : 'Season'}</p>
              <p className="font-semibold text-sm mt-1">{language === 'am' ? selectedCrop.seasonAm : selectedCrop.seasonEn}</p>
            </Card>
            <Card className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{language === 'am' ? 'ምርት' : 'Yield'}</p>
              <p className="font-semibold text-sm mt-1">{language === 'am' ? selectedCrop.yieldAm : selectedCrop.yieldEn}</p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-bold mb-3">{language === 'am' ? '🌱 የተሻሻሉ ዝርያዎች' : '🌱 Improved Varieties'}</h3>
            <ul className="space-y-2">
              {(language === 'am' ? selectedCrop.varietiesAm : selectedCrop.varietiesEn).map((v, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Leaf className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-bold mb-3">{language === 'am' ? '💡 ምክሮች' : '💡 Key Tips'}</h3>
            <ul className="space-y-2">
              {(language === 'am' ? selectedCrop.tipsAm : selectedCrop.tipsEn).map((tip, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary font-bold">{i + 1}.</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero px-6 pt-8 pb-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-primary-foreground">
          {language === 'am' ? '🌱 የሰብል መረጃ ቋት' : '🌱 Crop Library'}
        </h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          {language === 'am' ? 'የኢትዮጵያ ዋና ሰብሎች መረጃ' : 'Information on Ethiopian major crops'}
        </p>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'am' ? 'ሰብል ይፈልጉ...' : 'Search crops...'}
            className="pl-9 bg-card/90"
          />
        </div>
      </div>

      <div className="px-6 py-6 space-y-3">
        {filtered.map(crop => (
          <button key={crop.id} onClick={() => setSelectedCrop(crop)} className="w-full text-left">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{crop.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {language === 'am' ? crop.nameAm : crop.nameEn}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {language === 'am' ? crop.altitudeAm : crop.altitudeEn} · {language === 'am' ? crop.seasonAm : crop.seasonEn}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Wheat className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{language === 'am' ? 'ምንም አልተገኘም' : 'No crops found'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropLibrary;
