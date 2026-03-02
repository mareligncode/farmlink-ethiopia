import React, { useState, useEffect } from 'react';
import { Bell, Sprout, Sun, CloudRain, Thermometer, BookOpen, Leaf, Bug, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import AICropDiseaseDetector from '@/components/ai/AICropDiseaseDetector';
import AIWeatherAdvice from '@/components/ai/AIWeatherAdvice';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'am' ? 'እንደምን አደርክ' : 'Good morning';
    if (hour < 17) return language === 'am' ? 'እንደምን ዋልክ' : 'Good afternoon';
    return language === 'am' ? 'እንደምን አመሸህ' : 'Good evening';
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) return { name: language === 'am' ? 'ክረምት' : 'Kiremt (Main Rain)', icon: CloudRain, tip: language === 'am' ? 'የዘር ወቅት - ጤፍ፣ ስንዴ፣ በቆሎ ለመዝራት ጥሩ ጊዜ' : 'Planting season - Good time to sow teff, wheat, maize' };
    if (month >= 9 && month <= 10) return { name: language === 'am' ? 'መከር' : 'Harvest Season', icon: Sun, tip: language === 'am' ? 'ምርትን በደረቅ ቦታ ያከማቹ' : 'Store harvest in dry places to prevent spoilage' };
    if (month >= 11 || month <= 1) return { name: language === 'am' ? 'በጋ' : 'Bega (Dry)', icon: Thermometer, tip: language === 'am' ? 'መስኖ ይጠቀሙ፣ አትክልት ያብቅሉ' : 'Use irrigation, grow vegetables with available water' };
    return { name: language === 'am' ? 'በልግ' : 'Belg (Short Rain)', icon: CloudRain, tip: language === 'am' ? 'ለአጭር ሰብሎች ዘር ይዘጋጁ' : 'Prepare seeds for short-season crops' };
  };

  const season = getCurrentSeason();

  const dailyTips = language === 'am' 
    ? [
        '🌱 ዘሩን ከመዝራትዎ በፊት የአፈር ምርመራ ያድርጉ',
        '💧 ጠዋት ወይም ማታ ማጠጣት የውሃ ብክነትን ይቀንሳል',
        '🌾 የሰብል ማዞር በአፈር ጤና ላይ ይረዳል',
        '🐛 ተፈጥሯዊ ፀረ-ተባይ ዘዴዎችን ይሞክሩ',
        '☀️ ምርትን በፀሐይ ያድርቁ ለረጅም ጊዜ ማከማቸት',
      ]
    : [
        '🌱 Test your soil before planting for best results',
        '💧 Water crops early morning or late evening to reduce evaporation',
        '🌾 Practice crop rotation to maintain soil health',
        '🐛 Try natural pest control methods before chemicals',
        '☀️ Sun-dry harvests properly for long-term storage',
      ];

  const [tipIndex] = useState(() => new Date().getDate() % dailyTips.length);

  const quickActions = [
    { 
      icon: Bug, 
      label: language === 'am' ? 'በሽታ መለየት' : 'Disease Diagnosis',
      desc: language === 'am' ? 'AI የሰብል ምርመራ' : 'AI crop diagnosis',
      color: 'bg-red-500/10 text-red-600 dark:text-red-400',
      id: 'disease'
    },
    { 
      icon: BookOpen, 
      label: language === 'am' ? 'ስልጠና' : 'Training',
      desc: language === 'am' ? 'የግብርና ትምህርት' : 'Agricultural lessons',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      link: '/training'
    },
    { 
      icon: Leaf, 
      label: language === 'am' ? 'ሰብሎች' : 'Crop Library',
      desc: language === 'am' ? 'የሰብል መረጃ ቋት' : 'Crop information',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      link: '/crops'
    },
  ];

  const [showDisease, setShowDisease] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-6 pt-8 pb-16 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm">{greeting()},</p>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {profile?.full_name || 'User'}
            </h1>
            <p className="text-primary-foreground/60 text-xs mt-1">
              {language === 'am' ? '🌾 የግብርና አማካሪ' : '🌾 Agricultural Advisor'}
            </p>
          </div>
          <Link to="/notifications" className="relative">
            <div className="bg-card/20 backdrop-blur-sm rounded-full p-3">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
        </div>

        {/* Season Card */}
        <Card className="bg-card/20 backdrop-blur-sm border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-card/30 rounded-xl p-3">
              <season.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary-foreground">{season.name}</p>
              <p className="text-primary-foreground/70 text-sm">{season.tip}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="px-6 -mt-8 space-y-5 pb-6">
        {/* Daily Tip */}
        <Card className="p-4 shadow-md animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="bg-secondary/20 rounded-xl p-2.5 flex-shrink-0">
              <Sparkles className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">
                {language === 'am' ? 'የዕለቱ ምክር' : 'Tip of the Day'}
              </p>
              <p className="text-muted-foreground text-sm">{dailyTips[tipIndex]}</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="text-lg font-bold mb-3">
            {language === 'am' ? 'ፈጣን ተግባራት' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              action.link ? (
                <Link key={i} to={action.link}>
                  <Card className="p-3 text-center hover:shadow-md transition-shadow h-full">
                    <div className={`mx-auto w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-2`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-xs">{action.label}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">{action.desc}</p>
                  </Card>
                </Link>
              ) : (
                <button key={i} onClick={() => action.id === 'disease' && setShowDisease(!showDisease)}>
                  <Card className="p-3 text-center hover:shadow-md transition-shadow h-full">
                    <div className={`mx-auto w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-2`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-xs">{action.label}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">{action.desc}</p>
                  </Card>
                </button>
              )
            ))}
          </div>
        </div>

        {/* Disease Detector (expandable) */}
        {showDisease && (
          <div className="animate-slide-up">
            <AICropDiseaseDetector />
          </div>
        )}

        {/* Weather Advice */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <AIWeatherAdvice />
        </div>

        {/* Training Progress Preview */}
        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <Card className="p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">
                {language === 'am' ? '📚 ስልጠና' : '📚 Training'}
              </h2>
              <Link to="/training" className="text-primary text-sm font-medium flex items-center gap-1">
                {language === 'am' ? 'ሁሉንም' : 'View all'}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { title: language === 'am' ? 'የአፈር ዝግጅት መሰረታዊ' : 'Soil Preparation Basics', progress: 0 },
                { title: language === 'am' ? 'የመስኖ ቴክኒኮች' : 'Irrigation Techniques', progress: 0 },
                { title: language === 'am' ? 'ተባይ አያያዝ' : 'Pest Management', progress: 0 },
              ].map((course, i) => (
                <Link to="/training" key={i}>
                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{course.title}</p>
                      <div className="h-1.5 bg-muted rounded-full mt-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
