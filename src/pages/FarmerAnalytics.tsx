import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, Package, DollarSign, Star, ShoppingBag, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartPie, Pie, Cell } from 'recharts';

const COLORS = ['hsl(142, 45%, 35%)', 'hsl(35, 70%, 55%)', 'hsl(25, 85%, 55%)', 'hsl(200, 60%, 55%)', 'hsl(0, 70%, 50%)'];

const FarmerAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { profile } = useAuth();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['farmer-analytics'],
    queryFn: async () => {
      const response = await analyticsAPI.getDashboard();
      return response.data;
    },
    enabled: profile?.role === 'farmer',
  });

  if (profile?.role !== 'farmer') {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">{language === 'am' ? 'ይህ ገጽ ለገበሬዎች ብቻ ነው' : 'This page is only for farmers'}</p></div>;
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error || !analytics) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-destructive">{language === 'am' ? 'መረጃ መጫን አልተቻለም' : 'Failed to load analytics'}</p></div>;
  }

  const categoryLabels: Record<string, { en: string; am: string }> = {
    grains: { en: 'Grains', am: 'እህሎች' }, vegetables: { en: 'Vegetables', am: 'አትክልቶች' }, fruits: { en: 'Fruits', am: 'ፍራፍሬዎች' },
    legumes: { en: 'Legumes', am: 'ጥራጥሬዎች' }, spices: { en: 'Spices', am: 'ቅመማ ቅመም' }, coffee: { en: 'Coffee', am: 'ቡና' },
    oilseeds: { en: 'Oilseeds', am: 'የዘይት ዘሮች' }, livestock: { en: 'Livestock', am: 'እንስሳት' }, dairy: { en: 'Dairy', am: 'የወተት ውጤቶች' },
    honey: { en: 'Honey', am: 'ማር' }, other: { en: 'Other', am: 'ሌላ' },
  };

  // Transform API data to match component expectations
  const dashboardData = analytics ? {
    summary: {
      totalRevenue: analytics.totalRevenue || 0,
      totalOrders: analytics.totalOrders || 0,
      totalProducts: analytics.totalProducts || 0,
      availableProducts: analytics.totalProducts || 0,
      avgRating: 0,
      totalReviews: 0,
    },
    monthlyRevenue: analytics.revenueByMonth || [],
    categoryBreakdown: [] as Array<{ category: string; revenue: number }>,
    ordersByStatus: analytics.ordersByStatus?.reduce((acc: Record<string, number>, item: { status: string; count: number }) => {
      acc[item.status] = item.count;
      return acc;
    }, {}) || {},
    popularProducts: analytics.topProducts?.map((item: { product: { id?: string; _id?: string; nameEn: string; nameAm?: string; imageUrls?: string[] }; revenue: number; totalSold: number }) => ({
      id: item.product?.id || item.product?._id || '',
      nameEn: item.product?.nameEn || '',
      nameAm: item.product?.nameAm || '',
      imageUrl: item.product?.imageUrls?.[0] || '',
      orderCount: item.totalSold || 0,
      revenue: item.revenue || 0,
    })) || [],
  } : null;

  if (!dashboardData) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-destructive">{language === 'am' ? 'መረጃ መጫን አልተቻለም' : 'Failed to load analytics'}</p></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 safe-area-top">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-6 w-6" /></button>
          <div>
            <h1 className="text-xl font-bold">{language === 'am' ? 'ትንታኔ ዳሽቦርድ' : 'Analytics Dashboard'}</h1>
            <p className="text-sm text-muted-foreground">{language === 'am' ? 'የሽያጭ እና የምርት አፈጻጸም' : 'Sales and product performance'}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><DollarSign className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{language === 'am' ? 'ጠቅላላ ገቢ' : 'Total Revenue'}</p><p className="text-xl font-bold">{dashboardData.summary.totalRevenue.toLocaleString()} ETB</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-secondary/10"><ShoppingBag className="h-5 w-5 text-secondary" /></div><div><p className="text-sm text-muted-foreground">{language === 'am' ? 'ጠቅላላ ትዕዛዞች' : 'Total Orders'}</p><p className="text-xl font-bold">{dashboardData.summary.totalOrders}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-accent/10"><Package className="h-5 w-5 text-accent" /></div><div><p className="text-sm text-muted-foreground">{language === 'am' ? 'ምርቶች' : 'Products'}</p><p className="text-xl font-bold">{dashboardData.summary.availableProducts}/{dashboardData.summary.totalProducts}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><Star className="h-5 w-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">{language === 'am' ? 'አማካይ ደረጃ' : 'Avg Rating'}</p><p className="text-xl font-bold">{dashboardData.summary.avgRating}/5 ({dashboardData.summary.totalReviews})</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />{language === 'am' ? 'ወርሃዊ ገቢ' : 'Monthly Revenue'}</CardTitle><CardDescription>{language === 'am' ? 'የመጨረሻዎቹ 6 ወራት' : 'Last 6 months'}</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dashboardData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} ETB`, language === 'am' ? 'ገቢ' : 'Revenue']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="revenue" fill="hsl(142, 45%, 35%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {dashboardData.categoryBreakdown.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />{language === 'am' ? 'በምድብ ሽያጭ' : 'Sales by Category'}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartPie>
                  <Pie data={dashboardData.categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="revenue" nameKey="category" label={({ category, percent }: { category: string; percent: number }) => `${(categoryLabels[category]?.[language] || category)}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {dashboardData.categoryBreakdown.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString()} ETB`, categoryLabels[name]?.[language] || name]} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </RechartPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>{language === 'am' ? 'የትዕዛዝ ሁኔታ' : 'Order Status'}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(dashboardData.ordersByStatus).map(([status, count]) => (<div key={status} className="text-center p-3 bg-muted/50 rounded-lg"><p className="text-lg font-bold">{count as number}</p><p className="text-xs text-muted-foreground capitalize">{status}</p></div>))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />{language === 'am' ? 'ተወዳጅ ምርቶች' : 'Popular Products'}</CardTitle></CardHeader>
          <CardContent>
            {dashboardData.popularProducts.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.popularProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{index + 1}</span>
                    {product.imageUrl && <img src={product.imageUrl} alt={product.nameEn} className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0"><p className="font-medium truncate">{language === 'am' && product.nameAm ? product.nameAm : product.nameEn}</p><p className="text-sm text-muted-foreground">{product.orderCount} {language === 'am' ? 'ትዕዛዞች' : 'orders'}</p></div>
                    <p className="font-semibold text-primary">{product.revenue.toLocaleString()} ETB</p>
                  </div>
                ))}
              </div>
            ) : (<p className="text-muted-foreground text-center py-4">{language === 'am' ? 'እስካሁን ምንም ሽያጭ የለም' : 'No sales yet'}</p>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerAnalytics;
