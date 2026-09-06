import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { UserDropdown } from '../auth/UserDropdown';
import { Sparkles, Globe, Volume2, Crown, HelpCircle, Compass } from 'lucide-react';
import { LocaleCode } from '../../types';

export const Navbar: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { 
    user, 
    planDetails, 
    locale, 
    setLocale, 
    t, 
    openCheckout,
    startTour 
  } = useUser();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const usagePercent = Math.min(100, Math.round((user.charactersUsedThisMonth / planDetails.monthlyLimit) * 100));

  const languages: { code: LocaleCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shadow-md shadow-primary-500/10 overflow-hidden shrink-0">
            <img 
              src="/voxaro-logo.png" 
              alt="Voxaro Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if needed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">Voxaro</span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                Studio
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-semibold tracking-wide text-slate-400 dark:text-slate-500 uppercase">
              Turn Text into Voice
            </p>
          </div>
        </div>

        {/* Right Section: Tour, Notifications, Usage, Upgrade, Language, Theme, Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Usage Meter */}
          <div 
            onClick={() => openCheckout('creator')}
            className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 cursor-pointer hover:border-primary-400 transition-colors"
            title="Click to view quota & plans"
          >
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Usage</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {user.charactersUsedThisMonth.toLocaleString()} / {planDetails.monthlyLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${usagePercent > 85 ? 'bg-rose-500' : 'bg-primary-600'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {/* Upgrade CTA - Desktop / Tablet */}
          {user.plan === 'free' ? (
            <button
              onClick={() => openCheckout('creator')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm hover:from-amber-600 hover:to-orange-600 transition-all transform active:scale-95 shrink-0"
            >
              <Crown className="w-3.5 h-3.5 text-amber-100" />
              <span>{t.upgradeToPro}</span>
            </button>
          ) : (
            <div 
              onClick={() => openCheckout('pro')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 ${planDetails.badgeColor}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{planDetails.name}</span>
            </div>
          )}

          {/* Interactive Tutorial Launcher - Desktop */}
          <button
            onClick={startTour}
            className="hidden md:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            title="Start Interactive Guided Tour"
          >
            <Compass className="w-4 h-4 text-primary-500" />
          </button>

          {/* In-App Notifications Bell */}
          <NotificationCenter />

          {/* Language Selector - Desktop */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              title="Change Language"
              aria-label="Language selection"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">{locale}</span>
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-40 animate-fadeIn">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLocale(l.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                        locale === l.code ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* User Profile / Sign In Button - ALWAYS PROMINENT ON MOBILE & DESKTOP */}
          <UserDropdown onOpenSettings={onOpenSettings} />

        </div>

      </div>
    </header>
  );
};

