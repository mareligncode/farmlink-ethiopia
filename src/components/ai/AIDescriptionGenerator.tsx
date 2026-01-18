import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface AIDescriptionGeneratorProps {
  productName: string;
  category: string;
  onGenerated: (descriptionEn: string, descriptionAm: string) => void;
}

const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({
  productName,
  category,
  onGenerated,
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const generateDescription = async () => {
    if (!productName.trim()) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' 
          ? 'እባክዎ መጀመሪያ የምርት ስም ያስገቡ'
          : 'Please enter a product name first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate English description
      const enResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate-description`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ productName, category, language: 'en' }),
        }
      );

      if (!enResponse.ok) throw new Error('Failed to generate English description');
      const enData = await enResponse.json();

      // Generate Amharic description
      const amResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate-description`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ productName, category, language: 'am' }),
        }
      );

      if (!amResponse.ok) throw new Error('Failed to generate Amharic description');
      const amData = await amResponse.json();

      onGenerated(enData.description, amData.description);

      toast({
        title: language === 'am' ? 'ተሳክቷል!' : 'Success!',
        description: language === 'am' 
          ? 'የምርት መግለጫዎች ተፈጥረዋል'
          : 'Product descriptions generated',
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' 
          ? 'መግለጫ መፍጠር አልተሳካም'
          : 'Failed to generate description',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={generateDescription}
      disabled={isLoading || !productName.trim()}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="h-4 w-4" />
      )}
      {language === 'am' ? 'AI መግለጫ ፍጠር' : 'Generate with AI'}
    </Button>
  );
};

export default AIDescriptionGenerator;
