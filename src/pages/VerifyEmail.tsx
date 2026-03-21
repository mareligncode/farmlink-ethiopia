import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { getApiBaseUrl, setAuthToken } from '@/lib/api';

const VerifyEmail: React.FC = () => {
  const API_BASE_URL = getApiBaseUrl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('resend');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          if (data.token) {
            setAuthToken(data.token);
          }
          toast({
            title: language === 'am' ? 'ኢሜልዎ ተረጋግጧል!' : 'Email Verified!',
            description: language === 'am' ? 'አካውንትዎ አሁን ንቁ ነው።' : 'Your account is now active.',
          });
        } else {
          setStatus('error');
          setErrorMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [token, toast, language]);

  const handleResendVerification = async () => {
    if (!resendEmail) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'እባክዎ ኢሜልዎን ያስገቡ' : 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'am' ? 'ተልኳል!' : 'Sent!',
          description: language === 'am' ? 'የማረጋገጫ ኢሜል ተልኳል።' : 'Verification email has been sent.',
        });
      } else {
        toast({
          title: language === 'am' ? 'ስህተት' : 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ኢሜል መላክ አልተቻለም' : 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col items-center justify-center p-6">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="rounded-2xl bg-primary/10 p-4 mb-4">
            <Sprout className="h-10 w-10 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold text-foreground">{t('app.name')}</h1>
        </div>

        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
            <h2 className="text-xl font-semibold text-foreground">
              {language === 'am' ? 'ኢሜልዎን በማረጋገጥ ላይ...' : 'Verifying Your Email...'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'am' ? 'እባክዎ ይጠብቁ' : 'Please wait a moment'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4 w-fit mx-auto">
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {language === 'am' ? 'ኢሜል ተረጋግጧል!' : 'Email Verified!'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'am'
                ? 'አካውንትዎ በተሳካ ሁኔታ ተረጋግጧል።'
                : 'Your account has been verified successfully.'}
            </p>
            <Button
              variant="hero"
              className="w-full mt-4"
              onClick={() => navigate('/dashboard')}
            >
              {language === 'am' ? 'ወደ ዳሽቦርድ ሂድ' : 'Go to Dashboard'}
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 w-fit mx-auto">
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {language === 'am' ? 'ማረጋገጥ አልተሳካም' : 'Verification Failed'}
            </h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <div className="space-y-3 mt-4">
              <Input
                type="email"
                placeholder={language === 'am' ? 'ኢሜልዎን ያስገቡ' : 'Enter your email'}
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="h-12"
              />
              <Button
                variant="hero"
                className="w-full"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {language === 'am' ? 'ማረጋገጫ እንደገና ላክ' : 'Resend Verification'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                {language === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to Login'}
              </Button>
            </div>
          </div>
        )}

        {status === 'resend' && (
          <div className="space-y-4">
            <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto">
              <Mail className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {language === 'am' ? 'ኢሜልዎን ያረጋግጡ' : 'Verify Your Email'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'am'
                ? 'የማረጋገጫ ኢሜል እንደገና ለመላክ ኢሜልዎን ያስገቡ።'
                : 'Enter your email to resend the verification link.'}
            </p>
            <div className="space-y-3 mt-4">
              <Input
                type="email"
                placeholder={language === 'am' ? 'ኢሜልዎን ያስገቡ' : 'Enter your email'}
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="h-12"
              />
              <Button
                variant="hero"
                className="w-full"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {language === 'am' ? 'ማረጋገጫ ላክ' : 'Send Verification'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/auth')}
              >
                {language === 'am' ? 'ወደ መግቢያ ተመለስ' : 'Back to Login'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
