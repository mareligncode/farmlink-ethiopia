import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem('pwa_install_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Install error:', error);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-card border border-border rounded-2xl p-4 shadow-lg animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">
            {language === 'am' ? 'አግሪኮኔክት ይጫኑ' : 'Install AgriConnect'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {language === 'am' 
              ? 'ከመስመር ውጭም ይጠቀሙ፣ ፈጣን ተደራሽነት'
              : 'Use offline, faster access, home screen'}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={handleInstall} className="gap-1.5">
              <Download className="h-4 w-4" />
              {language === 'am' ? 'ጫን' : 'Install'}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              {language === 'am' ? 'አሁን አይደለም' : 'Not now'}
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-muted rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
