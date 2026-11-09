import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logoImg from '@/assets/e-media-logo.png';
import authBg from '@/assets/auth-bg-popart.jpg.asset.json';

import { useT } from '@/i18n/LanguageContext';

const Auth = () => {
  const { t } = useT();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success('Check your email for the confirmation link!');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent!');
      setShowForgot(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Footer = () => (
    <div className="mt-10 flex flex-col items-center gap-1">
      <p className="text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} <span className="font-semibold">Imvelo T&amp;M Group</span>. All rights reserved.
      </p>
    </div>
  );

  if (showForgot) {
    return (
      <div
        className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative bg-cover bg-center"
        style={{ backgroundImage: `url(${authBg.url})` }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
        <div className="w-full max-w-sm relative z-10 bg-card/90 backdrop-blur-md border border-border rounded-lg p-6 shadow-2xl">
          <div className="text-center mb-8">
            <img src={logoImg} alt="ES-PRESS" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg" />
            <h1 className="text-2xl font-extrabold text-foreground">
              ES<span className="text-primary">-</span>PRESS
            </h1>
            <p className="text-muted-foreground text-sm mt-2">Reset your password</p>
          </div>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-label="Email address" autoComplete="email" placeholder={t('auth.email')}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? t('auth.please_wait') : 'Send Reset Link'}
            </Button>
            <Button type="button" onClick={() => setShowForgot(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to login
            </Button>
          </form>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div
      className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${authBg.url})` }}
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      <div className="w-full max-w-sm relative z-10 bg-card/90 backdrop-blur-md border border-border rounded-lg p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img src={logoImg} alt="ES-PRESS" className="w-24 h-24 rounded-2xl mx-auto mb-4 shadow-lg glow-red" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-normal">
            ES<span className="text-primary">-</span>PRESS
          </h1>
          <p className="text-muted-foreground text-sm mt-2">{t('auth.tagline')}</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-label="Email address" autoComplete="email" placeholder={t('auth.email')}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-label="Password" autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder={t('auth.password')}
              required
              minLength={6}
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button variant="ghost" size="icon" aria-label={showPassword ? "Hide password" : "Show password"} type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          </div>

          {isLogin && (
            <Button type="button" onClick={() => setShowForgot(true)} className="text-xs text-primary hover:underline">
              {t('auth.forgot')}
            </Button>
          )}

          <Button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? t('auth.please_wait') : isLogin ? t('auth.signin') : t('auth.signup')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? t('auth.no_account') : t('auth.has_account')}
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
            {isLogin ? t('auth.signup') : t('auth.signin')}
          </Button>
        </p>

        <Footer />
      </div>
    </div>
  );
};

export default Auth;
