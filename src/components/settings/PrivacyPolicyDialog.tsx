import React from 'react';
import { Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {language === 'am' ? 'የግላዊነት ፖሊሲ' : 'Privacy Policy'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="text-foreground font-medium">
              {language === 'am' ? 'የመጨረሻ ዝመና: ፌብሩዋሪ 2026' : 'Last Updated: February 2026'}
            </p>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '1. መረጃ መሰብሰብ' : '1. Information We Collect'}
              </h3>
              <p>
                {language === 'am'
                  ? 'AgriConnect የሚከተሉትን መረጃዎች ይሰበስባል: ስምዎ፣ ኢሜልዎ፣ ስልክ ቁጥርዎ፣ የእርሻ/ንግድ መረጃ፣ የመላኪያ አድራሻ፣ እና የክፍያ መረጃ። ይህ መረጃ የተሻለ አገልግሎት ለመስጠት ይጠቅማል።'
                  : 'AgriConnect collects the following information: your name, email address, phone number, farm/business details, delivery addresses, and payment information. This data is used to provide and improve our services.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '2. መረጃ አጠቃቀም' : '2. How We Use Your Information'}
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{language === 'am' ? 'ትዕዛዞችን ማስተናገድ እና ማድረስ' : 'Processing and delivering orders'}</li>
                <li>{language === 'am' ? 'ገበሬዎችን ከነጋዴዎች ጋር ማገናኘት' : 'Connecting farmers with merchants'}</li>
                <li>{language === 'am' ? 'የክፍያ ሂደቶችን ማስተናገድ' : 'Processing payment transactions'}</li>
                <li>{language === 'am' ? 'ማሳወቂያዎችን እና ዝመናዎችን መላክ' : 'Sending notifications and updates'}</li>
                <li>{language === 'am' ? 'የAI ግብርና ምክር መስጠት' : 'Providing AI-powered agricultural advice'}</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '3. መረጃ ጥበቃ' : '3. Data Protection'}
              </h3>
              <p>
                {language === 'am'
                  ? 'የእርስዎን መረጃ ለመጠበቅ ኢንክሪፕሽን እና ደህንነታዊ ልምዶችን እንጠቀማለን። የይለፍ ቃልዎ በ bcrypt ኢንክሪፕት ተደርጎ ይቀመጣል።'
                  : 'We use encryption and industry-standard security practices to protect your data. Passwords are hashed using bcrypt encryption.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '4. መረጃ ማጋራት' : '4. Information Sharing'}
              </h3>
              <p>
                {language === 'am'
                  ? 'የእርስዎን ግላዊ መረጃ ለሶስተኛ ወገን አናጋራም፣ ለትዕዛዝ አፈጻጸም የሚያስፈልግ ካልሆነ በስተቀር (ለምሳሌ ለክፍያ ማስተናገድ ለ Chapa)።'
                  : 'We do not share your personal information with third parties except as necessary to fulfill orders (e.g., payment processing via Chapa).'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '5. የእርስዎ መብቶች' : '5. Your Rights'}
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{language === 'am' ? 'መረጃዎን ማየት እና ማስተካከል ይችላሉ' : 'Access and update your personal data'}</li>
                <li>{language === 'am' ? 'መለያዎን መሰረዝ ይችላሉ' : 'Delete your account and associated data'}</li>
                <li>{language === 'am' ? 'ማሳወቂያ ምርጫዎችን ማስተካከል ይችላሉ' : 'Manage your notification preferences'}</li>
                <li>{language === 'am' ? 'ውሂብዎን ወደ ውጭ መላክ ይችላሉ' : 'Export your data upon request'}</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '6. ያግኙን' : '6. Contact Us'}
              </h3>
              <p>
                {language === 'am'
                  ? 'ስለ ግላዊነት ፖሊሲያችን ጥያቄ ካለዎት በ support@agriconnect.et ያግኙን።'
                  : 'If you have questions about our privacy policy, contact us at support@agriconnect.et.'}
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyDialog;
