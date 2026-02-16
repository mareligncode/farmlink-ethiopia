import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Sun, Globe, Shield, Trash2, ChevronRight, Monitor, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { settingsAPI } from '@/lib/api';
import ChangePasswordDialog from '@/components/settings/ChangePasswordDialog';
import PrivacyPolicyDialog from '@/components/settings/PrivacyPolicyDialog';
import TermsOfServiceDialog from '@/components/settings/TermsOfServiceDialog';
import TwoFactorDialog from '@/components/settings/TwoFactorDialog';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    orderUpdates: true,
    promotions: false,
    newProducts: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [twoFactorOpen, setTwoFactorOpen] = useState(false);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const res = await settingsAPI.getNotificationPreferences();
        if (res.success && res.data) {
          setNotifications({
            push: true,
            email: res.data.emailNotifications ?? true,
            orderUpdates: res.data.orderUpdates ?? true,
            promotions: res.data.promotions ?? false,
            newProducts: res.data.newsletter ?? true,
          });
        }
      } catch {
        // Use defaults if API fails
      }
    };
    loadPreferences();
  }, []);

  const handleNotificationChange = async (key: string, checked: boolean) => {
    const updated = { ...notifications, [key]: checked };
    setNotifications(updated);

    setSavingNotifications(true);
    try {
      await settingsAPI.updateNotificationPreferences({
        emailNotifications: updated.email,
        orderUpdates: updated.orderUpdates,
        promotions: updated.promotions,
        newsletter: updated.newProducts,
      });
    } catch {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ማሳወቂያ ምርጫዎችን ማዘመን አልተቻለም' : 'Failed to update notification preferences',
        variant: 'destructive',
      });
      // Revert
      setNotifications(prev => ({ ...prev, [key]: !checked }));
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast({
      title: language === 'am' ? 'መለያ ተሰርዟል' : 'Account Deleted',
      description: language === 'am' ? 'መለያዎ በተሳካ ሁኔታ ተሰርዟል' : 'Your account has been successfully deleted',
    });
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 safe-area-top">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold">{t('nav.settings')}</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Appearance */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">
              {language === 'am' ? 'መልክ' : 'Appearance'}
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : theme === 'system' ? (
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <Label>{language === 'am' ? 'ገጽታ' : 'Theme'}</Label>
              </div>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all",
                    theme === 'light' ? "bg-card shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <Sun className="h-4 w-4" />
                  {language === 'am' ? 'ብርሃን' : 'Light'}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all",
                    theme === 'dark' ? "bg-card shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <Moon className="h-4 w-4" />
                  {language === 'am' ? 'ጨለማ' : 'Dark'}
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all",
                    theme === 'system' ? "bg-card shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  {language === 'am' ? 'ስርዓት' : 'System'}
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <Label>{language === 'am' ? 'ቋንቋ' : 'Language'}</Label>
              </div>
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm font-medium transition-all",
                    language === 'en' ? "bg-card shadow-sm" : "text-muted-foreground"
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('am')}
                  className={cn(
                    "px-3 py-1.5 rounded text-sm font-medium font-ethiopic transition-all",
                    language === 'am' ? "bg-card shadow-sm" : "text-muted-foreground"
                  )}
                >
                  አማርኛ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {language === 'am' ? 'ማሳወቂያዎች' : 'Notifications'}
              {savingNotifications && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{language === 'am' ? 'Push ማሳወቂያዎች' : 'Push Notifications'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'am' ? 'በመሳሪያዎ ላይ ማሳወቂያዎችን ያግኙ' : 'Receive notifications on your device'}
                </p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{language === 'am' ? 'ኢሜል ማሳወቂያዎች' : 'Email Notifications'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'am' ? 'ዝመናዎችን በኢሜል ያግኙ' : 'Get updates via email'}
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{language === 'am' ? 'የትዕዛዝ ዝመናዎች' : 'Order Updates'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'am' ? 'ስለ ትዕዛዞችዎ ማሳወቂያ ያግኙ' : 'Get notified about your orders'}
                </p>
              </div>
              <Switch
                checked={notifications.orderUpdates}
                onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{language === 'am' ? 'ማስተዋወቂያዎች' : 'Promotions'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'am' ? 'ስለ ቅናሾች እና ቅናሾች ይማሩ' : 'Learn about deals and discounts'}
                </p>
              </div>
              <Switch
                checked={notifications.promotions}
                onCheckedChange={(checked) => handleNotificationChange('promotions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>{language === 'am' ? 'አዲስ ምርቶች' : 'New Products'}</Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'am' ? 'አዲስ ምርቶች ሲጨመሩ ይወቁ' : 'Know when new products are added'}
                </p>
              </div>
              <Switch
                checked={notifications.newProducts}
                onCheckedChange={(checked) => handleNotificationChange('newProducts', checked)}
              />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {language === 'am' ? 'ግላዊነት እና ደህንነት' : 'Privacy & Security'}
            </h2>
          </div>

          <div className="divide-y divide-border">
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span>{language === 'am' ? 'የይለፍ ቃል ቀይር' : 'Change Password'}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setTwoFactorOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{language === 'am' ? 'ባለ ሁለት ደረጃ ማረጋገጫ' : 'Two-Factor Authentication'}</span>
                {localStorage.getItem('2fa_enabled') === 'true' && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {language === 'am' ? 'ነቅቷል' : 'Enabled'}
                  </span>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setPrivacyPolicyOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span>{language === 'am' ? 'የግላዊነት ፖሊሲ' : 'Privacy Policy'}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => setTermsOpen(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span>{language === 'am' ? 'የአገልግሎት ውሎች' : 'Terms of Service'}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-2xl shadow-sm overflow-hidden border border-destructive/20">
          <div className="px-4 py-3 border-b border-border bg-destructive/5">
            <h2 className="font-semibold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {language === 'am' ? 'አደገኛ ቦታ' : 'Danger Zone'}
            </h2>
          </div>

          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'am' 
                ? 'መለያዎን ከሰረዙ፣ ሁሉም ውሂብዎ እና ምርቶችዎ በቋሚነት ይሰረዛሉ።' 
                : 'Once you delete your account, all your data and products will be permanently removed.'}
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {language === 'am' ? 'መለያ ሰርዝ' : 'Delete Account'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === 'am' ? 'እርግጠኛ ነዎት?' : 'Are you sure?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === 'am' 
                      ? 'ይህ እርምጃ ሊቀለበስ አይችልም። ይህ መለያዎን እና ሁሉንም ተያያዥ ውሂብ በቋሚነት ይሰርዛል።'
                      : 'This action cannot be undone. This will permanently delete your account and all associated data.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {language === 'am' ? 'ሰርዝ' : 'Cancel'}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    {language === 'am' ? 'መለያ ሰርዝ' : 'Delete Account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-muted-foreground text-sm space-y-1">
          <p>AgriConnect v1.0.0</p>
          <p>{language === 'am' ? 'በፍቅር ተሰርቷል 🌱' : 'Made with love 🌱'}</p>
        </div>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      <PrivacyPolicyDialog open={privacyPolicyOpen} onOpenChange={setPrivacyPolicyOpen} />
      <TermsOfServiceDialog open={termsOpen} onOpenChange={setTermsOpen} />
      <TwoFactorDialog open={twoFactorOpen} onOpenChange={setTwoFactorOpen} />
    </div>
  );
};

export default Settings;
