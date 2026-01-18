import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Package, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  name_en: string;
  name_am: string | null;
  category: string;
  price: number;
  unit: string;
  reason: string;
}

const AIRecommendations: React.FC = () => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchRecommendations = async () => {
    if (!profile?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ userId: profile.id, language }),
        }
      );

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setHasLoaded(true);
    } catch (error) {
      console.error('Recommendations error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'merchant' && !hasLoaded) {
      fetchRecommendations();
    }
  }, [profile?.id]);

  // Only show for merchants
  if (profile?.role !== 'merchant') return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">
            {language === 'am' ? 'AI የተመከሩ ምርቶች' : 'AI Recommended'}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRecommendations}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isLoading && !hasLoaded ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="flex items-center gap-3 bg-card p-3 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {language === 'am' && product.name_am ? product.name_am : product.name_en}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {product.reason}
                </p>
                <p className="text-xs text-primary font-semibold">
                  {product.price} ETB/{product.unit}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : hasLoaded ? (
        <p className="text-center text-muted-foreground text-sm py-4">
          {language === 'am' 
            ? 'ገና ምክሮች የሉም። ተጨማሪ ግዢዎች ካደረጉ በኋላ ይመለሱ!'
            : 'No recommendations yet. Come back after making more purchases!'}
        </p>
      ) : null}
    </div>
  );
};

export default AIRecommendations;
