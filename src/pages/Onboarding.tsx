import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, GraduationCap, Leaf, Sparkles, Bug, BookOpen, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    icon: GraduationCap,
    emoji: '🎓',
    titleKey: 'onboarding.slide1.title',
    descKey: 'onboarding.slide1.desc',
    bg: 'bg-gradient-hero',
    decorIcon: Wheat,
  },
  {
    id: 2,
    icon: Bug,
    emoji: '🔬',
    titleKey: 'onboarding.slide2.title',
    descKey: 'onboarding.slide2.desc',
    bg: 'bg-gradient-accent',
    decorIcon: Leaf,
  },
  {
    id: 3,
    icon: Sparkles,
    emoji: '✨',
    titleKey: 'onboarding.slide3.title',
    descKey: 'onboarding.slide3.desc',
    bg: 'bg-primary',
    decorIcon: BookOpen,
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

  const slide = slides[currentSlide];

  return (
    <div className={cn("min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500", slide.bg)}>
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] right-[8%] opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>
          <slide.decorIcon className="h-20 w-20 text-primary-foreground" />
        </div>
        <div className="absolute bottom-[15%] left-[8%] opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          <slide.decorIcon className="h-16 w-16 text-primary-foreground" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-foreground/3 blur-3xl" />
      </div>

      {/* Language Toggle */}
      <div className="flex justify-between items-center p-4 safe-area-top relative z-10">
        <div className="flex items-center gap-1 bg-card/20 backdrop-blur-md rounded-full p-1 border border-primary-foreground/10">
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
          onClick={handleGetStarted}
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          {t('onboarding.skip')}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10" key={currentSlide}>
        <div className="mb-4 text-6xl animate-fade-in">{slide.emoji}</div>
        <div className="mb-8 relative">
          <div className="absolute inset-0 rounded-3xl bg-primary-foreground/10 blur-xl scale-150 animate-pulse-soft" />
          <div className="relative rounded-3xl bg-card/20 p-8 backdrop-blur-sm border border-primary-foreground/10 animate-fade-in">
            <slide.icon className="h-20 w-20 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold text-primary-foreground animate-slide-up tracking-tight">
          {t(slide.titleKey)}
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-sm leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {t(slide.descKey)}
        </p>
      </div>

      {/* Navigation */}
      <div className="p-8 safe-area-bottom relative z-10">
        <div className="flex justify-center gap-2.5 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-500",
                index === currentSlide 
                  ? "w-10 bg-primary-foreground shadow-sm" 
                  : "w-2.5 bg-primary-foreground/30 hover:bg-primary-foreground/50"
              )}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          size="xl"
          className="w-full bg-card text-foreground hover:bg-card/90 shadow-lg font-bold text-base h-14"
        >
          {currentSlide === slides.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
