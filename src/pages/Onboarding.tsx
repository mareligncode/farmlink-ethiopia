import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Users, ShoppingBag, Shield, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    icon: Users,
    titleKey: 'onboarding.slide1.title',
    descKey: 'onboarding.slide1.desc',
    bg: 'bg-gradient-hero',
  },
  {
    id: 2,
    icon: ShoppingBag,
    titleKey: 'onboarding.slide2.title',
    descKey: 'onboarding.slide2.desc',
    bg: 'bg-gradient-accent',
  },
  {
    id: 3,
    icon: Shield,
    titleKey: 'onboarding.slide3.title',
    descKey: 'onboarding.slide3.desc',
    bg: 'bg-primary',
  },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/auth', { replace: true });
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const slide = slides[currentSlide];

  return (
    <div className={cn("min-h-screen flex flex-col", slide.bg)}>
      {/* Language Toggle */}
      <div className="flex justify-between items-center p-4 safe-area-top">
        <div className="flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              language === 'en' 
                ? "bg-card text-foreground shadow-sm" 
                : "text-primary-foreground/80 hover:text-primary-foreground"
            )}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('am')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium font-ethiopic transition-all",
              language === 'am' 
                ? "bg-card text-foreground shadow-sm" 
                : "text-primary-foreground/80 hover:text-primary-foreground"
            )}
          >
            አማርኛ
          </button>
        </div>
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-transparent"
        >
          {t('onboarding.skip')}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-fade-in">
        <div className="mb-8 rounded-3xl bg-card/20 p-8 backdrop-blur-sm">
          <slide.icon className="h-24 w-24 text-primary-foreground" strokeWidth={1.5} />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
          {t(slide.titleKey)}
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-sm leading-relaxed">
          {t(slide.descKey)}
        </p>
      </div>

      {/* Navigation */}
      <div className="p-8 safe-area-bottom">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide 
                  ? "w-8 bg-primary-foreground" 
                  : "w-2 bg-primary-foreground/40"
              )}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={handleNext}
          size="xl"
          className="w-full bg-card text-foreground hover:bg-card/90 shadow-lg"
        >
          {currentSlide === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
