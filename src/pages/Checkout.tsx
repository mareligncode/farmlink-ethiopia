import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cartAPI, ordersAPI, paymentsAPI } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'chapa' | 'cod';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('chapa');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Check for payment callback
  const paymentStatus = searchParams.get('status');
  const txRef = searchParams.get('tx_ref');

  const { data: cartItems } = useQuery({
    queryKey: ['cart', profile?.id],
    queryFn: async () => {
      const response = await cartAPI.getItems();
      return response.data;
    },
    enabled: !!profile,
  });

  // Group cart items by farmer
  const groupedByFarmer = cartItems?.reduce((acc, item) => {
    const farmerId = item.productId?.farmerId?.id || item.productId?.farmerId?._id;
    if (!farmerId) return acc;
    
    if (!acc[farmerId]) {
      acc[farmerId] = {
        farmerId,
        farmerName: item.productId?.farmerId?.fullName,
        items: [],
        total: 0,
      };
    }
    
    acc[farmerId].items.push(item);
    acc[farmerId].total += Number(item.productId?.price || 0) * Number(item.quantity);
    
    return acc;
  }, {} as Record<string, { farmerId: string; farmerName: string; items: typeof cartItems; total: number }>);

  const totalAmount = cartItems?.reduce((sum, item) => {
    return sum + (Number(item.productId?.price || 0) * Number(item.quantity));
  }, 0) || 0;

  const createOrdersMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !cartItems || cartItems.length === 0) {
        throw new Error('No items in cart');
      }

      const orderIds: string[] = [];

      // Create orders for each farmer
      for (const group of Object.values(groupedByFarmer || {})) {
        const items = group.items.map(item => ({
          productId: item.productId?.id || item.productId?._id || '',
          quantity: item.quantity,
          unitPrice: item.productId?.price || 0,
          totalPrice: Number(item.productId?.price || 0) * Number(item.quantity),
        }));

        const response = await ordersAPI.create({
          farmerId: group.farmerId,
          items,
          totalAmount: group.total,
          deliveryAddress,
          deliveryNotes,
          paymentMethod,
        });

        const orderId = response.data.id || response.data._id || '';
        orderIds.push(orderId);
      }

      return orderIds;
    },
  });

  const initiateChapaPayment = async (orderIds: string[]) => {
    if (!profile) return;

    setIsProcessingPayment(true);

    try {
      const callbackUrl = `${window.location.origin}/checkout?status=complete&tx_ref=`;

      const response = await paymentsAPI.initializeChapa({
        orderId: orderIds[0],
        amount: totalAmount,
        email: profile.email || `${profile.id}@agriconnect.app`,
        firstName: profile.full_name?.split(' ')[0] || 'Customer',
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
        callbackUrl,
      });

      if (response.checkoutUrl) {
        // Clear cart before redirect
        await cartAPI.clear();
        
        // Redirect to Chapa checkout
        window.location.href = response.checkoutUrl;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: language === 'am' ? 'ክፍያ ስህተት' : 'Payment Error',
        description: message,
        variant: 'destructive',
      });
      setIsProcessingPayment(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እባክዎ አድራሻ ያስገቡ' : 'Please enter delivery address',
        variant: 'destructive',
      });
      return;
    }

    try {
      const orderIds = await createOrdersMutation.mutateAsync();

      if (paymentMethod === 'chapa') {
        await initiateChapaPayment(orderIds);
      } else {
        // Cash on delivery - just clear cart and show success
        await cartAPI.clear();
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        setOrderPlaced(true);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Order failed';
      toast({
        title: t('message.error'),
        description: message,
        variant: 'destructive',
      });
    }
  };

  // Handle payment return
  if (paymentStatus === 'complete' && txRef) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="bg-leaf/10 rounded-full p-6 mb-6 animate-scale-in">
          <CheckCircle className="h-20 w-20 text-leaf" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {language === 'am' ? 'ክፍያ ተሳክቷል!' : 'Payment Successful!'}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          {language === 'am' 
            ? 'ክፍያዎ ተቀብሏል። ትዕዛዝዎ በሂደት ላይ ነው።'
            : 'Your payment has been received. Your order is being processed.'
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
            {cartItems?.map((item) => {
              const product = item.productId;
              return (
                <div key={item.id || item._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌾</span>
                    <div>
                      <p className="text-sm font-medium">
                        {language === 'am' && product?.nameAm 
                          ? product.nameAm 
                          : product?.nameEn
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {product?.price} ETB
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">
                    {(Number(product?.price || 0) * Number(item.quantity)).toFixed(2)} ETB
                  </span>
                </div>
              );
            })}
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
          
          <div className="space-y-3">
            {/* Chapa Option */}
            <button
              onClick={() => setPaymentMethod('chapa')}
              className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all ${
                paymentMethod === 'chapa' 
                  ? 'bg-primary/10 border-2 border-primary' 
                  : 'bg-muted border-2 border-transparent'
              }`}
            >
              <div className="bg-[#7dc243] rounded-lg p-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CHAPA</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-medium">
                  {language === 'am' ? 'በቻፓ ይክፈሉ' : 'Pay with Chapa'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'am' 
                    ? 'ደህንነቱ የተጠበቀ የመስመር ላይ ክፍያ' 
                    : 'Secure online payment'
                  }
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'chapa' ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}>
                {paymentMethod === 'chapa' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>

            {/* Cash on Delivery Option */}
            <button
              onClick={() => setPaymentMethod('cod')}
              className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all ${
                paymentMethod === 'cod' 
                  ? 'bg-primary/10 border-2 border-primary' 
                  : 'bg-muted border-2 border-transparent'
              }`}
            >
              <div className="bg-card rounded-lg p-2">
                <span className="text-2xl">💵</span>
              </div>
              <div className="text-left flex-1">
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
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}>
                {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          </div>

          {paymentMethod === 'chapa' && (
            <div className="mt-4 p-3 bg-leaf/10 rounded-lg flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-leaf mt-0.5 flex-shrink-0" />
              <p className="text-xs text-leaf">
                {language === 'am' 
                  ? 'ደህንነቱ የተጠበቀ ክፍያ በቻፓ። ባንክ፣ ሞባይል ባንኪንግ፣ እና ካርድ ይቀበላል።'
                  : 'Secure payment via Chapa. Accepts bank, mobile banking, and cards.'
                }
              </p>
            </div>
          )}
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
          onClick={handlePlaceOrder}
          disabled={createOrdersMutation.isPending || isProcessingPayment}
        >
          {(createOrdersMutation.isPending || isProcessingPayment) && (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          )}
          {isProcessingPayment 
            ? (language === 'am' ? 'ወደ ክፍያ በመሄድ ላይ...' : 'Redirecting to payment...')
            : paymentMethod === 'chapa'
              ? (language === 'am' ? 'ክፍያ ይክፈሉ' : 'Pay Now')
              : (language === 'am' ? 'ትዕዛዝ ያስገቡ' : 'Place Order')
          }
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
