import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ordersAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { Button } from '@/components/ui/button';
import OrderFilters, { OrderFiltersState } from '@/components/orders/OrderFilters';
import ExportOrdersButton from '@/components/orders/ExportOrdersButton';

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

  const [filters, setFilters] = useState<OrderFiltersState>({
    search: '',
    status: 'all',
    dateFrom: undefined,
    dateTo: undefined,
  });

  const { data: orders, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders', profile?.id, profile?.role],
    queryFn: async () => {
      const response = await ordersAPI.getAll();
      return response.data;
    },
    enabled: !!profile,
    refetchInterval: 30000,
  });

  // Real-time polling for order updates
  useRealtimeOrders({ enabled: !!profile });

  // Filter orders based on filters state
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }

      // Date range filter
      const orderDate = new Date(order.createdAt);
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (orderDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const orderId = (order.id || order._id || '').toLowerCase();
        
        // Search by order ID
        if (orderId.includes(searchLower)) return true;

        // Search by product names in items
        if (order.items?.some((item: any) => {
          const product = item.productId;
          if (typeof product === 'object' && product !== null) {
            const nameEn = (product.nameEn || '').toLowerCase();
            const nameAm = (product.nameAm || '').toLowerCase();
            return nameEn.includes(searchLower) || nameAm.includes(searchLower);
          }
          return false;
        })) return true;

        // Search by farmer/merchant name
        const otherProfile = isFarmer ? order.merchantId : order.farmerId;
        if (typeof otherProfile === 'object' && otherProfile !== null) {
          const name = (otherProfile.fullName || otherProfile.businessName || otherProfile.farmName || '').toLowerCase();
          if (name.includes(searchLower)) return true;
        }

        return false;
      }

      return true;
    });
  }, [orders, filters, isFarmer]);

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 safe-area-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('nav.orders')}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isFarmer 
                ? (language === 'am' ? 'ከገዢዎች የተቀበሉ ትዕዛዞች' : 'Orders received from buyers')
                : (language === 'am' ? 'እርስዎ ያስቀመጡ ትዕዛዞች' : 'Orders you have placed')
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportOrdersButton 
              orders={filteredOrders} 
              isFarmer={isFarmer} 
              disabled={isLoading}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => refetch()} 
              disabled={isRefetching}
              className="shrink-0"
            >
              <RefreshCw className={cn("h-5 w-5", isRefetching && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Filters */}
        <div className="mb-4">
          <OrderFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
            onClearFilters={clearFilters} 
          />
        </div>

        {/* Results count */}
        {!isLoading && orders && orders.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'am' 
              ? `${filteredOrders.length} ከ ${orders.length} ትዕዛዞች ይታያሉ` 
              : `Showing ${filteredOrders.length} of ${orders.length} orders`}
          </p>
        )}

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
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
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
                      {order.items?.slice(0, 4).map((item: any, i: number) => {
                        const product = item.productId as { imageUrls?: string[]; nameEn?: string } | undefined;
                        return (
                          <div key={i} className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            {product?.imageUrls?.[0] ? (
                              <img 
                                src={product.imageUrls[0]} 
                                alt={product?.nameEn || ''} 
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
        ) : orders && orders.length > 0 ? (
          // No results after filtering
          <div className="text-center py-16">
            <div className="bg-muted rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {language === 'am' ? 'ምንም ውጤት የለም' : 'No results found'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'am' 
                ? 'ማጣሪያዎችዎን ለማሻሻል ይሞክሩ' 
                : 'Try adjusting your filters'}
            </p>
            <Button variant="outline" onClick={clearFilters}>
              {language === 'am' ? 'ማጣሪያዎችን አጽዳ' : 'Clear Filters'}
            </Button>
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
