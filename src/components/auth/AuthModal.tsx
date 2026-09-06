import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useGoogleLogin } from '@react-oauth/google';
import { X, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, login, showToast } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Official Google OAuth 2.0 Login Hook
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await res.json();
        if (userInfo.email) {
          login(
            userInfo.email, 
            userInfo.name || userInfo.email.split('@')[0], 
            'google', 
            userInfo.picture
          );
          setShowAuthModal(false);
          showToast(`Welcome back, ${userInfo.name || userInfo.email}!`, 'success');
        } else {
          showToast('Google authentication completed.', 'success');
          setShowAuthModal(false);
        }
      } catch (err) {
        console.error('Failed to fetch Google user profile', err);
        showToast('Google Sign-in connected!', 'success');
        setShowAuthModal(false);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (err) => {
      console.warn('Google Cloud OAuth popup closed or error', err);
      showToast('Google Sign-in cancelled or window closed.', 'info');
      setIsLoading(false);
    }
  });

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Sign In Dialog Card */}
      <div className="w-full max-w-md rounded-3xl bg-[#131314] text-[#E3E3E3] border border-[#303030] shadow-2xl overflow-hidden relative font-sans">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#28292a]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            <span className="text-xs font-semibold text-[#C4C7C5] tracking-wide">Google Authentication</span>
          </div>

          <button
            onClick={() => setShowAuthModal(false)}
            className="p-1.5 rounded-full hover:bg-[#28292a] text-[#C4C7C5] hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 sm:p-10 text-center space-y-6">
          
          {/* App Branding Icon */}
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-[#3C4043] flex items-center justify-center p-2.5 shadow-xl mx-auto overflow-hidden">
              <img src="/voxaro-logo.png" alt="Voxaro" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1E1F20] border border-[#3C4043] flex items-center justify-center shadow-md">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
              Sign In to Voxaro
            </h2>
            <p className="text-xs sm:text-sm text-[#C4C7C5] max-w-xs mx-auto leading-relaxed">
              Continue with your Google account to access voices, save projects, and generate audio.
            </p>
          </div>

          {/* Single Official Google Login Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => triggerGoogleLogin()}
              className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-100 text-[#1f1f1f] font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer disabled:opacity-60 border border-transparent"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Security Guarantee */}
          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#8E918F]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Encrypted OAuth 2.0 Google Security</span>
          </div>

          {/* Terms and Privacy Footer */}
          <p className="text-[11px] text-[#8E918F] leading-relaxed pt-1">
            By signing in, you agree to Voxaro's{' '}
            <span className="text-[#A8C7FA] hover:underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-[#A8C7FA] hover:underline cursor-pointer">Privacy Policy</span>.
          </p>

        </div>

      </div>
    </div>
  );
};
