import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Edit2, LogOut, Settings, ChevronRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    farmName: '',
    farmLocation: '',
    businessName: '',
    businessLocation: '',
    region: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        farmName: profile.farm_name || '',
        farmLocation: profile.farm_location || '',
        businessName: profile.business_name || '',
        businessLocation: profile.business_location || '',
        region: profile.region || '',
      });
    }
  }, [profile]);

  const isFarmer = profile?.role === 'farmer';

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('Not authenticated');

      const updateData: Record<string, string | undefined> = {
        fullName: formData.fullName,
        phone: formData.phone,
        region: formData.region,
      };

      if (isFarmer) {
        updateData.farmName = formData.farmName;
        updateData.farmLocation = formData.farmLocation;
      } else {
        updateData.businessName = formData.businessName;
        updateData.businessLocation = formData.businessLocation;
      }

      const response = await authAPI.updateProfile(updateData);
      return response;
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
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
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
                    <Label htmlFor="farmName">{t('profile.farmName')}</Label>
                    <Input
                      id="farmName"
                      value={formData.farmName}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmName: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmLocation">{t('profile.farmLocation')}</Label>
                    <Input
                      id="farmLocation"
                      value={formData.farmLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, farmLocation: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">{t('profile.businessName')}</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessLocation">{language === 'am' ? 'የንግድ አካባቢ' : 'Business Location'}</Label>
                    <Input
                      id="businessLocation"
                      value={formData.businessLocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessLocation: e.target.value }))}
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
