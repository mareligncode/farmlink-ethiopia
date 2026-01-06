import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Package, Plus, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

type ProductCategory = 'grains' | 'vegetables' | 'fruits' | 'legumes' | 'spices' | 'coffee' | 'oilseeds' | 'livestock' | 'dairy' | 'honey' | 'other';

const categories: { key: ProductCategory | 'all'; emoji: string }[] = [
  { key: 'all', emoji: '🌍' },
  { key: 'grains', emoji: '🌾' },
  { key: 'vegetables', emoji: '🥬' },
  { key: 'fruits', emoji: '🍎' },
  { key: 'legumes', emoji: '🫘' },
  { key: 'coffee', emoji: '☕' },
  { key: 'spices', emoji: '🌶️' },
  { key: 'honey', emoji: '🍯' },
  { key: 'dairy', emoji: '🥛' },
  { key: 'livestock', emoji: '🐄' },
  { key: 'oilseeds', emoji: '🌻' },
];

const Products: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const isFarmer = profile?.role === 'farmer';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, profiles!products_farmer_id_fkey(full_name, farm_name, farm_location)')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.or(`name_en.ilike.%${searchQuery}%,name_am.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-6 pt-8 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{t('nav.products')}</h1>
          {isFarmer && (
            <Link to="/products/add">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                {t('product.add')}
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t('action.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-muted border-0"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium",
                selectedCategory === cat.key
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span>{cat.emoji}</span>
              <span>
                {cat.key === 'all' 
                  ? (language === 'am' ? 'ሁሉም' : 'All')
                  : t(`category.${cat.key}`)
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <div className="bg-card rounded-2xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <div className="aspect-square bg-muted relative">
                    {product.image_urls && product.image_urls[0] ? (
                      <img 
                        src={product.image_urls[0]} 
                        alt={product.name_en}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
                      {categories.find(c => c.key === product.category)?.emoji} {t(`category.${product.category}`)}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">
                      {language === 'am' && product.name_am ? product.name_am : product.name_en}
                    </p>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {product.profiles?.farm_location || product.location || 'Ethiopia'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-primary font-bold">
                        {product.price} ETB
                        <span className="text-muted-foreground font-normal text-xs">/{product.unit}</span>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {product.quantity} {product.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{t('message.noProducts')}</p>
            {isFarmer && (
              <Link to="/products/add">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('product.add')}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
