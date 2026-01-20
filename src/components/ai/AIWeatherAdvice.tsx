import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CloudSun, Wheat, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const WEATHER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-weather-advice`;

const ethiopianRegions = [
  { value: "all", labelEn: "All Ethiopia", labelAm: "ሁሉም ኢትዮጵያ" },
  { value: "tigray", labelEn: "Tigray", labelAm: "ትግራይ" },
  { value: "amhara", labelEn: "Amhara", labelAm: "አማራ" },
  { value: "oromia", labelEn: "Oromia", labelAm: "ኦሮሚያ" },
  { value: "snnpr", labelEn: "SNNPR", labelAm: "ደቡብ ብሔሮች" },
  { value: "sidama", labelEn: "Sidama", labelAm: "ሲዳማ" },
  { value: "afar", labelEn: "Afar", labelAm: "አፋር" },
  { value: "somali", labelEn: "Somali", labelAm: "ሶማሌ" },
  { value: "benishangul", labelEn: "Benishangul-Gumuz", labelAm: "ቤንሻንጉል-ጉሙዝ" },
  { value: "gambela", labelEn: "Gambela", labelAm: "ጋምቤላ" },
  { value: "harari", labelEn: "Harari", labelAm: "ሐረሪ" },
  { value: "addis", labelEn: "Addis Ababa", labelAm: "አዲስ አበባ" },
  { value: "dire", labelEn: "Dire Dawa", labelAm: "ድሬ ዳዋ" },
];

const cropCategories = [
  { value: "all", labelEn: "All Crops", labelAm: "ሁሉም ሰብሎች" },
  { value: "teff", labelEn: "Teff", labelAm: "ጤፍ" },
  { value: "wheat", labelEn: "Wheat", labelAm: "ስንዴ" },
  { value: "maize", labelEn: "Maize/Corn", labelAm: "በቆሎ" },
  { value: "barley", labelEn: "Barley", labelAm: "ገብስ" },
  { value: "sorghum", labelEn: "Sorghum", labelAm: "ማሽላ" },
  { value: "coffee", labelEn: "Coffee", labelAm: "ቡና" },
  { value: "enset", labelEn: "Enset (False Banana)", labelAm: "እንሰት" },
  { value: "vegetables", labelEn: "Vegetables", labelAm: "አትክልት" },
  { value: "legumes", labelEn: "Legumes", labelAm: "ጥራጥሬ" },
];

export const AIWeatherAdvice = () => {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [season, setSeason] = useState<{ season: string; seasonAm: string; month: string } | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const getAdvice = async () => {
    setIsLoading(true);
    setAdvice(null);

    try {
      const regionLabel = ethiopianRegions.find(r => r.value === selectedRegion);
      const cropLabel = cropCategories.find(c => c.value === selectedCrop);
      
      const response = await fetch(WEATHER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          region: selectedRegion === "all" ? null : (language === "am" ? regionLabel?.labelAm : regionLabel?.labelEn),
          crop: selectedCrop === "all" ? null : (language === "am" ? cropLabel?.labelAm : cropLabel?.labelEn),
          language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get advice");
      }

      const data = await response.json();
      setAdvice(data.advice);
      setSeason(data.season);
    } catch (error) {
      console.error("Weather advice error:", error);
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "ምክር ማግኘት አልተቻለም። እንደገና ይሞክሩ።" 
          : "Failed to get advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CloudSun className="h-5 w-5 text-primary" />
          {language === "am" ? "የወቅት እርሻ ምክር" : "Seasonal Farming Advice"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === "am" 
            ? "በኢትዮጵያ ወቅቶች ላይ የተመሰረተ የእርሻ ምክር" 
            : "Ethiopian season-based farming recommendations"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Season Display */}
        {season && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <Wheat className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">
                {language === "am" ? "የአሁኑ ወቅት" : "Current Season"}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "am" ? season.seasonAm : season.season} ({season.month})
              </p>
            </div>
          </div>
        )}

        {/* Region Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === "am" ? "ክልል ይምረጡ" : "Select Region"}
          </label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ethiopianRegions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {language === "am" ? region.labelAm : region.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Crop Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === "am" ? "ሰብል ይምረጡ" : "Select Crop"}
          </label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cropCategories.map((crop) => (
                <SelectItem key={crop.value} value={crop.value}>
                  {language === "am" ? crop.labelAm : crop.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Get Advice Button */}
        <Button
          onClick={getAdvice}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === "am" ? "ምክር እየተዘጋጀ ነው..." : "Getting advice..."}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {language === "am" ? "ምክር ያግኙ" : "Get Advice"}
            </>
          )}
        </Button>

        {/* Advice Result */}
        {advice && (
          <div className="mt-4 p-4 bg-card border rounded-lg space-y-2">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <CloudSun className="h-5 w-5" />
              {language === "am" ? "የእርሻ ምክር" : "Farming Advice"}
            </h3>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {advice}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIWeatherAdvice;
