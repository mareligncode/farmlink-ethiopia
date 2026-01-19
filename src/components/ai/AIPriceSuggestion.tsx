import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, TrendingUp, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const PRICE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-price-suggestion`;

interface AIPriceSuggestionProps {
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  onPriceSelect?: (price: number) => void;
}

export const AIPriceSuggestion = ({ 
  productName, 
  category, 
  unit, 
  quantity,
  onPriceSelect 
}: AIPriceSuggestionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const getSuggestion = async () => {
    if (!productName.trim()) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "እባክዎ የምርት ስም ያስገቡ" 
          : "Please enter a product name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSuggestion(null);

    try {
      const response = await fetch(PRICE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          productName,
          category,
          unit,
          quantity,
          language: "am",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get suggestion");
      }

      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      console.error("Price suggestion error:", error);
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "ዋጋ ለመጠቆም አልተቻለም" 
          : "Failed to get price suggestion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-5 w-5 text-primary" />
          {language === "am" ? "AI ዋጋ ምክር" : "AI Price Suggestion"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {language === "am" 
            ? "የገበያ ዋጋን መሠረት ያደረገ ምክር ያግኙ" 
            : "Get market-based price recommendation"}
        </p>

        <Button
          onClick={getSuggestion}
          disabled={isLoading || !productName}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === "am" ? "እየተመረመረ ነው..." : "Analyzing..."}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {language === "am" ? "ዋጋ ይጠቁሙልኝ" : "Suggest Price"}
            </>
          )}
        </Button>

        {suggestion && (
          <div className="mt-3 p-3 bg-card border rounded-lg">
            <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
              <TrendingUp className="h-4 w-4" />
              {language === "am" ? "የዋጋ ምክር" : "Price Recommendation"}
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {suggestion}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIPriceSuggestion;
