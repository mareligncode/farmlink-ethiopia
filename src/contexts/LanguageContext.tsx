import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'am';

interface Translations {
  [key: string]: {
    en: string;
    am: string;
  };
}

const translations: Translations = {
  // Common
  'app.name': { en: 'AgriConnect', am: 'አግሪኮኔክት' },
  'app.tagline': { en: 'Connecting Ethiopian Farmers with Markets', am: 'የኢትዮጵያ ገበሬዎችን ከገበያ ጋር ማገናኘት' },
  
  // Navigation
  'nav.home': { en: 'Home', am: 'መነሻ' },
  'nav.products': { en: 'Products', am: 'ምርቶች' },
  'nav.orders': { en: 'Orders', am: 'ትዕዛዞች' },
  'nav.cart': { en: 'Cart', am: 'ጋሪ' },
  'nav.profile': { en: 'Profile', am: 'መገለጫ' },
  'nav.settings': { en: 'Settings', am: 'ቅንብሮች' },
  'nav.notifications': { en: 'Notifications', am: 'ማሳወቂያዎች' },
  
  // Auth
  'auth.login': { en: 'Login', am: 'ግባ' },
  'auth.signup': { en: 'Sign Up', am: 'ተመዝገብ' },
  'auth.logout': { en: 'Logout', am: 'ውጣ' },
  'auth.email': { en: 'Email', am: 'ኢሜይል' },
  'auth.password': { en: 'Password', am: 'የይለፍ ቃል' },
  'auth.confirmPassword': { en: 'Confirm Password', am: 'የይለፍ ቃል አረጋግጥ' },
  'auth.fullName': { en: 'Full Name', am: 'ሙሉ ስም' },
  'auth.selectRole': { en: 'I am a...', am: 'እኔ...' },
  'auth.farmer': { en: 'Farmer', am: 'ገበሬ' },
  'auth.merchant': { en: 'Merchant', am: 'ነጋዴ' },
  'auth.noAccount': { en: "Don't have an account?", am: 'መለያ የለዎትም?' },
  'auth.hasAccount': { en: 'Already have an account?', am: 'አስቀድሞ መለያ አለዎት?' },
  
  // Onboarding
  'onboarding.welcome': { en: 'Welcome to AgriConnect', am: 'ወደ አግሪኮኔክት እንኳን ደህና መጡ' },
  'onboarding.slide1.title': { en: 'Connect with Farmers', am: 'ከገበሬዎች ጋር ተገናኝ' },
  'onboarding.slide1.desc': { en: 'Find fresh produce directly from local Ethiopian farmers', am: 'ትኩስ ምርቶችን በቀጥታ ከአካባቢው ገበሬዎች ያግኙ' },
  'onboarding.slide2.title': { en: 'Sell Your Harvest', am: 'ምርትዎን ይሽጡ' },
  'onboarding.slide2.desc': { en: 'Farmers can list and sell their products to buyers nationwide', am: 'ገበሬዎች ምርቶቻቸውን ለገዢዎች መዘርዘርና መሸጥ ይችላሉ' },
  'onboarding.slide3.title': { en: 'Secure Payments', am: 'ደህንነቱ የተጠበቀ ክፍያ' },
  'onboarding.slide3.desc': { en: 'Fast and secure payment processing for all transactions', am: 'ለሁሉም ግብይቶች ፈጣንና ደህንነቱ የተጠበቀ የክፍያ ሂደት' },
  'onboarding.getStarted': { en: 'Get Started', am: 'ጀምር' },
  'onboarding.next': { en: 'Next', am: 'ቀጣይ' },
  'onboarding.skip': { en: 'Skip', am: 'ዝለል' },
  
  // Products
  'product.add': { en: 'Add Product', am: 'ምርት ጨምር' },
  'product.edit': { en: 'Edit Product', am: 'ምርት አስተካክል' },
  'product.name': { en: 'Product Name', am: 'የምርት ስም' },
  'product.description': { en: 'Description', am: 'መግለጫ' },
  'product.category': { en: 'Category', am: 'ምድብ' },
  'product.price': { en: 'Price', am: 'ዋጋ' },
  'product.quantity': { en: 'Quantity', am: 'ብዛት' },
  'product.unit': { en: 'Unit', am: 'ክፍል' },
  'product.available': { en: 'Available', am: 'ይገኛል' },
  'product.outOfStock': { en: 'Out of Stock', am: 'አልቋል' },
  'product.addToCart': { en: 'Add to Cart', am: 'ወደ ጋሪ ጨምር' },
  'product.buyNow': { en: 'Buy Now', am: 'አሁን ግዛ' },
  
  // Categories
  'category.grains': { en: 'Grains', am: 'እህሎች' },
  'category.vegetables': { en: 'Vegetables', am: 'አትክልቶች' },
  'category.fruits': { en: 'Fruits', am: 'ፍራፍሬዎች' },
  'category.legumes': { en: 'Legumes', am: 'ጥራጥሬዎች' },
  'category.spices': { en: 'Spices', am: 'ቅመማ ቅመም' },
  'category.coffee': { en: 'Coffee', am: 'ቡና' },
  'category.oilseeds': { en: 'Oilseeds', am: 'የዘይት ዘሮች' },
  'category.livestock': { en: 'Livestock', am: 'እንስሳት' },
  'category.dairy': { en: 'Dairy', am: 'የወተት ውጤቶች' },
  'category.honey': { en: 'Honey', am: 'ማር' },
  'category.other': { en: 'Other', am: 'ሌላ' },
  
  // Orders
  'order.place': { en: 'Place Order', am: 'ትዕዛዝ አስገባ' },
  'order.status': { en: 'Order Status', am: 'የትዕዛዝ ሁኔታ' },
  'order.pending': { en: 'Pending', am: 'በመጠባበቅ ላይ' },
  'order.confirmed': { en: 'Confirmed', am: 'ተረጋግጧል' },
  'order.processing': { en: 'Processing', am: 'በሂደት ላይ' },
  'order.shipped': { en: 'Shipped', am: 'ተልኳል' },
  'order.delivered': { en: 'Delivered', am: 'ደርሷል' },
  'order.cancelled': { en: 'Cancelled', am: 'ተሰርዟል' },
  'order.total': { en: 'Total', am: 'ጠቅላላ' },
  
  // Profile
  'profile.farmName': { en: 'Farm Name', am: 'የእርሻ ስም' },
  'profile.farmLocation': { en: 'Farm Location', am: 'የእርሻ አካባቢ' },
  'profile.businessName': { en: 'Business Name', am: 'የንግድ ስም' },
  'profile.phone': { en: 'Phone Number', am: 'ስልክ ቁጥር' },
  'profile.region': { en: 'Region', am: 'ክልል' },
  'profile.update': { en: 'Update Profile', am: 'መገለጫ አዘምን' },
  
  // Common actions
  'action.save': { en: 'Save', am: 'አስቀምጥ' },
  'action.cancel': { en: 'Cancel', am: 'ሰርዝ' },
  'action.delete': { en: 'Delete', am: 'ሰርዝ' },
  'action.search': { en: 'Search', am: 'ፈልግ' },
  'action.filter': { en: 'Filter', am: 'አጣራ' },
  'action.refresh': { en: 'Refresh', am: 'አድስ' },
  'action.loading': { en: 'Loading...', am: 'በመጫን ላይ...' },
  'action.submit': { en: 'Submit', am: 'አስገባ' },
  
  // Messages
  'message.success': { en: 'Success!', am: 'ተሳክቷል!' },
  'message.error': { en: 'An error occurred', am: 'ስህተት ተከስቷል' },
  'message.noProducts': { en: 'No products found', am: 'ምንም ምርቶች አልተገኙም' },
  'message.noOrders': { en: 'No orders yet', am: 'እስካሁን ትዕዛዞች የሉም' },
  'message.emptyCart': { en: 'Your cart is empty', am: 'ጋሪዎ ባዶ ነው' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
