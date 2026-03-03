import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Wheat, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = authSchema.extend({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const validated = authSchema.parse(formData);
        const { error } = await signIn(validated.email, validated.password);
        
        if (error) {
          toast({ title: t('message.error'), description: error.message, variant: 'destructive' });
        } else {
          toast({ title: t('message.success'), description: 'Welcome back!' });
        }
      } else {
        const validated = signupSchema.parse(formData);
        const { error } = await signUp(validated.email, validated.password, validated.fullName, 'farmer');
        
        if (error) {
          toast({ title: t('message.error'), description: error.message, variant: 'destructive' });
        } else {
          toast({ title: t('message.success'), description: 'Account created successfully!' });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute top-[15%] right-[5%] opacity-[0.04]">
          <Wheat className="h-32 w-32 text-primary" />
        </div>
        <div className="absolute bottom-[20%] left-[5%] opacity-[0.04]">
          <Leaf className="h-28 w-28 text-primary" />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-4 safe-area-top relative z-10">
        <div className="flex items-center gap-1 bg-card rounded-full p-1 shadow-sm border border-border">
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              language === 'en' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('am')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium font-ethiopic transition-all",
              language === 'am' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            አማ
          </button>
        </div>
      </div>

      {/* Logo & Branding */}
      <div className="flex flex-col items-center pt-6 pb-5 relative z-10">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl scale-150 animate-pulse-soft" />
          <div className="relative rounded-2xl bg-primary/10 p-4 border border-primary/20">
            <GraduationCap className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">AgriAdvisor</h1>
        <p className="text-muted-foreground text-sm mt-1 font-medium">
          {language === 'am' ? '🌾 የግብርና ፕሮፌሰር AI' : '🌾 Professor Agri — Your Farm Expert'}
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 relative z-10">
        <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-6 animate-slide-up">
          {/* Tab Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all",
                isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all",
                !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {t('auth.signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name - Signup only */}
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="fullName" className="text-sm font-semibold">{t('auth.fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={language === 'am' ? 'ሙሉ ስም' : 'Your full name'}
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 h-12 bg-muted/30 border-border/60 focus:border-primary"
                  />
                </div>
                {errors.fullName && <p className="text-destructive text-sm">{errors.fullName}</p>}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-12 bg-muted/30 border-border/60 focus:border-primary"
                />
              </div>
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 bg-muted/30 border-border/60 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password - Signup only */}
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 h-12 bg-muted/30 border-border/60 focus:border-primary"
                  />
                </div>
                {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Farmer badge */}
            {!isLogin && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15 animate-fade-in">
                <span className="text-2xl">🌾</span>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {language === 'am' ? 'የገበሬ መለያ' : 'Farmer Account'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'am' ? 'ከፕሮፌሰር አግሪ ጋር ይማሩ' : 'Learn with Professor Agri'}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-6 h-12 text-base font-bold shadow-md"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  {t('action.loading')}
                </span>
              ) : (
                isLogin ? t('auth.login') : t('auth.signup')
              )}
            </Button>

            {/* Forgot Password Link - Login only */}
            {isLogin && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {language === 'am' ? 'የይለፍ ቃልዎን ረስተዋል?' : 'Forgot your password?'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Toggle Link */}
        <p className="text-center mt-6 mb-8 text-muted-foreground text-sm">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? t('auth.signup') : t('auth.login')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
