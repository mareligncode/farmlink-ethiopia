// Order Export Utilities for CSV and PDF generation

interface OrderItem {
  productId?: {
    nameEn?: string;
    nameAm?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id?: string;
  _id?: string;
  status: string;
  totalAmount: number;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  items?: OrderItem[];
  farmerId?: {
    fullName?: string;
    farmName?: string;
    businessName?: string;
    email?: string;
  };
  merchantId?: {
    fullName?: string;
    businessName?: string;
    farmName?: string;
    email?: string;
  };
  deliveryAddress?: string;
  deliveryNotes?: string;
}

// Format date for display
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get order ID (handle both id and _id)
const getOrderId = (order: Order): string => {
  return order.id || order._id || '';
};

// Escape CSV special characters
const escapeCSV = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Export orders to CSV
export const exportOrdersToCSV = (orders: Order[], isFarmer: boolean, language: 'en' | 'am'): void => {
  // CSV Headers
  const headers = [
    language === 'am' ? 'የትዕዛዝ ቁጥር' : 'Order ID',
    language === 'am' ? 'ቀን' : 'Date',
    language === 'am' ? 'ሁኔታ' : 'Status',
    isFarmer 
      ? (language === 'am' ? 'ገዢ' : 'Buyer')
      : (language === 'am' ? 'ገበሬ' : 'Farmer'),
    language === 'am' ? 'ኢሜል' : 'Email',
    language === 'am' ? 'ንጥሎች ብዛት' : 'Items Count',
    language === 'am' ? 'ምርቶች' : 'Products',
    language === 'am' ? 'ጠቅላላ ዋጋ' : 'Total Amount',
    language === 'am' ? 'ምንዛሬ' : 'Currency',
    language === 'am' ? 'የመላኪያ አድራሻ' : 'Delivery Address',
    language === 'am' ? 'ማስታወሻዎች' : 'Notes',
  ];

  // Status translations
  const statusLabels: Record<string, { en: string; am: string }> = {
    pending: { en: 'Pending', am: 'በመጠባበቅ ላይ' },
    confirmed: { en: 'Confirmed', am: 'ተረጋግጧል' },
    processing: { en: 'Processing', am: 'በሂደት ላይ' },
    shipped: { en: 'Shipped', am: 'ተልኳል' },
    delivered: { en: 'Delivered', am: 'ደርሷል' },
    cancelled: { en: 'Cancelled', am: 'ተሰርዟል' },
  };

  // CSV Rows
  const rows = orders.map((order) => {
    const orderId = getOrderId(order);
    const otherParty = isFarmer ? order.merchantId : order.farmerId;
    const partyName = isFarmer 
      ? (otherParty?.businessName || otherParty?.fullName || '-')
      : (otherParty?.farmName || otherParty?.fullName || '-');
    const partyEmail = otherParty?.email || '-';
    const statusLabel = statusLabels[order.status]?.[language] || order.status;
    
    const products = order.items?.map((item) => {
      const productName = language === 'am' 
        ? (item.productId?.nameAm || item.productId?.nameEn || '-')
        : (item.productId?.nameEn || '-');
      return `${productName} (x${item.quantity})`;
    }).join('; ') || '-';

    return [
      orderId.slice(0, 8).toUpperCase(),
      formatDate(order.createdAt),
      statusLabel,
      partyName,
      partyEmail,
      order.items?.length || 0,
      products,
      order.totalAmount,
      order.currency || 'ETB',
      order.deliveryAddress || '-',
      order.deliveryNotes || '-',
    ].map(escapeCSV).join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create and download file
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export orders to PDF (using HTML to PDF approach)
export const exportOrdersToPDF = (orders: Order[], isFarmer: boolean, language: 'en' | 'am'): void => {
  // Status translations
  const statusLabels: Record<string, { en: string; am: string }> = {
    pending: { en: 'Pending', am: 'በመጠባበቅ ላይ' },
    confirmed: { en: 'Confirmed', am: 'ተረጋግጧል' },
    processing: { en: 'Processing', am: 'በሂደት ላይ' },
    shipped: { en: 'Shipped', am: 'ተልኳል' },
    delivered: { en: 'Delivered', am: 'ደርሷል' },
    cancelled: { en: 'Cancelled', am: 'ተሰርዟል' },
  };

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#0ea5e9',
    processing: '#8b5cf6',
    shipped: '#22c55e',
    delivered: '#16a34a',
    cancelled: '#ef4444',
  };

  // Calculate totals
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalItems = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);

  // Generate HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${language === 'am' ? 'ትዕዛዞች ሪፖርት' : 'Orders Report'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 40px; 
          color: #333; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px; 
          border-bottom: 2px solid #2d6a4f; 
        }
        .header h1 { 
          color: #2d6a4f; 
          font-size: 28px; 
          margin-bottom: 8px; 
        }
        .header .date { 
          color: #666; 
          font-size: 14px; 
        }
        .summary { 
          display: flex; 
          gap: 20px; 
          margin-bottom: 30px; 
          justify-content: center;
        }
        .summary-item { 
          background: #f0f9f4; 
          padding: 15px 25px; 
          border-radius: 8px; 
          text-align: center;
          border: 1px solid #d1e7dd;
        }
        .summary-item .value { 
          font-size: 24px; 
          font-weight: bold; 
          color: #2d6a4f; 
        }
        .summary-item .label { 
          font-size: 12px; 
          color: #666; 
          text-transform: uppercase; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px; 
          font-size: 13px;
        }
        th { 
          background: #2d6a4f; 
          color: white; 
          padding: 12px 10px; 
          text-align: left; 
          font-weight: 600;
        }
        td { 
          padding: 10px; 
          border-bottom: 1px solid #e5e7eb; 
        }
        tr:nth-child(even) { 
          background: #f9fafb; 
        }
        tr:hover { 
          background: #f0f9f4; 
        }
        .status { 
          display: inline-block; 
          padding: 4px 10px; 
          border-radius: 12px; 
          font-size: 11px; 
          font-weight: 600; 
          color: white;
        }
        .amount { 
          font-weight: 600; 
          color: #2d6a4f; 
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          padding-top: 20px; 
          border-top: 1px solid #e5e7eb; 
        }
        @media print {
          body { padding: 20px; }
          .summary-item { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌱 AgriConnect</h1>
        <h2>${language === 'am' ? 'ትዕዛዞች ሪፖርት' : 'Orders Report'}</h2>
        <p class="date">${language === 'am' ? 'የተፈጠረው' : 'Generated on'}: ${formatDate(new Date().toISOString())}</p>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="value">${orders.length}</div>
          <div class="label">${language === 'am' ? 'ጠቅላላ ትዕዛዞች' : 'Total Orders'}</div>
        </div>
        <div class="summary-item">
          <div class="value">${totalItems}</div>
          <div class="label">${language === 'am' ? 'ጠቅላላ ንጥሎች' : 'Total Items'}</div>
        </div>
        <div class="summary-item">
          <div class="value">${totalAmount.toLocaleString()} ETB</div>
          <div class="label">${language === 'am' ? 'ጠቅላላ ገቢ' : 'Total Revenue'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>${language === 'am' ? 'የትዕዛዝ ቁጥር' : 'Order ID'}</th>
            <th>${language === 'am' ? 'ቀን' : 'Date'}</th>
            <th>${language === 'am' ? 'ሁኔታ' : 'Status'}</th>
            <th>${isFarmer ? (language === 'am' ? 'ገዢ' : 'Buyer') : (language === 'am' ? 'ገበሬ' : 'Farmer')}</th>
            <th>${language === 'am' ? 'ንጥሎች' : 'Items'}</th>
            <th>${language === 'am' ? 'ጠቅላላ' : 'Total'}</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map((order) => {
            const orderId = getOrderId(order);
            const otherParty = isFarmer ? order.merchantId : order.farmerId;
            const partyName = isFarmer 
              ? (otherParty?.businessName || otherParty?.fullName || '-')
              : (otherParty?.farmName || otherParty?.fullName || '-');
            const statusLabel = statusLabels[order.status]?.[language] || order.status;
            const statusColor = statusColors[order.status] || '#666';

            return `
              <tr>
                <td><strong>#${orderId.slice(0, 8).toUpperCase()}</strong></td>
                <td>${formatDate(order.createdAt)}</td>
                <td><span class="status" style="background: ${statusColor}">${statusLabel}</span></td>
                <td>${partyName}</td>
                <td>${order.items?.length || 0}</td>
                <td class="amount">${order.totalAmount.toLocaleString()} ${order.currency || 'ETB'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>© ${new Date().getFullYear()} AgriConnect - ${language === 'am' ? 'የኢትዮጵያ ገበሬዎችን ከገበያ ጋር ማገናኘት' : 'Connecting Ethiopian Farmers with Markets'}</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
