import React from 'react';
import { FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface TermsOfServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsOfServiceDialog: React.FC<TermsOfServiceDialogProps> = ({ open, onOpenChange }) => {
  const { language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {language === 'am' ? 'የአገልግሎት ውሎች' : 'Terms of Service'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="text-foreground font-medium">
              {language === 'am' ? 'የመጨረሻ ዝመና: ፌብሩዋሪ 2026' : 'Last Updated: February 2026'}
            </p>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '1. አገልግሎት ተቀባይነት' : '1. Acceptance of Terms'}
              </h3>
              <p>
                {language === 'am'
                  ? 'AgriConnect ን በመጠቀም እነዚህን የአገልግሎት ውሎች ይቀበላሉ። ካልተስማሙ እባክዎ አገልግሎቱን አይጠቀሙ።'
                  : 'By using AgriConnect, you agree to these Terms of Service. If you do not agree, please do not use the service.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '2. የተጠቃሚ ኃላፊነቶች' : '2. User Responsibilities'}
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{language === 'am' ? 'ትክክለኛ የመለያ መረጃ መስጠት' : 'Provide accurate account information'}</li>
                <li>{language === 'am' ? 'የመለያ ደህንነትዎን መጠበቅ' : 'Maintain the security of your account'}</li>
                <li>{language === 'am' ? 'ትክክለኛ የምርት መረጃ ማቅረብ (ለገበሬዎች)' : 'Provide accurate product information (for farmers)'}</li>
                <li>{language === 'am' ? 'ህጋዊ ግብይቶችን ማካሄድ' : 'Conduct lawful transactions'}</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '3. ለገበሬዎች' : '3. For Farmers'}
              </h3>
              <p>
                {language === 'am'
                  ? 'ገበሬዎች ምርቶቻቸውን በትክክል መዘርዘር፣ ትክክለኛ ዋጋዎችን ማስቀመጥ፣ እና ትዕዛዞችን በጊዜ ማሟላት ይጠበቅባቸዋል።'
                  : 'Farmers are expected to list products accurately, set fair prices, and fulfill orders in a timely manner.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '4. ለነጋዴዎች' : '4. For Merchants'}
              </h3>
              <p>
                {language === 'am'
                  ? 'ነጋዴዎች ክፍያዎችን በጊዜ ማከናወን፣ ምርቶችን ከተቀበሉ በኋላ ማረጋገጥ፣ እና ስለ ችግሮች ማሳወቅ ይጠበቅባቸዋል።'
                  : 'Merchants are expected to make timely payments, confirm receipt of products, and report any issues promptly.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '5. ክፍያዎች' : '5. Payments'}
              </h3>
              <p>
                {language === 'am'
                  ? 'ሁሉም ክፍያዎች በ Chapa የክፍያ ስርዓት ይከናወናሉ። AgriConnect ለክፍያ ማስተናገድ ችግሮች ተጠያቂ አይሆንም።'
                  : 'All payments are processed through Chapa payment system. AgriConnect is not liable for payment processing issues beyond our control.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '6. የAI አገልግሎቶች' : '6. AI Services'}
              </h3>
              <p>
                {language === 'am'
                  ? 'የ AI ምክሮች ለመረጃ ዓላማ ብቻ ናቸው። AgriConnect በAI ምክሮች ላይ ተመስርቶ ለተወሰዱ ውሳኔዎች ተጠያቂ አይሆንም።'
                  : 'AI-powered advice is provided for informational purposes only. AgriConnect is not liable for decisions made based on AI recommendations.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '7. መለያ መቋረጥ' : '7. Account Termination'}
              </h3>
              <p>
                {language === 'am'
                  ? 'AgriConnect እነዚህን ውሎች የሚጥሱ መለያዎችን ያለ ቅድሚያ ማስጠንቀቂያ ሊያግድ ወይም ሊሰርዝ ይችላል።'
                  : 'AgriConnect reserves the right to suspend or terminate accounts that violate these terms without prior notice.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {language === 'am' ? '8. ያግኙን' : '8. Contact Us'}
              </h3>
              <p>
                {language === 'am'
                  ? 'ስለ አገልግሎት ውሎቻችን ጥያቄ ካለዎት በ support@agriconnect.et ያግኙን።'
                  : 'For questions about our terms, contact us at support@agriconnect.et.'}
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfServiceDialog;
