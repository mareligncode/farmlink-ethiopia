import React, { useState } from 'react';
import { Star, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { reviewsAPI, Review } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ProductReviewsProps {
  productId: string;
}

const StarRating: React.FC<{
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, onChange, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={cn(
            "transition-colors",
            !readonly && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
  });

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const response = await reviewsAPI.getByProduct(productId);
      return response.data;
    },
  });

  const reviews = reviewsData || [];

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Check if user already reviewed
  const userReview = reviews.find(r => 
    (r.reviewerId?.id || r.reviewerId?._id) === profile?.id
  );

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('Not authenticated');
      if (newReview.rating === 0) throw new Error('Please select a rating');

      const response = await reviewsAPI.create({
        productId,
        rating: newReview.rating,
        comment: newReview.comment || undefined,
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      setNewReview({ rating: 0, comment: '' });
      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'ግምገማዎ ተልኳል' : 'Your review has been submitted',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    submitReviewMutation.mutate();
  };

  // Only merchants can review
  const canReview = profile?.role === 'merchant' && !userReview;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-card rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
            <StarRating rating={Math.round(averageRating)} readonly size="sm" />
            <p className="text-sm text-muted-foreground mt-1">
              {reviews.length} {language === 'am' ? 'ግምገማዎች' : 'reviews'}
            </p>
          </div>

          {/* Rating distribution */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => r.rating === star).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{star}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review */}
      {canReview && (
        <div className="bg-card rounded-2xl p-6">
          <h3 className="font-semibold mb-4">
            {language === 'am' ? 'ግምገማ ጻፍ' : 'Write a Review'}
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'am' ? 'የእርስዎ ደረጃ' : 'Your Rating'}
              </p>
              <StarRating
                rating={newReview.rating}
                onChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                size="lg"
              />
            </div>

            <Textarea
              placeholder={language === 'am' ? 'ግምገማዎን ያጋሩ (አማራጭ)...' : 'Share your experience (optional)...'}
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
            />

            <Button
              type="submit"
              disabled={newReview.rating === 0 || submitReviewMutation.isPending}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitReviewMutation.isPending
                ? (language === 'am' ? 'በመላክ ላይ...' : 'Submitting...')
                : (language === 'am' ? 'ግምገማ ላክ' : 'Submit Review')}
            </Button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          {language === 'am' ? 'የደንበኛ ግምገማዎች' : 'Customer Reviews'}
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center">
            <Star className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {language === 'am' ? 'ገና ምንም ግምገማዎች የሉም' : 'No reviews yet'}
            </p>
            {profile?.role === 'merchant' && (
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'am' ? 'ይህን ምርት ለመገምገም የመጀመሪያው ይሁኑ!' : 'Be the first to review this product!'}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id || review._id} className="bg-card rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">
                        {review.reviewerId?.fullName || (language === 'am' ? 'ተጠቃሚ' : 'User')}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <StarRating rating={review.rating} readonly size="sm" />
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
