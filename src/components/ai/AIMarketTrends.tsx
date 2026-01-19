import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, RefreshCw, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const TRENDS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-market-trends`;

const categories = [
  { value: "all", labelEn: "All Categories", labelAm: "ሁሉም ምድቦች" },
  { value: "grains", labelEn: "Grains", labelAm: "እህሎች" },
  { value: "vegetables", labelEn: "Vegetables", labelAm: "አትክልቶች" },
  { value: "fruits", labelEn: "Fruits", labelAm: "ፍራፍሬዎች" },
  { value: "legumes", labelEn: "Legumes", labelAm: "ጥራጥሬዎች" },
  { value: "spices", labelEn: "Spices", labelAm: "ቅመማ ቅመሞች" },
  { value: "coffee", labelEn: "Coffee", labelAm: "ቡና" },
  { value: "oilseeds", labelEn: "Oilseeds", labelAm: "የዘይት እህሎች" },
  { value: "livestock", labelEn: "Livestock", labelAm: "እንስሳት" },
  { value: "dairy", labelEn: "Dairy", labelAm: "የወተት ምርቶች" },
  { value: "honey", labelEn: "Honey", labelAm: "ማር" },
];

export const AIMarketTrends = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const getAnalysis = async () => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch(TRENDS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          category: selectedCategory === "all" ? null : selectedCategory,
          language: "am",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get analysis");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Market trends error:", error);
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "ትንተና ማግኘት አልተቻለም" 
          : "Failed to get market analysis",
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
          <BarChart3 className="h-5 w-5 text-primary" />
          {language === "am" ? "የገበያ አዝማሚያ ትንተና" : "Market Trends Analysis"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === "am" 
            ? "የገበያ ሁኔታን ይረዱ፣ ምርጥ የሽያጭ ጊዜ ይወቁ" 
            : "Understand market conditions and best selling times"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={language === "am" ? "ምድብ ይምረጡ" : "Select category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {language === "am" ? cat.labelAm : cat.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={getAnalysis} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Analysis Result */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              {language === "am" ? "እየተተነተነ ነው..." : "Analyzing..."}
            </span>
          </div>
        )}

        {analysis && !isLoading && (
          <div className="p-4 bg-card border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold mb-3">
              <TrendingUp className="h-5 w-5" />
              {language === "am" ? "የትንተና ውጤት" : "Analysis Result"}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {analysis}
            </div>
          </div>
        )}

        {!analysis && !isLoading && (
          <div className="text-center py-6 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {language === "am" 
                ? "ትንተና ለማግኘት ከላይ ያለውን ቁልፍ ይጫኑ" 
                : "Click the button above to get analysis"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIMarketTrends;
