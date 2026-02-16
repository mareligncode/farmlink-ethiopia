import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TwoFactorDialog: React.FC<TwoFactorDialogProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState<'info' | 'verify'>('info');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => {
    return localStorage.getItem('2fa_enabled') === 'true';
  });

  const handleEnable = () => {
    setStep('verify');
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እባክዎ 6 አሃዝ ያስገቡ' : 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);

    localStorage.setItem('2fa_enabled', 'true');
    setIs2FAEnabled(true);
    toast({
      title: language === 'am' ? 'ባለ ሁለት ደረጃ ማረጋገጫ ነቅቷል' : '2FA Enabled',
      description: language === 'am'
        ? 'ባለ ሁለት ደረጃ ማረጋገጫ በተሳካ ሁኔታ ነቅቷል'
        : 'Two-factor authentication has been enabled successfully',
    });
    handleClose();
  };

  const handleDisable = () => {
    localStorage.setItem('2fa_enabled', 'false');
    setIs2FAEnabled(false);
    toast({
      title: language === 'am' ? 'ባለ ሁለት ደረጃ ማረጋገጫ ተሰናክሏል' : '2FA Disabled',
      description: language === 'am'
        ? 'ባለ ሁለት ደረጃ ማረጋገጫ ተሰናክሏል'
        : 'Two-factor authentication has been disabled',
    });
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('info');
    setCode('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {language === 'am' ? 'ባለ ሁለት ደረጃ ማረጋገጫ' : 'Two-Factor Authentication'}
          </DialogTitle>
          <DialogDescription>
            {language === 'am'
              ? 'ለመለያዎ ተጨማሪ ደህንነት ይጨምሩ'
              : 'Add an extra layer of security to your account'}
          </DialogDescription>
        </DialogHeader>

        {is2FAEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  {language === 'am' ? 'ባለ ሁለት ደረጃ ማረጋገጫ ነቅቷል' : '2FA is Currently Enabled'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'am' ? 'መለያዎ ተጨማሪ ደህንነት አለው' : 'Your account has enhanced security'}
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                {language === 'am' ? 'ዝጋ' : 'Close'}
              </Button>
              <Button variant="destructive" onClick={handleDisable}>
                {language === 'am' ? 'ሰናክል' : 'Disable 2FA'}
              </Button>
            </DialogFooter>
          </div>
        ) : step === 'info' ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Smartphone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {language === 'am' ? 'ደረጃ 1: መተግበሪያ ያውርዱ' : 'Step 1: Download an authenticator app'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'am'
                      ? 'Google Authenticator ወይም Authy ያውርዱ'
                      : 'Download Google Authenticator or Authy from your app store'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <ShieldCheck className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {language === 'am' ? 'ደረጃ 2: ኮድ ያረጋግጡ' : 'Step 2: Verify with a code'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'am'
                      ? 'ከመተግበሪያው የ 6 አሃዝ ኮድ ያስገቡ'
                      : 'Enter the 6-digit code from the authenticator app'}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                {language === 'am' ? 'ሰርዝ' : 'Cancel'}
              </Button>
              <Button onClick={handleEnable}>
                {language === 'am' ? 'ቀጥል' : 'Continue Setup'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="w-32 h-32 mx-auto bg-background border-2 border-dashed border-border rounded-lg flex items-center justify-center mb-3">
                <p className="text-xs text-muted-foreground px-2">
                  {language === 'am' ? 'QR ኮድ' : 'QR Code'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'am'
                  ? 'ይህን QR ኮድ በማረጋገጫ መተግበሪያዎ ይቃኙ'
                  : 'Scan this QR code with your authenticator app'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verifyCode">
                {language === 'am' ? 'የማረጋገጫ ኮድ' : 'Verification Code'}
              </Label>
              <Input
                id="verifyCode"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setStep('info')}>
                {language === 'am' ? 'ተመለስ' : 'Back'}
              </Button>
              <Button onClick={handleVerify} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {language === 'am' ? 'አረጋግጥ' : 'Verify & Enable'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorDialog;
