import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ordersAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { icon: Clock, color: 'text-secondary', bg: 'bg-secondary/10' },
  confirmed: { icon: CheckCircle, color: 'text-sky', bg: 'bg-sky/10' },
  processing: { icon: Package, color: 'text-accent', bg: 'bg-accent/10' },
  shipped: { icon: Truck, color: 'text-primary', bg: 'bg-primary/10' },
  delivered: { icon: CheckCircle, color: 'text-leaf', bg: 'bg-leaf/10' },
  cancelled: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

const Orders: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const isFarmer = profile?.role === 'farmer';

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', profile?.id, profile?.role],
    queryFn: async () => {
      const response = await ordersAPI.getAll();
      return response.data;
    },
    enabled: !!profile,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 safe-area-top">
        <h1 className="text-2xl font-bold">{t('nav.orders')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isFarmer 
            ? (language === 'am' ? 'ከገዢዎች የተቀበሉ ትዕዛዞች' : 'Orders received from buyers')
            : (language === 'am' ? 'እርስዎ ያስቀመጡ ትዕዛዞች' : 'Orders you have placed')
          }
        </p>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = order.id || order._id || '';
              const status = statusConfig[order.status as keyof typeof statusConfig];
              const StatusIcon = status?.icon || Clock;
              const otherProfile = isFarmer ? order.merchantId : order.farmerId;
              
              return (
                <Link key={orderId} to={`/orders/${orderId}`}>
                  <div className="bg-card rounded-2xl shadow-sm p-4 animate-slide-up">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">#{orderId.slice(0, 8)}</p>
                        <p className="text-muted-foreground text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-sm", status?.bg)}>
                        <StatusIcon className={cn("h-4 w-4", status?.color)} />
                        <span className={cn("font-medium", status?.color)}>
                          {t(`order.${order.status}`)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                      {order.items?.slice(0, 4).map((item, i) => {
                        const product = item.productId as { imageUrls?: string[] } | undefined;
                        return (
                          <div key={i} className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {product?.imageUrls?.[0] ? (
                              <img 
                                src={product.imageUrls[0]} 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🌾</div>
                            )}
                          </div>
                        );
                      })}
                      {order.items && order.items.length > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            +{order.items.length - 4}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isFarmer ? (language === 'am' ? 'ገዢ' : 'Buyer') : (language === 'am' ? 'ገበሬ' : 'Farmer')}
                        </p>
                        <p className="font-medium text-sm">
                          {otherProfile?.businessName || otherProfile?.farmName || otherProfile?.fullName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {order.totalAmount} ETB
                        </span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-muted rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('message.noOrders')}</h2>
            <p className="text-muted-foreground mb-6">
              {isFarmer 
                ? (language === 'am' ? 'ምርቶችዎን ይዘርዝሩ እና ትዕዛዞችን ይቀበሉ' : 'List your products to start receiving orders')
                : (language === 'am' ? 'ምርቶችን ያስሱ እና ትዕዛዝ ያስገቡ' : 'Browse products and place your first order')
              }
            </p>
            <Link to="/products">
              <button className="text-primary font-semibold hover:underline">
                {language === 'am' ? 'ምርቶችን ይመልከቱ' : 'Browse Products'}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
