import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Camera, Award, Sparkles, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";

const QUALITY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-quality-grade`;

interface AIQualityGradeProps {
  imageUrl: string | null;
  category: string;
  productName: string;
  onGradeDetected?: (grade: string, multiplier: number) => void;
}

export const AIQualityGrade = ({ 
  imageUrl, 
  category, 
  productName,
  onGradeDetected 
}: AIQualityGradeProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { speak, isSpeaking, isLoading: isSpeakingLoading } = useVoiceOutput();

  const analyzeQuality = async () => {
    if (!imageUrl) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "እባክዎ መጀመሪያ ምስል ያስገቡ" 
          : "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    setGrade(null);

    try {
      const response = await fetch(QUALITY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          imageUrl,
          category,
          productName,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze quality");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setGrade(data.grade);
      
      if (data.grade && onGradeDetected) {
        onGradeDetected(data.grade, data.priceMultiplier);
      }
    } catch (error) {
      console.error("Quality analysis error:", error);
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "ጥራትን ለመመርመር አልተቻለም" 
          : "Failed to analyze quality",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (analysis) {
      speak(analysis);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-5 w-5 text-primary" />
          {language === "am" ? "AI ጥራት ምደባ" : "AI Quality Grading"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {language === "am" 
            ? "ምስሉን በመመርመር የምርት ጥራት ደረጃ ያግኙ" 
            : "Analyze product image to get quality grade"}
        </p>

        <Button
          onClick={analyzeQuality}
          disabled={isLoading || !imageUrl}
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
              <Camera className="mr-2 h-4 w-4" />
              {language === "am" ? "ጥራት ይመርምሩ" : "Analyze Quality"}
            </>
          )}
        </Button>

        {!imageUrl && (
          <p className="text-xs text-muted-foreground text-center">
            {language === "am" 
              ? "ምስል ካስገቡ በኋላ ይህን ይጫኑ" 
              : "Upload an image first to analyze"}
          </p>
        )}

        {grade && (
          <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg text-primary">{grade}</span>
              </div>
              {analysis && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSpeak}
                  disabled={isSpeaking || isSpeakingLoading}
                >
                  <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-3 p-3 bg-card border rounded-lg">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {analysis}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIQualityGrade;
