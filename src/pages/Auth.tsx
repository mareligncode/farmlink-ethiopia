import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
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
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'merchant'>('merchant');
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
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
          // Check if it's a verification required error
          if (error.message.includes('verify your email')) {
            setVerificationEmail(validated.email);
            setShowVerificationMessage(true);
          } else {
            toast({
              title: t('message.error'),
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: t('message.success'),
            description: 'Welcome back!',
          });
        }
      } else {
        const validated = signupSchema.parse(formData);
        const { error } = await signUp(validated.email, validated.password, validated.fullName, selectedRole);
        
        if (error) {
          // Check if this is the expected "verify email" message (success case)
          if (error.message.includes('check your email') || error.message.includes('verify')) {
            setVerificationEmail(validated.email);
            setShowVerificationMessage(true);
          } else {
            toast({
              title: t('message.error'),
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          // Registration successful without verification - go to dashboard
          toast({
            title: t('message.success'),
            description: 'Account created successfully!',
          });
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

  const handleResendVerification = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail }),
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'am' ? 'ተልኳል!' : 'Sent!',
          description: language === 'am' ? 'የማረጋገጫ ኢሜል ተልኳል።' : 'Verification email has been sent.',
        });
      } else {
        toast({
          title: t('message.error'),
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('message.error'),
        description: 'Failed to send verification email',
        variant: 'destructive',
      });
    }
  };

  // Show verification message screen
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen bg-gradient-surface flex flex-col items-center justify-center p-6">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center animate-slide-up">
          <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {language === 'am' ? 'ኢሜልዎን ያረጋግጡ' : 'Check Your Email'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {language === 'am' 
              ? `የማረጋገጫ ኢሜል ወደ ${verificationEmail} ተልኳል። እባክዎ ኢሜልዎን ይፈትሹ እና በውስጡ ያለውን ሊንክ ይጫኑ።`
              : `We've sent a verification email to ${verificationEmail}. Please check your inbox and click the link to verify your account.`}
          </p>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
            >
              {language === 'am' ? 'ማረጋገጫ እንደገና ላክ' : 'Resend Verification Email'}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setShowVerificationMessage(false);
                setIsLogin(true);
              }}
            >
              {language === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to Login'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 safe-area-top">
        <div className="flex items-center gap-2 bg-card rounded-full p-1 shadow-sm">
          <button
            onClick={() => setLanguage('en')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              language === 'en' 
                ? "bg-primary text-primary-foreground" 
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
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            አማ
          </button>
        </div>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="rounded-2xl bg-primary/10 p-4 mb-4">
          <Sprout className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t('app.name')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('app.tagline')}</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        <div className="bg-card rounded-2xl shadow-md p-6 animate-slide-up">
          {/* Tab Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
                isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
                !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {t('auth.signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name - Signup only */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                  />
                </div>
                {errors.fullName && <p className="text-destructive text-sm">{errors.fullName}</p>}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-12"
                />
              </div>
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password - Signup only */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                  />
                </div>
                {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Role Selection - Signup only */}
            {!isLogin && (
              <div className="space-y-2">
                <Label>{t('auth.selectRole')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('farmer')}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                      selectedRole === 'farmer'
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl mb-1">🌾</span>
                    <span className="font-medium text-sm">{t('auth.farmer')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('merchant')}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                      selectedRole === 'merchant'
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl mb-1">🏪</span>
                    <span className="font-medium text-sm">{t('auth.merchant')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? t('action.loading') : (isLogin ? t('auth.login') : t('auth.signup'))}
            </Button>

            {/* Forgot Password Link - Login only */}
            {isLogin && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-primary hover:underline"
                >
                  {language === 'am' ? 'የይለፍ ቃልዎን ረስተዋል?' : 'Forgot your password?'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Toggle Link */}
        <p className="text-center mt-6 text-muted-foreground">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? t('auth.signup') : t('auth.login')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
