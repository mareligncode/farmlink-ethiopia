import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Star, Minus, Plus, ShoppingCart, Heart, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI, cartAPI, reviewsAPI } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ProductReviews from '@/components/ProductReviews';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviews, setShowReviews] = useState(false);

  const isFarmer = profile?.role === 'farmer';

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID');
      const response = await productsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await reviewsAPI.getByProduct(id);
      return response.data;
    },
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !id) throw new Error('Not authenticated');
      await cartAPI.addItem(id, quantity);
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

  // Check if current user owns this product
  const isOwner = product && profile && 
    (product.farmerId?.id === profile.id || product.farmerId?._id === profile.id);

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

  const images = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : [null];

  const farmer = product.farmerId;

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
          <div className="flex gap-2">
            {isOwner && (
              <button 
                onClick={() => navigate(`/products/${id}/edit`)}
                className="bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-sm"
              >
                <Edit className="h-6 w-6" />
              </button>
            )}
            <button className="bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-sm">
              <Heart className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square bg-muted">
          {images[selectedImageIndex] ? (
            <img 
              src={images[selectedImageIndex]}
              alt={product.nameEn}
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
            <button 
              onClick={() => setShowReviews(!showReviews)}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Star className="h-4 w-4 fill-harvest text-harvest" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">({reviews.length})</span>
            </button>
          )}
        </div>

        {/* Title & Price */}
        <h1 className="text-2xl font-bold mb-1">
          {language === 'am' && product.nameAm ? product.nameAm : product.nameEn}
        </h1>
        <p className="text-2xl font-bold text-primary">
          {product.price} {product.currency}
          <span className="text-muted-foreground font-normal text-base">/{product.unit}</span>
        </p>

        {/* Availability */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className={cn(
            "px-3 py-1 rounded-full",
            product.isAvailable ? "bg-leaf/10 text-leaf" : "bg-destructive/10 text-destructive"
          )}>
            {product.isAvailable ? t('product.available') : t('product.outOfStock')}
          </span>
          <span className="text-muted-foreground">
            {product.quantity} {product.unit} {language === 'am' ? 'ይገኛል' : 'available'}
          </span>
        </div>

        {/* Edit Button for Owner */}
        {isOwner && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {language === 'am' ? 'ምርት አስተካክል' : 'Edit Product'}
          </Button>
        )}

        {/* Farmer Info */}
        {farmer && !isOwner && (
          <div className="bg-card rounded-2xl p-4 mt-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {farmer.avatarUrl ? (
                <img src={farmer.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{farmer.farmName || farmer.fullName}</p>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                <span>{farmer.farmLocation || 'Ethiopia'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">{t('product.description')}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {language === 'am' && product.descriptionAm 
              ? product.descriptionAm 
              : product.descriptionEn || (language === 'am' ? 'ምንም መግለጫ የለም' : 'No description available')
            }
          </p>
        </div>

        {/* Reviews Section */}
        {id && (
          <div className="mt-6">
            <button
              onClick={() => setShowReviews(!showReviews)}
              className="flex items-center justify-between w-full py-3 border-t border-border"
            >
              <h3 className="font-semibold">
                {language === 'am' ? 'ግምገማዎች' : 'Reviews'} 
                {reviews && reviews.length > 0 && ` (${reviews.length})`}
              </h3>
              <span className="text-primary text-sm">
                {showReviews 
                  ? (language === 'am' ? 'ደብቅ' : 'Hide') 
                  : (language === 'am' ? 'ሁሉንም ይመልከቱ' : 'View All')}
              </span>
            </button>

            {showReviews && <ProductReviews productId={id} />}
          </div>
        )}
      </div>

      {/* Bottom Bar - Only for merchants */}
      {!isFarmer && product.isAvailable && (
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
