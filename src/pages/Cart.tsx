import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cartAPI } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart', profile?.id],
    queryFn: async () => {
      const response = await cartAPI.getItems();
      return response.data;
    },
    enabled: !!profile,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await cartAPI.updateQuantity(itemId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await cartAPI.removeItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: t('message.success'),
        description: language === 'am' ? 'ከጋሪ ተወግዷል' : 'Removed from cart',
      });
    },
  });

  const totalAmount = cartItems?.reduce((sum, item) => {
    return sum + (Number(item.productId?.price || 0) * Number(item.quantity));
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-6 py-4 safe-area-top">
          <h1 className="text-xl font-bold">{t('nav.cart')}</h1>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 animate-pulse flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 safe-area-top">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">{t('nav.cart')}</h1>
          {cartItems && cartItems.length > 0 && (
            <span className="bg-primary/10 text-primary text-sm font-medium px-2 py-0.5 rounded-full ml-auto">
              {cartItems.length} {language === 'am' ? 'ዕቃዎች' : 'items'}
            </span>
          )}
        </div>
      </div>

      {cartItems && cartItems.length > 0 ? (
        <div className="px-6 py-4 space-y-4">
          {cartItems.map((item) => {
            const itemId = item.id || item._id || '';
            const product = item.productId;
            const productId = product?.id || product?._id || '';
            
            return (
              <div key={itemId} className="bg-card rounded-2xl shadow-sm p-4 flex gap-4 animate-slide-up">
                {/* Product Image */}
                <Link to={`/products/${productId}`}>
                  <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                    {product?.imageUrls?.[0] ? (
                      <img 
                        src={product.imageUrls[0]} 
                        alt={product.nameEn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🌾
                      </div>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${productId}`}>
                    <p className="font-semibold truncate">
                      {language === 'am' && product?.nameAm 
                        ? product.nameAm 
                        : product?.nameEn
                      }
                    </p>
                  </Link>
                  <p className="text-muted-foreground text-sm truncate">
                    {product?.farmerId?.farmName || product?.farmerId?.fullName}
                  </p>
                  <p className="text-primary font-bold mt-1">
                    {product?.price} ETB
                    <span className="text-muted-foreground font-normal text-xs">/{product?.unit}</span>
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <button
                        onClick={() => updateQuantityMutation.mutate({ 
                          itemId, 
                          quantity: Number(item.quantity) - 1 
                        })}
                        className="p-1 rounded hover:bg-card"
                        disabled={updateQuantityMutation.isPending}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantityMutation.mutate({ 
                          itemId, 
                          quantity: Number(item.quantity) + 1 
                        })}
                        className="p-1 rounded hover:bg-card"
                        disabled={updateQuantityMutation.isPending}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItemMutation.mutate(itemId)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      disabled={removeItemMutation.isPending}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="bg-muted rounded-full p-6 mb-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t('message.emptyCart')}</h2>
          <p className="text-muted-foreground text-center mb-6">
            {language === 'am' 
              ? 'ምርቶችን ያስሱ እና ወደ ጋሪዎ ይጨምሩ' 
              : 'Browse products and add them to your cart'
            }
          </p>
          <Link to="/products">
            <Button>
              {language === 'am' ? 'ምርቶችን ይመልከቱ' : 'Browse Products'}
            </Button>
          </Link>
        </div>
      )}

      {/* Bottom Checkout Bar */}
      {cartItems && cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">{t('order.total')}</span>
            <span className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} ETB</span>
          </div>
          <Link to="/checkout">
            <Button variant="hero" size="lg" className="w-full">
              {language === 'am' ? 'ወደ ክፍያ ቀጥል' : 'Proceed to Checkout'}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cart;
