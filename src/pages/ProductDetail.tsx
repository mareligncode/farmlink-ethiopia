import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Star, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isFarmer = profile?.role === 'farmer';

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID');
      
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles!products_farmer_id_fkey(id, full_name, farm_name, farm_location, avatar_url)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles!reviews_reviewer_id_fkey(full_name, avatar_url)')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !id) throw new Error('Not authenticated');
      
      // Check if already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', profile.id)
        .eq('product_id', id)
        .single();
      
      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: profile.id,
            product_id: id,
            quantity: quantity,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: t('message.success'),
        description: language === 'am' ? 'ወደ ጋሪ ተጨምሯል' : 'Added to cart',
      });
    },
    onError: (error) => {
      toast({
        title: t('message.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="aspect-square bg-muted" />
        <div className="p-6 space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t('message.noProducts')}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'am' ? 'ተመለስ' : 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : [null];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 safe-area-top">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-sm"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <button className="bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-sm">
            <Heart className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square bg-muted">
          {images[selectedImageIndex] ? (
            <img 
              src={images[selectedImageIndex]}
              alt={product.name_en}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🌾</span>
            </div>
          )}
        </div>
        
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedImageIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === selectedImageIndex ? "w-8 bg-card" : "w-2 bg-card/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pt-6">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
            {t(`category.${product.category}`)}
          </span>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-harvest text-harvest" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">({reviews.length})</span>
            </div>
          )}
        </div>

        {/* Title & Price */}
        <h1 className="text-2xl font-bold mb-1">
          {language === 'am' && product.name_am ? product.name_am : product.name_en}
        </h1>
        <p className="text-2xl font-bold text-primary">
          {product.price} {product.currency}
          <span className="text-muted-foreground font-normal text-base">/{product.unit}</span>
        </p>

        {/* Availability */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className={cn(
            "px-3 py-1 rounded-full",
            product.is_available ? "bg-leaf/10 text-leaf" : "bg-destructive/10 text-destructive"
          )}>
            {product.is_available ? t('product.available') : t('product.outOfStock')}
          </span>
          <span className="text-muted-foreground">
            {product.quantity} {product.unit} {language === 'am' ? 'ይገኛል' : 'available'}
          </span>
        </div>

        {/* Farmer Info */}
        {product.profiles && (
          <div className="bg-card rounded-2xl p-4 mt-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {product.profiles.avatar_url ? (
                <img src={product.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{product.profiles.farm_name || product.profiles.full_name}</p>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span>{product.profiles.farm_location || 'Ethiopia'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">{t('product.description')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {language === 'am' && product.description_am 
              ? product.description_am 
              : product.description_en || (language === 'am' ? 'ምንም መግለጫ የለም' : 'No description available')
            }
          </p>
        </div>

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">
              {language === 'am' ? 'ግምገማዎች' : 'Reviews'} ({reviews.length})
            </h3>
            <div className="space-y-3">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="bg-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{review.profiles?.full_name || 'User'}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn(
                            "h-3 w-3",
                            i < review.rating ? "fill-harvest text-harvest" : "text-muted"
                          )} 
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar - Only for merchants */}
      {!isFarmer && product.is_available && (
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom">
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-muted rounded-xl p-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 rounded-lg hover:bg-card"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(Number(product.quantity), quantity + 1))}
                className="p-1 rounded-lg hover:bg-card"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Add to Cart */}
            <Button
              variant="hero"
              size="lg"
              className="flex-1"
              onClick={() => addToCartMutation.mutate()}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {addToCartMutation.isPending 
                ? t('action.loading')
                : t('product.addToCart')
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
