import React from 'react';
import { useUser } from '../../context/UserContext';
import { useAudio } from '../../context/AudioContext';
import { AppView, LocaleCode } from '../../types';
import { 
  X, 
  Mic, 
  Library, 
  History, 
  CreditCard, 
  Terminal, 
  Settings, 
  Crown, 
  Sparkles, 
  Globe, 
  Moon, 
  Sun, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Compass,
  Lock
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const { 
    currentView, 
    setCurrentView, 
    user, 
    authUser, 
    isAuthenticated, 
    logout, 
    setShowAuthModal, 
    openCheckout, 
    planDetails, 
    locale, 
    setLocale, 
    theme, 
    toggleTheme, 
    startTour,
    t 
  } = useUser();
  
  const { history } = useAudio();

  if (!isOpen) return null;

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'editor', label: 'Studio Editor', icon: <Mic className="w-5 h-5" /> },
    { id: 'library', label: 'Voice Library', icon: <Library className="w-5 h-5" />, badge: '25+' },
    { id: 'history', label: 'Saved Audios', icon: <History className="w-5 h-5" />, badge: history.length > 0 ? history.length : undefined },
    { id: 'api', label: 'API & Embed Widget', icon: <Terminal className="w-5 h-5" />, badge: 'NEW' },
    { id: 'pricing', label: 'Subscription Plans', icon: <CreditCard className="w-5 h-5" />, badge: user.plan === 'free' ? 'PRO' : undefined },
  ];

  const languages: { code: LocaleCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ];

  const usagePercent = Math.min(100, Math.round((user.charactersUsedThisMonth / planDetails.monthlyLimit) * 100));

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
      
      {/* Dark backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto safe-top safe-bottom z-50 transition-transform duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              window.location.href = '/';
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Refresh Voxaro"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <img src="/voxaro-logo.png" alt="Voxaro Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Voxaro</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                  Studio
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Turn Text into Voice
              </p>
            </div>
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 space-y-5 flex-1">
          
          {/* USER ACCOUNT CARD */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm overflow-hidden border-2 border-primary-500/30">
                      {authUser?.avatarUrl ? (
                        <img src={authUser.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
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

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                    </svg>
                    <span>Google Verified</span>
                  </span>

                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="text-rose-500 hover:underline font-semibold cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>

                {/* Quota Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Usage</span>
                    <span className="font-mono">{user.charactersUsedThisMonth.toLocaleString()} / {planDetails.monthlyLimit.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${usagePercent > 85 ? 'bg-rose-500' : 'bg-primary-500'}`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2 text-center py-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">You are browsing in Guest Mode</p>
                <p className="text-[11px] text-slate-400">Sign in to save voice history and manage characters.</p>
                <button
                  onClick={() => {
                    onClose();
                    setShowAuthModal(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}
          </div>

          {/* NAVIGATION LINKS */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Studio Features
            </p>
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badge === 'PRO'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* STUDIO PREFERENCES & TOUR */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Preferences & Tools
            </p>

            {/* Guided Tour Launcher */}
            <button
              onClick={() => {
                onClose();
                startTour();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-primary-500" />
              <span>Start Interactive Tour</span>
            </button>

            {/* Language Selection */}
            <div className="px-3.5 py-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Language
              </label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as LocaleCode)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Appearance</span>
              </div>
              <span className="text-[11px] text-primary-600 dark:text-primary-400 font-bold capitalize">{theme} Mode</span>
            </button>

            {/* Studio Preferences Modal */}
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Full Studio Settings & Account</span>
            </button>
          </div>

        </div>

        {/* Drawer Footer: Admin Portal Link */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <a
            href="/admin"
            className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Isolated Admin Portal</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">PIN Gate</span>
          </a>
        </div>

      </aside>

    </div>
  );
};
