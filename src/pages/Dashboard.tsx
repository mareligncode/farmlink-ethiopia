import React from 'react';
import { Package, TrendingUp, ShoppingCart, Bell, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI, ordersAPI, notificationsAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import AIRecommendations from '@/components/ai/AIRecommendations';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const isFarmer = profile?.role === 'farmer';

  // Fetch user's products (for farmers) or recent products (for merchants)
  const { data: productsData } = useQuery({
    queryKey: ['dashboard-products', profile?.id],
    queryFn: async () => {
      const params = isFarmer ? { farmerId: profile?.id } : {};
      const response = await productsAPI.getAll(params);
      return response.data.slice(0, 4);
    },
    enabled: !!profile,
  });

  // Fetch orders
  const { data: ordersData } = useQuery({
    queryKey: ['dashboard-orders', profile?.id],
    queryFn: async () => {
      const response = await ordersAPI.getAll();
      return response.data.slice(0, 5);
    },
    enabled: !!profile,
  });

  // Fetch unread notifications count
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications', profile?.id],
    queryFn: async () => {
      const response = await notificationsAPI.getUnreadCount();
      return response.count;
    },
    enabled: !!profile,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'am' ? 'እንደምን አደርክ' : 'Good morning';
    if (hour < 17) return language === 'am' ? 'እንደምን ዋልክ' : 'Good afternoon';
    return language === 'am' ? 'እንደምን አመሸህ' : 'Good evening';
  };

  const stats = isFarmer
    ? [
        { icon: Package, label: language === 'am' ? 'ምርቶች' : 'Products', value: productsData?.length || 0, color: 'bg-primary/10 text-primary' },
        { icon: ShoppingCart, label: language === 'am' ? 'ትዕዛዞች' : 'Orders', value: ordersData?.length || 0, color: 'bg-secondary/20 text-secondary' },
        { icon: TrendingUp, label: language === 'am' ? 'በመጠባበቅ' : 'Pending', value: ordersData?.filter(o => o.status === 'pending').length || 0, color: 'bg-accent/10 text-accent' },
      ]
    : [
        { icon: Package, label: language === 'am' ? 'ምርቶች' : 'Available', value: productsData?.length || 0, color: 'bg-primary/10 text-primary' },
        { icon: ShoppingCart, label: language === 'am' ? 'ትዕዛዞች' : 'My Orders', value: ordersData?.length || 0, color: 'bg-secondary/20 text-secondary' },
        { icon: Bell, label: language === 'am' ? 'ማሳወቂያዎች' : 'Alerts', value: unreadCount || 0, color: 'bg-accent/10 text-accent' },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-6 pt-8 pb-16 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm">{greeting()},</p>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {profile?.full_name || 'User'}
            </h1>
          </div>
          <Link to="/notifications" className="relative">
            <div className="bg-card/20 backdrop-blur-sm rounded-full p-3">
              <Bell className="h-6 w-6 text-primary-foreground" />
              {unreadCount && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card/20 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className={`mx-auto w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-primary-foreground">{stat.value}</p>
              <p className="text-primary-foreground/70 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-8">
        {/* AI Recommendations for Merchants */}
        {!isFarmer && (
          <div className="mb-6 animate-slide-up">
            <AIRecommendations />
          </div>
        )}

        {/* Quick Actions */}
        {isFarmer && (
          <Link to="/products/add">
            <div className="bg-card rounded-2xl shadow-md p-4 flex items-center justify-between mb-6 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{t('product.add')}</p>
                  <p className="text-muted-foreground text-sm">
                    {language === 'am' ? 'አዲስ ምርት ይጨምሩ' : 'List a new product'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        )}

        {/* Recent Products */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {isFarmer 
                ? (language === 'am' ? 'የእኔ ምርቶች' : 'My Products')
                : (language === 'am' ? 'የቅርብ ጊዜ ምርቶች' : 'Recent Products')
              }
            </h2>
            <Link to="/products" className="text-primary text-sm font-medium">
              {language === 'am' ? 'ሁሉንም ይመልከቱ' : 'View all'}
            </Link>
          </div>

          {productsData && productsData.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {productsData.map((product) => (
                <Link key={product.id || product._id} to={`/products/${product.id || product._id}`}>
                  <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
                    <div className="aspect-square bg-muted relative">
                      {product.imageUrls && product.imageUrls[0] ? (
                        <img 
                          src={product.imageUrls[0]} 
                          alt={product.nameEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      {!product.isAvailable && (
                        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                            {t('product.outOfStock')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm truncate">
                        {language === 'am' && product.nameAm ? product.nameAm : product.nameEn}
                      </p>
                      <p className="text-primary font-bold">
                        {product.price} {product.currency}
                        <span className="text-muted-foreground font-normal text-xs">/{product.unit}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">{t('message.noProducts')}</p>
              {isFarmer && (
                <Link to="/products/add">
                  <Button variant="default" size="sm" className="mt-4">
                    {t('product.add')}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {language === 'am' ? 'የቅርብ ጊዜ ትዕዛዞች' : 'Recent Orders'}
            </h2>
            <Link to="/orders" className="text-primary text-sm font-medium">
              {language === 'am' ? 'ሁሉንም ይመልከቱ' : 'View all'}
            </Link>
          </div>

          {ordersData && ordersData.length > 0 ? (
            <div className="space-y-3">
              {ordersData.slice(0, 3).map((order) => (
                <Link key={order.id || order._id} to={`/orders/${order.id || order._id}`}>
                  <div className="bg-card rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        #{(order.id || order._id || '').slice(0, 8)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {order.totalAmount} {order.currency}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'delivered' ? 'bg-leaf/10 text-leaf' :
                        order.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                        'bg-secondary/20 text-secondary-foreground'
                      }`}>
                        {t(`order.${order.status}`)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">{t('message.noOrders')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
