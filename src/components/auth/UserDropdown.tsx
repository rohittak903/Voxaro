import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  User, 
  LogIn, 
  LogOut, 
  Settings, 
  Crown, 
  Receipt, 
  ChevronDown, 
  Sparkles, 
  Key, 
  Trophy,
  Loader2
} from 'lucide-react';

export const UserDropdown: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { 
    user, 
    authUser, 
    isAuthenticated, 
    planDetails, 
    login,
    logout, 
    setShowAuthModal, 
    setShowPricingModal, 
    setCurrentView,
    showToast 
  } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Direct Google OAuth Popup
  const triggerDirectGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoggingIn(true);
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
          showToast(`Welcome back, ${userInfo.name || userInfo.email}!`, 'success');
        }
      } catch (err) {
        console.error('Failed to get Google profile', err);
        showToast('Google Sign-in connected!', 'success');
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: (err) => {
      console.warn('Google popup closed', err);
      setIsLoggingIn(false);
      setShowAuthModal(true);
    }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const usagePercent = Math.min(100, Math.round((user.charactersUsedThisMonth / planDetails.monthlyLimit) * 100));

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => triggerDirectGoogleLogin()}
        disabled={isLoggingIn}
        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-[#1f1f1f] flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-60 border border-slate-200"
        title="Sign in with Google"
      >
        {isLoggingIn ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
        ) : (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        )}
        <span className="font-bold text-slate-900">Sign in with Google</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 p-1 pl-1.5 pr-2 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60 transition-all shrink-0 cursor-pointer shadow-xs"
        title={`Signed in as ${user.email} (${authUser?.provider || 'user'})`}
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0 border border-white/20">
            {authUser?.avatarUrl ? (
              <img src={authUser.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
        </div>

        <div className="flex flex-col text-left max-w-[80px] sm:max-w-[110px] leading-tight">
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
            {user.name}
          </span>
          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold truncate flex items-center gap-0.5">
            {authUser?.provider === 'google' ? 'Google' : 'Online'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
          
          {/* User Meta Card with Verified Provider Badge */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm overflow-hidden shrink-0 border-2 border-primary-500/20">
                {authUser?.avatarUrl ? (
                  <img src={authUser.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </h4>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${planDetails.badgeColor}`}>
                    {planDetails.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Provider Verification Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
              <span className="text-slate-400">Account Type:</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                {authUser?.provider === 'google' ? (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                    </svg>
                    <span>Google Verified</span>
                  </>
                ) : (
                  <span>Verified Account</span>
                )}
              </span>
            </div>

            {/* Character Usage Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>Monthly Quota</span>
                <span>{usagePercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${usagePercent > 85 ? 'bg-rose-500' : 'bg-primary-500'}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <button
            onClick={() => {
              setIsOpen(false);
              setCurrentView('awards');
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Creator Awards & Badges</span>
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
              LIVE
            </span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              setShowPricingModal(true);
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Upgrade Plan</span>
            </div>
            <span className="text-[10px] font-bold text-amber-500 uppercase">PRO</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              setCurrentView('api');
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4 text-indigo-500" />
            <span>API & Integrations</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSettings();
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Studio Preferences & Account</span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

          {/* Log out */}
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out ({user.email})</span>
          </button>

        </div>
      )}
    </div>
  );
};
