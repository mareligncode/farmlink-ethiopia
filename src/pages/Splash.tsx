import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap } from 'lucide-react';

const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading, user, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-hero">
      <div className="animate-fade-in flex flex-col items-center">
        <div className="mb-6 rounded-3xl bg-card/20 p-6 backdrop-blur-sm animate-float">
          <GraduationCap className="h-20 w-20 text-primary-foreground" strokeWidth={1.5} />
        </div>
        <h1 className="mb-2 text-4xl font-bold text-primary-foreground">AgriAdvisor</h1>
        <p className="text-lg text-primary-foreground/80">አግሪ አድቫይዘር</p>
        <p className="text-sm text-primary-foreground/60 mt-2">🌾 Ethiopian Agricultural Training</p>
      </div>
      <div className="absolute bottom-12 flex flex-col items-center">
        <div className="h-1 w-16 animate-pulse rounded-full bg-primary-foreground/40" />
      </div>
    </div>
  );
};

export default Splash;
