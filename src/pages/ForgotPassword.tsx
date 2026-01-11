import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
});

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse({ email });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast({
        title: language === 'am' ? 'ኢሜል ተልኳል' : 'Email Sent',
        description: language === 'am' 
          ? 'እባክዎ ኢሜልዎን ይፈትሹ' 
          : 'Please check your email for reset instructions',
      });
    } catch (error) {
      toast({
        title: t('message.error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-surface flex flex-col items-center justify-center px-6">
        <div className="bg-card rounded-2xl shadow-md p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {language === 'am' ? 'ኢሜልዎን ይፈትሹ' : 'Check Your Email'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'am' 
              ? `የይለፍ ቃል ዳግም ማስጀመሪያ መመሪያዎችን ወደ ${email} ልከናል`
              : `We've sent password reset instructions to ${email}`}
          </p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
            {language === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to Login'}
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
          <h1 className="text-2xl font-bold mb-2">
            {language === 'am' ? 'የይለፍ ቃልዎን ረሱ?' : 'Forgot Password?'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'am' 
              ? 'ኢሜል አድራሻዎን ያስገቡ እና የይለፍ ቃል ዳግም ማስጀመሪያ ሊንክ እንልክልዎታለን'
              : "Enter your email address and we'll send you a password reset link"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="pl-10 h-12"
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
              {language === 'am' ? 'ዳግም ማስጀመሪያ ሊንክ ላክ' : 'Send Reset Link'}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            {language === 'am' ? 'የይለፍ ቃልዎን አስታውሰዋል?' : 'Remember your password?'}{' '}
            <Link to="/auth" className="text-primary font-semibold hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
