import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Wheat, Sprout, Leaf } from 'lucide-react';

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (!loading) {
          if (user) {
            navigate('/dashboard', { replace: true });
          } else {
            const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
            if (hasSeenOnboarding) {
              navigate('/auth', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
          }
        }
      }, 600);
    }, 2200);

    return () => clearTimeout(timer);
  }, [loading, user, navigate]);

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-gradient-hero relative overflow-hidden transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[8%] animate-float opacity-20">
          <Wheat className="h-16 w-16 text-primary-foreground" />
        </div>
        <div className="absolute top-[20%] right-[12%] animate-float opacity-15" style={{ animationDelay: '1s' }}>
          <Sprout className="h-12 w-12 text-primary-foreground" />
        </div>
        <div className="absolute bottom-[25%] left-[15%] animate-float opacity-15" style={{ animationDelay: '0.5s' }}>
          <Leaf className="h-14 w-14 text-primary-foreground" />
        </div>
        <div className="absolute bottom-[30%] right-[10%] animate-float opacity-10" style={{ animationDelay: '1.5s' }}>
          <Wheat className="h-10 w-10 text-primary-foreground" />
        </div>
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      <div className="animate-fade-in flex flex-col items-center relative z-10">
        {/* Logo with glow ring */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 rounded-3xl bg-primary-foreground/10 blur-xl scale-150 animate-pulse-soft" />
          <div className="relative rounded-3xl bg-card/20 p-7 backdrop-blur-sm animate-float border border-primary-foreground/10">
            <GraduationCap className="h-20 w-20 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-5xl font-extrabold text-primary-foreground tracking-tight">
          AgriAdvisor
        </h1>
        <p className="text-xl text-primary-foreground/85 font-medium">አግሪ አድቫይዘር</p>
        
        {/* Subtitle */}
        <div className="mt-5 bg-card/15 backdrop-blur-sm rounded-full px-6 py-2.5 border border-primary-foreground/10">
          <p className="text-sm text-primary-foreground/90 font-medium tracking-wide">
            🌾 Ethiopian Agricultural Professor AI
          </p>
        </div>

        {/* Tagline */}
        <p className="mt-4 text-primary-foreground/50 text-xs max-w-[240px] text-center leading-relaxed">
          Expert guidance from Professor Agri — 30+ years of Ethiopian farming knowledge at your fingertips
        </p>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-primary-foreground/60 animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="h-2 w-2 rounded-full bg-primary-foreground/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="h-2 w-2 rounded-full bg-primary-foreground/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

export default Splash;
