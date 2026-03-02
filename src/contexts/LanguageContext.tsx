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
  'app.name': { en: 'AgriAdvisor', am: 'አግሪ አድቫይዘር' },
  'app.tagline': { en: 'Ethiopian Agricultural Training & Advisory', am: 'የኢትዮጵያ ግብርና ስልጠናና ምክር' },
  
  // Navigation
  'nav.home': { en: 'Home', am: 'መነሻ' },
  'nav.training': { en: 'Training', am: 'ስልጠና' },
  'nav.crops': { en: 'Crops', am: 'ሰብሎች' },
  'nav.profile': { en: 'Profile', am: 'መገለጫ' },
  'nav.settings': { en: 'Settings', am: 'ቅንብሮች' },
  'nav.notifications': { en: 'Alerts', am: 'ማሳወቂያ' },
  
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
  'onboarding.welcome': { en: 'Welcome to AgriAdvisor', am: 'ወደ አግሪ አድቫይዘር እንኳን ደህና መጡ' },
  'onboarding.slide1.title': { en: 'Expert Farming Advice', am: 'የባለሙያ ግብርና ምክር' },
  'onboarding.slide1.desc': { en: 'Get professional agricultural guidance tailored for Ethiopian farmers', am: 'ለኢትዮጵያ ገበሬዎች የተዘጋጀ የባለሙያ ግብርና መመሪያ ያግኙ' },
  'onboarding.slide2.title': { en: 'Learn & Grow', am: 'ይማሩ እና ያድጉ' },
  'onboarding.slide2.desc': { en: 'Step-by-step training on soil preparation, irrigation, pest control and more', am: 'ደረጃ-በ-ደረጃ የአፈር ዝግጅት፣ መስኖ፣ ተባይ ቁጥጥር ስልጠና' },
  'onboarding.slide3.title': { en: 'AI-Powered Assistance', am: 'በAI የሚሰራ ድጋፍ' },
  'onboarding.slide3.desc': { en: 'Diagnose crop diseases, get weather advice, and access market insights instantly', am: 'የሰብል በሽታ ይለዩ፣ የአየር ሁኔታ ምክር ያግኙ፣ የገበያ ትንታኔ ይመልከቱ' },
  'onboarding.getStarted': { en: 'Get Started', am: 'ጀምር' },
  'onboarding.next': { en: 'Next', am: 'ቀጣይ' },
  'onboarding.skip': { en: 'Skip', am: 'ዝለል' },
  
  // Profile
  'profile.farmName': { en: 'Farm Name', am: 'የእርሻ ስም' },
  'profile.farmLocation': { en: 'Farm Location', am: 'የእርሻ አካባቢ' },
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
