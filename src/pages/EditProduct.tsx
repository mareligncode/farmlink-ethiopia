import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { productsAPI, uploadAPI, Product } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

type ProductCategory = 'grains' | 'vegetables' | 'fruits' | 'legumes' | 'spices' | 'coffee' | 'oilseeds' | 'livestock' | 'dairy' | 'honey' | 'other';

const categories: ProductCategory[] = [
  'grains', 'vegetables', 'fruits', 'legumes', 'spices', 
  'coffee', 'oilseeds', 'livestock', 'dairy', 'honey', 'other'
];

const units = ['kg', 'quintal', 'ton', 'piece', 'liter', 'dozen'];

const productSchema = z.object({
  nameEn: z.string().trim().min(2, 'Name is required').max(100),
  nameAm: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAm: z.string().optional(),
  category: z.enum(['grains', 'vegetables', 'fruits', 'legumes', 'spices', 'coffee', 'oilseeds', 'livestock', 'dairy', 'honey', 'other']),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1),
  location: z.string().optional(),
});

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nameEn: '',
    nameAm: '',
    descriptionEn: '',
    descriptionAm: '',
    category: 'other' as ProductCategory,
    price: '',
    quantity: '',
    unit: 'kg',
    location: '',
    isAvailable: true,
  });

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product data
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID');
      const response = await productsAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
  });

  // Populate form when product loads
  useEffect(() => {
    if (productData) {
      setFormData({
        nameEn: productData.nameEn || '',
        nameAm: productData.nameAm || '',
        descriptionEn: productData.descriptionEn || '',
        descriptionAm: productData.descriptionAm || '',
        category: (productData.category as ProductCategory) || 'other',
        price: productData.price?.toString() || '',
        quantity: productData.quantity?.toString() || '',
        unit: productData.unit || 'kg',
        location: productData.location || '',
        isAvailable: productData.isAvailable ?? true,
      });
      setImages(productData.imageUrls || []);
    }
  }, [productData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      toast({
        title: t('message.error'),
        description: language === 'am' ? 'ከ5 በላይ ምስሎች ማስገባት አይችሉም' : 'Cannot add more than 5 images',
        variant: 'destructive',
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setUploading(true);
    try {
      const response = await uploadAPI.uploadProductImages(filesToUpload);
      if (response.success && response.data.imageUrls) {
        setImages(prev => [...prev, ...response.data.imageUrls]);
        toast({
          title: t('message.success'),
          description: language === 'am' ? `${response.data.count} ምስሎች ተጭነዋል` : `${response.data.count} image(s) uploaded`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('message.error'),
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    const filename = imageUrl.split('/').pop();
    
    try {
      if (filename) {
        await uploadAPI.deleteProductImage(filename);
      }
      setImages(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Failed to delete image:', error);
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateProductMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !id) throw new Error('Not authenticated');

      const validated = productSchema.parse({
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
      });

      const response = await productsAPI.update(id, {
        nameEn: validated.nameEn,
        nameAm: formData.nameAm || undefined,
        descriptionEn: formData.descriptionEn || undefined,
        descriptionAm: formData.descriptionAm || undefined,
        category: validated.category,
        price: validated.price,
        quantity: validated.quantity,
        unit: validated.unit,
        location: formData.location || undefined,
        isAvailable: formData.isAvailable,
        imageUrls: images,
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-products'] });
      toast({
        title: t('message.success'),
        description: language === 'am' ? 'ምርት ተዘምኗል' : 'Product updated successfully',
      });
      navigate('/products');
    },
    onError: (error) => {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: t('message.error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    updateProductMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is the owner
  const productFarmerId = productData?.farmerId?.id || productData?.farmerId?._id;
  if (productData && profile && productFarmerId !== profile.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            {language === 'am' ? 'ተገቢ አይደለም' : 'Access Denied'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {language === 'am' ? 'የእርስዎን ምርቶች ብቻ ማስተካከል ይችላሉ' : 'You can only edit your own products'}
          </p>
          <Button onClick={() => navigate(-1)}>
            {language === 'am' ? 'ተመለስ' : 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 safe-area-top">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">{language === 'am' ? 'ምርት አስተካክል' : 'Edit Product'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>{language === 'am' ? 'ምስሎች' : 'Product Images'}</Label>
          <p className="text-sm text-muted-foreground">
            {language === 'am' ? 'እስከ 5 ምስሎች (JPEG, PNG, WebP)' : 'Up to 5 images (JPEG, PNG, WebP)'}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">
                      {language === 'am' ? 'ጨምር' : 'Add'}
                    </span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Name (English) */}
        <div className="space-y-2">
          <Label htmlFor="nameEn">{t('product.name')} (English) *</Label>
          <Input
            id="nameEn"
            value={formData.nameEn}
            onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
            placeholder="e.g., Organic Teff"
            className="h-12"
          />
          {errors.nameEn && <p className="text-destructive text-sm">{errors.nameEn}</p>}
        </div>

        {/* Name (Amharic) */}
        <div className="space-y-2">
          <Label htmlFor="nameAm">{t('product.name')} (አማርኛ)</Label>
          <Input
            id="nameAm"
            value={formData.nameAm}
            onChange={(e) => setFormData(prev => ({ ...prev, nameAm: e.target.value }))}
            placeholder="ለምሳሌ፣ ኦርጋኒክ ጤፍ"
            className="h-12 font-ethiopic"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>{t('product.category')} *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: ProductCategory) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`category.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">{t('product.price')} (ETB) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              className="h-12"
            />
            {errors.price && <p className="text-destructive text-sm">{errors.price}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('product.quantity')} *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              placeholder="0"
              className="h-12"
            />
            {errors.quantity && <p className="text-destructive text-sm">{errors.quantity}</p>}
          </div>
        </div>

        {/* Unit */}
        <div className="space-y-2">
          <Label>{t('product.unit')} *</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">{language === 'am' ? 'አካባቢ' : 'Location'}</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Oromia, Jimma"
            className="h-12"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="descriptionEn">{t('product.description')} (English)</Label>
          <Textarea
            id="descriptionEn"
            value={formData.descriptionEn}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
            placeholder="Describe your product..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionAm">{t('product.description')} (አማርኛ)</Label>
          <Textarea
            id="descriptionAm"
            value={formData.descriptionAm}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionAm: e.target.value }))}
            placeholder="ምርትዎን ይግለጹ..."
            rows={3}
            className="font-ethiopic"
          />
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between">
          <Label htmlFor="isAvailable">{t('product.available')}</Label>
          <Switch
            id="isAvailable"
            checked={formData.isAvailable}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="hero"
          size="lg"
          className="w-full"
          disabled={updateProductMutation.isPending}
        >
          {updateProductMutation.isPending ? t('action.loading') : t('action.save')}
        </Button>
      </form>
    </div>
  );
};

export default EditProduct;
