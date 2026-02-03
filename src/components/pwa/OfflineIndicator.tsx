import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, lastSynced } = useOfflineStatus();
  const { language } = useLanguage();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium safe-area-top">
      <WifiOff className="h-4 w-4" />
      <span>
        {language === 'am' ? 'ከመስመር ውጭ ነዎት' : "You're offline"}
      </span>
      {lastSynced && (
        <span className="text-amber-800 text-xs">
          ({language === 'am' ? 'የተመሳሰለ፡' : 'Synced:'} {formatDistanceToNow(lastSynced, { addSuffix: true })})
        </span>
      )}
    </div>
  );
};

export default OfflineIndicator;
