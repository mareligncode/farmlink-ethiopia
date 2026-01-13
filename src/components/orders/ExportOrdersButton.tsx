import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { exportOrdersToCSV, exportOrdersToPDF } from '@/lib/exportOrders';

interface Order {
  id?: string;
  _id?: string;
  status: string;
  totalAmount: number;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  items?: any[];
  farmerId?: any;
  merchantId?: any;
  deliveryAddress?: string;
  deliveryNotes?: string;
}

interface ExportOrdersButtonProps {
  orders: Order[];
  isFarmer: boolean;
  disabled?: boolean;
}

const ExportOrdersButton: React.FC<ExportOrdersButtonProps> = ({ 
  orders, 
  isFarmer, 
  disabled = false 
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast({
        title: language === 'am' ? 'ምንም ትዕዛዞች የሉም' : 'No Orders',
        description: language === 'am' 
          ? 'ለማውረድ ምንም ትዕዛዞች የሉም' 
          : 'There are no orders to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      exportOrdersToCSV(orders, isFarmer, language as 'en' | 'am');
      toast({
        title: language === 'am' ? 'ውርድ ተሳክቷል' : 'Export Successful',
        description: language === 'am' 
          ? `${orders.length} ትዕዛዞች ወደ CSV ተወረዱ` 
          : `${orders.length} orders exported to CSV`,
      });
    } catch (error) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' 
          ? 'ወደ CSV ማውረድ አልተሳካም' 
          : 'Failed to export to CSV',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (orders.length === 0) {
      toast({
        title: language === 'am' ? 'ምንም ትዕዛዞች የሉም' : 'No Orders',
        description: language === 'am' 
          ? 'ለማውረድ ምንም ትዕዛዞች የሉም' 
          : 'There are no orders to export',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      exportOrdersToPDF(orders, isFarmer, language as 'en' | 'am');
      toast({
        title: language === 'am' ? 'PDF ተከፈተ' : 'PDF Opened',
        description: language === 'am' 
          ? 'እባክዎ PDF ለማውረድ ያትሙ' 
          : 'Please print to save as PDF',
      });
    } catch (error) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' 
          ? 'PDF መክፈት አልተሳካም' 
          : 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled || isExporting || orders.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {language === 'am' ? 'አውርድ' : 'Export'}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <span>{language === 'am' ? 'ወደ CSV አውርድ' : 'Export to CSV'}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-red-600" />
          <span>{language === 'am' ? 'ወደ PDF አውርድ' : 'Export to PDF'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportOrdersButton;
