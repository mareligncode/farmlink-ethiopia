import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Loader2, 
  RefreshCw,
  XCircle,
  Receipt,
  Calendar,
  CreditCard,
  FileText,
  AlertTriangle,
  Printer,
  Share2,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI, Order } from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ORDER_STEPS = [
  { status: 'pending', icon: Clock, label: { en: 'Order Placed', am: 'ትዕዛዝ ቀርቧል' }, description: { en: 'Waiting for confirmation', am: 'ማረጋገጫ በመጠባበቅ ላይ' } },
  { status: 'confirmed', icon: CheckCircle, label: { en: 'Confirmed', am: 'ተረጋግጧል' }, description: { en: 'Order has been confirmed', am: 'ትዕዛዝ ተረጋግጧል' } },
  { status: 'processing', icon: Package, label: { en: 'Processing', am: 'በሂደት ላይ' }, description: { en: 'Being prepared for shipment', am: 'ለመላኪያ በመዘጋጀት ላይ' } },
  { status: 'shipped', icon: Truck, label: { en: 'Shipped', am: 'ተልኳል' }, description: { en: 'On the way to delivery', am: 'በመድረሻ መንገድ ላይ' } },
  { status: 'delivered', icon: CheckCircle, label: { en: 'Delivered', am: 'ደርሷል' }, description: { en: 'Successfully delivered', am: 'በተሳካ ሁኔታ ደርሷል' } },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'confirmed': return 'bg-blue-500';
    case 'processing': return 'bg-indigo-500';
    case 'shipped': return 'bg-purple-500';
    case 'delivered': return 'bg-green-500';
    case 'cancelled': return 'bg-destructive';
    default: return 'bg-muted';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'default';
    case 'pending': return 'secondary';
    case 'failed': return 'destructive';
    default: return 'outline';
  }
};

const OrderDetail: React.FC = () => {
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
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      ordersAPI.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ 
        title: language === 'am' ? 'ሁኔታ ተዘምኗል' : 'Status Updated', 
        description: language === 'am' ? 'የትዕዛዝ ሁኔታ በተሳካ ሁኔታ ተዘምኗል' : 'Order status has been updated successfully' 
      });
    },
    onError: (error: Error) => {
      toast({ title: language === 'am' ? 'ስህተት' : 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersAPI.updateStatus(orderId, 'cancelled'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ 
        title: language === 'am' ? 'ትዕዛዝ ተሰርዟል' : 'Order Cancelled', 
        description: language === 'am' ? 'ትዕዛዙ በተሳካ ሁኔታ ተሰርዟል' : 'The order has been cancelled successfully' 
      });
    },
    onError: (error: Error) => {
      toast({ title: language === 'am' ? 'ስህተት' : 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && order) {
      try {
        await navigator.share({
          title: `Order #${(order._id || order.id).slice(-8).toUpperCase()}`,
          text: `Order details - Total: ${order.totalAmount.toLocaleString()} ${order.currency}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: language === 'am' ? 'ተቀድቷል' : 'Copied',
        description: language === 'am' ? 'አገናኙ ተቀድቷል' : 'Link copied to clipboard',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">
          {language === 'am' ? 'ትዕዛዝ አልተገኘም' : 'Order not found'}
        </p>
        <Button onClick={() => navigate('/orders')}>
          {language === 'am' ? 'ወደ ትዕዛዞች ተመለስ' : 'Back to Orders'}
        </Button>
      </div>
    );
  }

  const isFarmer = profile?.role === 'farmer';
  const currentStepIndex = ORDER_STEPS.findIndex(step => step.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const orderId = order._id || order.id;
  const orderNumber = orderId.slice(-8).toUpperCase();

  const getNextStatus = () => {
    const currentIndex = ORDER_STEPS.findIndex(s => s.status === order.status);
    if (currentIndex < ORDER_STEPS.length - 1) return ORDER_STEPS[currentIndex + 1];
    return null;
  };

  const handleUpdateStatus = () => {
    const nextStatus = getNextStatus();
    if (nextStatus && orderId) {
      updateStatusMutation.mutate({ orderId, status: nextStatus.status });
    }
  };

  const canCancel = !isCancelled && !isDelivered && order.status !== 'shipped';

  return (
    <div className="min-h-screen bg-background pb-24 print:pb-0">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10 safe-area-top print:hidden">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">
                {language === 'am' ? 'ትዕዛዝ ዝርዝር' : 'Order Details'}
              </h1>
              <p className="text-sm text-muted-foreground">#{orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePrint}>
              <Printer className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Order Summary Header */}
        <div className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-5 w-5 text-primary" />
                <span className="font-mono text-lg font-bold">#{orderNumber}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleTimeString(language === 'am' ? 'am-ET' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                className={`${getStatusColor(order.status)} text-white px-3 py-1`}
              >
                {isCancelled 
                  ? (language === 'am' ? 'ተሰርዟል' : 'Cancelled')
                  : ORDER_STEPS.find(s => s.status === order.status)?.label[language] || order.status
                }
              </Badge>
              <Badge variant={getPaymentStatusColor(order.paymentStatus) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                <CreditCard className="h-3 w-3 mr-1" />
                {order.paymentStatus === 'paid' 
                  ? (language === 'am' ? 'ተከፍሏል' : 'Paid') 
                  : order.paymentStatus === 'pending'
                  ? (language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending')
                  : (language === 'am' ? 'ያልተሳካ' : 'Failed')
                }
              </Badge>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {language === 'am' ? 'የትዕዛዝ ሂደት' : 'Order Timeline'}
            </CardTitle>
            <CardDescription>
              {language === 'am' 
                ? 'የትዕዛዝዎን ሂደት ይከታተሉ' 
                : 'Track your order progress'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCancelled ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {language === 'am' ? 'ትዕዛዙ ተሰርዟል' : 'Order Cancelled'}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {language === 'am' 
                    ? 'ይህ ትዕዛዝ ተሰርዟል። ለተጨማሪ መረጃ እባክዎ ያግኙን።' 
                    : 'This order has been cancelled. Please contact us for more information.'
                  }
                </p>
              </div>
            ) : (
              <div className="relative pl-8">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-muted" />
                <div 
                  className="absolute left-[15px] top-2 w-0.5 bg-primary transition-all duration-500" 
                  style={{ height: `${Math.max(0, (currentStepIndex / (ORDER_STEPS.length - 1)) * 100)}%` }} 
                />

                <div className="space-y-8">
                  {ORDER_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;
                    
                    return (
                      <div key={step.status} className="relative flex gap-4">
                        <div 
                          className={`absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300
                            ${isCompleted 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                            }
                            ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                          `}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label[language]}
                            </p>
                            {isCurrent && (
                              <Badge variant="outline" className="text-xs animate-pulse">
                                {language === 'am' ? 'አሁን' : 'Current'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {step.description[language]}
                          </p>
                        </div>
                        {isCompleted && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons for Farmer */}
        {isFarmer && !isCancelled && !isDelivered && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Package className="h-5 w-5" />
                {language === 'am' ? 'የገበሬ እርምጃዎች' : 'Farmer Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              {getNextStatus() && (
                <Button 
                  className="flex-1" 
                  onClick={handleUpdateStatus} 
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'am' 
                    ? `ወደ "${getNextStatus()?.label.am}" ቀይር` 
                    : `Update to "${getNextStatus()?.label.en}"`
                  }
                </Button>
              )}
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1 sm:flex-none">
                      <XCircle className="h-4 w-4 mr-2" />
                      {language === 'am' ? 'ትዕዛዝ ሰርዝ' : 'Cancel Order'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        {language === 'am' ? 'ትዕዛዝ ይሰረዝ?' : 'Cancel Order?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {language === 'am' 
                          ? 'ይህን ትዕዛዝ ለመሰረዝ እርግጠኛ ነዎት? ይህ ድርጊት ሊቀለበስ አይችልም።' 
                          : 'Are you sure you want to cancel this order? This action cannot be undone.'
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {language === 'am' ? 'ተመለስ' : 'Go Back'}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => cancelOrderMutation.mutate(orderId)}
                        disabled={cancelOrderMutation.isPending}
                      >
                        {cancelOrderMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {language === 'am' ? 'አዎ፣ ሰርዝ' : 'Yes, Cancel'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {language === 'am' ? 'የታዘዙ ንጥሎች' : 'Order Items'}
              <Badge variant="secondary" className="ml-auto">
                {order.items.length} {language === 'am' ? 'ንጥሎች' : 'items'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index}>
                  <div className="flex items-start gap-4">
                    {item.productId?.imageUrls?.[0] ? (
                      <img 
                        src={item.productId.imageUrls[0]} 
                        alt={item.productId.nameEn} 
                        className="w-20 h-20 rounded-xl object-cover bg-muted" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {language === 'am' && item.productId?.nameAm 
                          ? item.productId.nameAm 
                          : item.productId?.nameEn || 'Product'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.quantity} × {item.unitPrice.toLocaleString()} ETB
                      </p>
                    </div>
                    <p className="font-bold text-lg">
                      {item.totalPrice.toLocaleString()} ETB
                    </p>
                  </div>
                  {index < order.items.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'am' ? 'ንዑስ ድምር' : 'Subtotal'}</span>
                <span>{order.totalAmount.toLocaleString()} {order.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'am' ? 'የማድረስ ክፍያ' : 'Delivery Fee'}</span>
                <span className="text-green-600">{language === 'am' ? 'ነፃ' : 'Free'}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>{language === 'am' ? 'ጠቅላላ' : 'Total'}</span>
                <span className="text-primary">{order.totalAmount.toLocaleString()} {order.currency}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5" />
                {isFarmer 
                  ? (language === 'am' ? 'የገዢ መረጃ' : 'Buyer Information') 
                  : (language === 'am' ? 'የሻጭ መረጃ' : 'Seller Information')
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {isFarmer 
                      ? (order.merchantId?.businessName || order.merchantId?.fullName) 
                      : (order.farmerId?.farmName || order.farmerId?.fullName)
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isFarmer ? (language === 'am' ? 'ነጋዴ' : 'Merchant') : (language === 'am' ? 'ገበሬ' : 'Farmer')}
                  </p>
                </div>
              </div>
              
              {(isFarmer ? order.merchantId?.phone : order.farmerId?.phone) && (
                <a 
                  href={`tel:${isFarmer ? order.merchantId.phone : order.farmerId?.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="font-medium">{isFarmer ? order.merchantId.phone : order.farmerId?.phone}</span>
                </a>
              )}

              {(isFarmer ? order.merchantId?.email : order.farmerId?.email) && (
                <a 
                  href={`mailto:${isFarmer ? order.merchantId.email : order.farmerId?.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="font-medium truncate">
                    {isFarmer ? order.merchantId.email : order.farmerId?.email}
                  </span>
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-5 w-5" />
                {language === 'am' ? 'የመድረሻ አድራሻ' : 'Delivery Address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.deliveryAddress ? (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm">{order.deliveryAddress}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {language === 'am' ? 'ምንም አድራሻ አልተሰጠም' : 'No address provided'}
                </p>
              )}

              {order.deliveryNotes && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {language === 'am' ? 'የመላኪያ ማስታወሻዎች' : 'Delivery Notes'}
                  </p>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">{order.deliveryNotes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Reference */}
        {order.paymentReference && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-5 w-5" />
                {language === 'am' ? 'የክፍያ መረጃ' : 'Payment Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">
                  {language === 'am' ? 'የማጣቀሻ ቁጥር' : 'Reference Number'}
                </span>
                <span className="font-mono font-medium">{order.paymentReference}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;