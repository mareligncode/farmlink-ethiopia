import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }
      try {
        const result = await authAPI.verifyResetToken(token);
        setTokenValid(result.valid);
      } catch {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      passwordSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    if (!token) return;

    setLoading(true);
    try {
      await authAPI.resetPassword(token, formData.password);
      setSuccess(true);
      toast({
        title: language === 'am' ? 'የይለፍ ቃል ተቀይሯል' : 'Password Reset',
        description: language === 'am' ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል' : 'Your password has been reset successfully',
      });
    } catch (error) {
      toast({ title: t('message.error'), description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-surface flex flex-col items-center justify-center px-6">
        <div className="bg-card rounded-2xl shadow-md p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{language === 'am' ? 'ልክ ያልሆነ ሊንክ' : 'Invalid Link'}</h1>
          <p className="text-muted-foreground mb-6">
            {language === 'am' ? 'ይህ የይለፍ ቃል ዳግም ማስጀመሪያ ሊንክ ልክ ያልሆነ ወይም ጊዜው ያለፈበት ነው' : 'This password reset link is invalid or has expired'}
          </p>
          <Button variant="hero" className="w-full" onClick={() => navigate('/forgot-password')}>
            {language === 'am' ? 'አዲስ ሊንክ ይጠይቁ' : 'Request New Link'}
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-surface flex flex-col items-center justify-center px-6">
        <div className="bg-card rounded-2xl shadow-md p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{language === 'am' ? 'የይለፍ ቃል ተቀይሯል!' : 'Password Reset!'}</h1>
          <p className="text-muted-foreground mb-6">
            {language === 'am' ? 'የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል። አሁን መግባት ይችላሉ።' : 'Your password has been successfully reset. You can now login.'}
          </p>
          <Button variant="hero" className="w-full" onClick={() => navigate('/auth')}>
            {language === 'am' ? 'ወደ መግቢያ ሂድ' : 'Go to Login'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col">
      <div className="p-4 safe-area-top">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="bg-card rounded-2xl shadow-md p-6 max-w-md w-full animate-slide-up">
          <h1 className="text-2xl font-bold mb-2">{language === 'am' ? 'አዲስ የይለፍ ቃል ይፍጠሩ' : 'Create New Password'}</h1>
          <p className="text-muted-foreground mb-6">{language === 'am' ? 'ለመለያዎ አዲስ የይለፍ ቃል ያስገቡ' : 'Enter a new password for your account'}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{language === 'am' ? 'አዲስ የይለፍ ቃል' : 'New Password'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="pl-10 pr-10 h-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{language === 'am' ? 'የይለፍ ቃል አረጋግጥ' : 'Confirm Password'}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} className="pl-10 h-12" />
              </div>
              {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
              {language === 'am' ? 'የይለፍ ቃል ቀይር' : 'Reset Password'}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            {language === 'am' ? 'የይለፍ ቃልዎን አስታውሰዋል?' : 'Remember your password?'}{' '}
            <Link to="/auth" className="text-primary font-semibold hover:underline">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
