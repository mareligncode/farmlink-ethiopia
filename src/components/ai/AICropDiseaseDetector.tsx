import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Camera, Leaf, Send, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const DISEASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-crop-disease`;

export const AICropDiseaseDetector = () => {
  const [symptoms, setSymptoms] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" ? "ፋይሉ ከ5MB በላይ ነው" : "File size exceeds 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeCrop = async () => {
    if (!symptoms.trim() && !imageBase64) {
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "እባክዎ የበሽታውን ምልክት ይግለጹ ወይም ፎቶ ያስገቡ" 
          : "Please describe symptoms or upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDiagnosis(null);

    try {
      const response = await fetch(DISEASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          imageBase64: imageBase64,
          language: "am", // Always use Amharic for this feature
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze");
      }

      const data = await response.json();
      setDiagnosis(data.diagnosis);
    } catch (error) {
      console.error("Disease analysis error:", error);
      toast({
        title: language === "am" ? "ስህተት" : "Error",
        description: language === "am" 
          ? "ምርመራ ማካሄድ አልተቻለም። እንደገና ይሞክሩ።" 
          : "Failed to analyze. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setSymptoms("");
    setImagePreview(null);
    setImageBase64(null);
    setDiagnosis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="h-5 w-5 text-primary" />
          {language === "am" ? "የሰብል በሽታ መለያ" : "Crop Disease Detector"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === "am" 
            ? "የሰብልዎን ምልክት ይግለጹ ወይም ፎቶ ያስገቡ" 
            : "Describe symptoms or upload a photo of your crop"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Symptoms Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === "am" ? "የበሽታ ምልክት ይግለጹ" : "Describe the symptoms"}
          </label>
          <Textarea
            placeholder={language === "am" 
              ? "ምሳሌ: የቲማቲሜ ቅጠሎች ቢጫ እየሆኑ ነው፣ ጫፋቸው እየደረቀ ነው..." 
              : "Example: The tomato leaves are turning yellow..."}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {language === "am" ? "የሰብል ፎቶ ያስገቡ (አማራጭ)" : "Upload crop photo (optional)"}
          </label>
          
          {imagePreview ? (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Crop preview" 
                className="max-w-full max-h-48 rounded-lg border"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={removeImage}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center gap-4 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {language === "am" ? "ፎቶ ለመምረጥ ይጫኑ" : "Click to upload photo"}
                </span>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={analyzeCrop}
            disabled={isLoading || (!symptoms.trim() && !imageBase64)}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "am" ? "እየተመረመረ ነው..." : "Analyzing..."}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {language === "am" ? "ምርመራ ጀምር" : "Analyze"}
              </>
            )}
          </Button>
          {(symptoms || imagePreview || diagnosis) && (
            <Button variant="outline" onClick={clearAll} disabled={isLoading}>
              {language === "am" ? "አጽዳ" : "Clear"}
            </Button>
          )}
        </div>

        {/* Diagnosis Result */}
        {diagnosis && (
          <div className="mt-4 p-4 bg-card border rounded-lg space-y-2">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <ImageIcon className="h-5 w-5" />
              {language === "am" ? "የምርመራ ውጤት" : "Diagnosis Result"}
            </h3>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {diagnosis}
            </div>
          </div>
        )}

        {/* Common Symptoms Quick Select */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2">
            {language === "am" ? "ተደጋጋሚ ምልክቶች:" : "Common symptoms:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              language === "am" ? "ቅጠሎች ቢጫ ናቸው" : "Yellow leaves",
              language === "am" ? "ነጠብጣብ አለ" : "Has spots",
              language === "am" ? "እየደረቀ ነው" : "Drying out",
              language === "am" ? "ፍሬው እየበሰበሰ ነው" : "Fruit rotting",
              language === "am" ? "ተባይ አለ" : "Has pests",
            ].map((symptom) => (
              <Button
                key={symptom}
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => setSymptoms((prev) => prev ? `${prev}, ${symptom}` : symptom)}
                disabled={isLoading}
              >
                {symptom}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AICropDiseaseDetector;
