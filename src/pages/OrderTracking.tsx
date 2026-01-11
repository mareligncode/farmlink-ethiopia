import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Phone, User, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI } from '@/lib/api';

const ORDER_STEPS = [
  { status: 'pending', icon: Clock, label: { en: 'Pending', am: 'በመጠባበቅ ላይ' } },
  { status: 'confirmed', icon: CheckCircle, label: { en: 'Confirmed', am: 'ተረጋግጧል' } },
  { status: 'processing', icon: Package, label: { en: 'Processing', am: 'በሂደት ላይ' } },
  { status: 'shipped', icon: Truck, label: { en: 'Shipped', am: 'ተልኳል' } },
  { status: 'delivered', icon: CheckCircle, label: { en: 'Delivered', am: 'ደርሷል' } },
];

const OrderTracking: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await ordersAPI.getById(id!);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => ordersAPI.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: language === 'am' ? 'ሁኔታ ተዘምኗል' : 'Status Updated', description: language === 'am' ? 'የትዕዛዝ ሁኔታ በተሳካ ሁኔታ ተዘምኗል' : 'Order status has been updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: language === 'am' ? 'ስህተት' : 'Error', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">{language === 'am' ? 'ትዕዛዝ አልተገኘም' : 'Order not found'}</p></div>;
  }

  const isFarmer = profile?.role === 'farmer';
  const currentStepIndex = ORDER_STEPS.findIndex(step => step.status === order.status);
  const isCancelled = order.status === 'cancelled';

  const getNextStatus = () => {
    const currentIndex = ORDER_STEPS.findIndex(s => s.status === order.status);
    if (currentIndex < ORDER_STEPS.length - 1) return ORDER_STEPS[currentIndex + 1].status;
    return null;
  };

  const handleUpdateStatus = () => {
    const nextStatus = getNextStatus();
    if (nextStatus && order.id) {
      updateStatusMutation.mutate({ orderId: order._id || order.id, status: nextStatus });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-6 w-6" /></button>
            <div>
              <h1 className="text-xl font-bold">{language === 'am' ? 'ትዕዛዝ ክትትል' : 'Order Tracking'}</h1>
              <p className="text-sm text-muted-foreground">#{(order._id || order.id).slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{language === 'am' ? 'የትዕዛዝ ሁኔታ' : 'Order Status'}</span>
              {isCancelled && <Badge variant="destructive">{language === 'am' ? 'ተሰርዟል' : 'Cancelled'}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCancelled ? (
              <p className="text-center text-muted-foreground py-4">{language === 'am' ? 'ይህ ትዕዛዝ ተሰርዟል' : 'This order has been cancelled'}</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-muted" />
                <div className="absolute left-[18px] top-0 w-0.5 bg-primary transition-all duration-500" style={{ height: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` }} />
                <div className="space-y-6">
                  {ORDER_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.status} className="flex items-center gap-4 relative">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} ${isCurrent ? 'ring-4 ring-primary/20' : ''} transition-all duration-300`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label[language]}</p>
                          {isCurrent && <p className="text-sm text-primary animate-pulse">{language === 'am' ? 'አሁን ያለበት ደረጃ' : 'Current status'}</p>}
                        </div>
                        {isCompleted && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {isFarmer && !isCancelled && order.status !== 'delivered' && (
              <div className="mt-6 pt-6 border-t border-border">
                <Button className="w-full" onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'am' ? `ወደ "${ORDER_STEPS[currentStepIndex + 1]?.label.am}" ቀይር` : `Mark as "${ORDER_STEPS[currentStepIndex + 1]?.label.en}"`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{language === 'am' ? 'የትዕዛዝ ዝርዝሮች' : 'Order Details'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-muted-foreground">{language === 'am' ? 'ቀን' : 'Date'}</span><span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{language === 'am' ? 'ንጥሎች' : 'Items'}</span><span className="font-medium">{order.items.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{language === 'am' ? 'ጠቅላላ' : 'Total'}</span><span className="font-bold text-primary">{order.totalAmount.toLocaleString()} {order.currency}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{language === 'am' ? 'ክፍያ' : 'Payment'}</span><Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>{order.paymentStatus}</Badge></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{language === 'am' ? 'ንጥሎች' : 'Items'}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  {item.productId?.imageUrls?.[0] && <img src={item.productId.imageUrls[0]} alt={item.productId.nameEn} className="w-12 h-12 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{language === 'am' && item.productId?.nameAm ? item.productId.nameAm : item.productId?.nameEn || 'Product'}</p>
                    <p className="text-sm text-muted-foreground">{item.quantity} × {item.unitPrice.toLocaleString()} ETB</p>
                  </div>
                  <p className="font-semibold">{item.totalPrice.toLocaleString()} ETB</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{isFarmer ? (language === 'am' ? 'የነጋዴ መረጃ' : 'Merchant Info') : (language === 'am' ? 'የገበሬ መረጃ' : 'Farmer Info')}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3"><User className="h-5 w-5 text-muted-foreground" /><span>{isFarmer ? (order.merchantId?.businessName || order.merchantId?.fullName) : (order.farmerId?.farmName || order.farmerId?.fullName)}</span></div>
            {(isFarmer ? order.merchantId?.phone : order.farmerId?.phone) && (
              <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><a href={`tel:${isFarmer ? order.merchantId.phone : order.farmerId?.phone}`} className="text-primary hover:underline">{isFarmer ? order.merchantId.phone : order.farmerId?.phone}</a></div>
            )}
            {order.deliveryAddress && <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-muted-foreground mt-0.5" /><span>{order.deliveryAddress}</span></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;
