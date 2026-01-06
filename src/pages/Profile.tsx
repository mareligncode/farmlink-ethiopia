import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Edit2, LogOut, Settings, ChevronRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    farm_name: profile?.farm_name || '',
    farm_location: profile?.farm_location || '',
    business_name: profile?.business_name || '',
    business_location: profile?.business_location || '',
    region: profile?.region || '',
  });

  const isFarmer = profile?.role === 'farmer';

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          farm_name: isFarmer ? formData.farm_name : null,
          farm_location: isFarmer ? formData.farm_location : null,
          business_name: !isFarmer ? formData.business_name : null,
          business_location: !isFarmer ? formData.business_location : null,
          region: formData.region,
        })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
      setIsEditing(false);
      toast({
        title: t('message.success'),
        description: language === 'am' ? 'መገለጫ ተዘምኗል' : 'Profile updated',
      });
    },
    onError: (error) => {
      toast({
        title: t('message.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Avatar */}
      <div className="bg-gradient-hero px-6 pt-8 pb-20 safe-area-top">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary-foreground">{t('nav.profile')}</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-card/20 backdrop-blur-sm rounded-full p-2"
          >
            <Edit2 className="h-5 w-5 text-primary-foreground" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-primary-foreground" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 bg-card rounded-full p-2 shadow-md">
              <Camera className="h-4 w-4 text-foreground" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-primary-foreground">{profile?.full_name}</h2>
          <span className="bg-card/20 backdrop-blur-sm text-primary-foreground text-sm px-3 py-1 rounded-full mt-2">
            {isFarmer ? '🌾 ' + t('auth.farmer') : '🏪 ' + t('auth.merchant')}
          </span>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-6 -mt-10">
        <div className="bg-card rounded-2xl shadow-md p-6 space-y-6">
          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t('auth.fullName')}</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+251 9XX XXX XXX"
                  className="h-12"
                />
              </div>

              {isFarmer ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="farm_name">{t('profile.farmName')}</Label>
                    <Input
                      id="farm_name"
                      value={formData.farm_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, farm_name: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farm_location">{t('profile.farmLocation')}</Label>
                    <Input
                      id="farm_location"
                      value={formData.farm_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, farm_location: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="business_name">{t('profile.businessName')}</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_location">{language === 'am' ? 'የንግድ አካባቢ' : 'Business Location'}</Label>
                    <Input
                      id="business_location"
                      value={formData.business_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, business_location: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="region">{t('profile.region')}</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="e.g., Oromia, Amhara"
                  className="h-12"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  {t('action.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? t('action.loading') : t('action.save')}
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Display Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-xl p-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('auth.email')}</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>

                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-xl p-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('profile.phone')}</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}

                {(isFarmer ? profile?.farm_location : profile?.business_location) && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-xl p-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isFarmer ? t('profile.farmLocation') : (language === 'am' ? 'አካባቢ' : 'Location')}
                      </p>
                      <p className="font-medium">
                        {isFarmer ? profile.farm_location : profile.business_location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl shadow-md mt-6 overflow-hidden">
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-muted rounded-xl p-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="font-medium">{t('nav.settings')}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Language Toggle */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="bg-muted rounded-xl p-3">
                <span className="text-lg">🌍</span>
              </div>
              <span className="font-medium">{language === 'am' ? 'ቋንቋ' : 'Language'}</span>
            </div>
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-3 py-1 rounded text-sm font-medium transition-all",
                  language === 'en' ? "bg-card shadow-sm" : "text-muted-foreground"
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('am')}
                className={cn(
                  "px-3 py-1 rounded text-sm font-medium font-ethiopic transition-all",
                  language === 'am' ? "bg-card shadow-sm" : "text-muted-foreground"
                )}
              >
                አማ
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 hover:bg-destructive/5 transition-colors text-destructive border-t border-border"
          >
            <div className="bg-destructive/10 rounded-xl p-3">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">{t('auth.logout')}</span>
          </button>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8 mb-4">
          AgriConnect v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Profile;
