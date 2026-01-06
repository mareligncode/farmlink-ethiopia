import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const { data: cartItems } = useQuery({
    queryKey: ['cart', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(*, profiles!products_farmer_id_fkey(id, full_name))')
        .eq('user_id', profile.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  // Group cart items by farmer
  const groupedByFarmer = cartItems?.reduce((acc, item) => {
    const farmerId = item.products?.profiles?.id;
    if (!farmerId) return acc;
    
    if (!acc[farmerId]) {
      acc[farmerId] = {
        farmerId,
        farmerName: item.products?.profiles?.full_name,
        items: [],
        total: 0,
      };
    }
    
    acc[farmerId].items.push(item);
    acc[farmerId].total += Number(item.products?.price || 0) * Number(item.quantity);
    
    return acc;
  }, {} as Record<string, { farmerId: string; farmerName: string; items: typeof cartItems; total: number }>);

  const totalAmount = cartItems?.reduce((sum, item) => {
    return sum + (Number(item.products?.price || 0) * Number(item.quantity));
  }, 0) || 0;

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !cartItems || cartItems.length === 0) {
        throw new Error('No items in cart');
      }

      // Create orders for each farmer
      for (const group of Object.values(groupedByFarmer || {})) {
        // Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            merchant_id: profile.id,
            farmer_id: group.farmerId,
            total_amount: group.total,
            delivery_address: deliveryAddress,
            delivery_notes: deliveryNotes,
            status: 'pending',
            payment_status: 'unpaid',
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = group.items.map(item => ({
          order_id: order.id,
          product_id: item.products?.id,
          quantity: item.quantity,
          unit_price: item.products?.price,
          total_price: Number(item.products?.price || 0) * Number(item.quantity),
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // Create notification for farmer
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: group.farmerId,
            title_en: 'New Order Received!',
            title_am: 'አዲስ ትዕዛዝ ደርሷል!',
            message_en: `You have received a new order worth ${group.total} ETB from ${profile.full_name}`,
            message_am: `${profile.full_name} ${group.total} ብር የሚያወጣ አዲስ ትዕዛዝ ልከዋል`,
            type: 'order',
            metadata: { order_id: order.id },
          });

        if (notifError) console.error('Notification error:', notifError);
      }

      // Clear cart
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', profile.id);

      if (clearError) throw clearError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOrderPlaced(true);
    },
    onError: (error) => {
      toast({
        title: t('message.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="bg-leaf/10 rounded-full p-6 mb-6 animate-scale-in">
          <CheckCircle className="h-20 w-20 text-leaf" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {language === 'am' ? 'ትዕዛዝ ተልኳል!' : 'Order Placed!'}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {language === 'am' 
            ? 'ትዕዛዝዎ ወደ ገበሬዎች ተልኳል። በቅርቡ ያረጋግጣሉ።'
            : 'Your order has been sent to the farmers. They will confirm it shortly.'
          }
        </p>
        <div className="flex gap-4 w-full">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/orders')}>
            {language === 'am' ? 'ትዕዛዞቼ' : 'My Orders'}
          </Button>
          <Button className="flex-1" onClick={() => navigate('/products')}>
            {language === 'am' ? 'መግዛቱን ቀጥል' : 'Continue Shopping'}
          </Button>
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
          <h1 className="text-xl font-bold">
            {language === 'am' ? 'ክፍያ' : 'Checkout'}
          </h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-card rounded-2xl shadow-sm p-4">
          <h2 className="font-semibold mb-4">
            {language === 'am' ? 'የትዕዛዝ ማጠቃለያ' : 'Order Summary'}
          </h2>
          <div className="space-y-3">
            {cartItems?.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌾</span>
                  <div>
                    <p className="text-sm font-medium">
                      {language === 'am' && item.products?.name_am 
                        ? item.products.name_am 
                        : item.products?.name_en
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} x {item.products?.price} ETB
                    </p>
                  </div>
                </div>
                <span className="font-medium">
                  {(Number(item.products?.price || 0) * Number(item.quantity)).toFixed(2)} ETB
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex justify-between">
            <span className="font-semibold">{t('order.total')}</span>
            <span className="text-xl font-bold text-primary">{totalAmount.toFixed(2)} ETB</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">
              {language === 'am' ? 'የመድረሻ አድራሻ' : 'Delivery Address'}
            </h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">
                {language === 'am' ? 'አድራሻ' : 'Address'} *
              </Label>
              <Input
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={language === 'am' ? 'ሙሉ አድራሻዎን ያስገቡ' : 'Enter your full address'}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">
                {language === 'am' ? 'ማስታወሻዎች' : 'Delivery Notes'}
              </Label>
              <Textarea
                id="notes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder={language === 'am' ? 'ተጨማሪ መመሪያዎች (ያልተጠየቀ)' : 'Additional instructions (optional)'}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">
              {language === 'am' ? 'የክፍያ ዘዴ' : 'Payment Method'}
            </h2>
          </div>
          <div className="bg-muted rounded-xl p-4 flex items-center gap-4">
            <div className="bg-card rounded-lg p-2">
              <span className="text-2xl">💵</span>
            </div>
            <div>
              <p className="font-medium">
                {language === 'am' ? 'በደረሰኝ ላይ ክፍያ' : 'Pay on Delivery'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'am' 
                  ? 'ምርቶች ሲደርሱ ይከፍሉ' 
                  : 'Pay when products are delivered'
                }
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {language === 'am' 
              ? '* ተጨማሪ የክፍያ አማራጮች በቅርቡ ይመጣሉ (Chapa, Telebirr)'
              : '* More payment options coming soon (Chapa, Telebirr)'
            }
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 safe-area-bottom">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">{t('order.total')}</span>
          <span className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} ETB</span>
        </div>
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={() => placeOrderMutation.mutate()}
          disabled={placeOrderMutation.isPending || !deliveryAddress.trim()}
        >
          {placeOrderMutation.isPending 
            ? t('action.loading') 
            : (language === 'am' ? 'ትዕዛዝ አስገባ' : 'Place Order')
          }
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
