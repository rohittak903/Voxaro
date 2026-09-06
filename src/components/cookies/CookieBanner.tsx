import React, { useState, useEffect } from 'react';
import { CookieService } from '../../services/cookieService';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import { Cookie, X, Sliders, ShieldCheck } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consented = CookieService.hasConsented();
    if (!consented) {
      // Small delay for smooth entry animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Global event listener to reopen preferences from anywhere in the app
    const handleOpenPreferences = () => {
      setShowPreferencesModal(true);
    };

    window.addEventListener('voxaro_open_cookie_preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('voxaro_open_cookie_preferences', handleOpenPreferences);
    };
  }, []);

  const handleAcceptAll = () => {
    CookieService.acceptAll();
    setIsVisible(false);
  };

  const handleDecline = () => {
    CookieService.rejectNonEssential();
    setIsVisible(false);
  };

  const handleOpenCustomize = () => {
    setShowPreferencesModal(true);
  };

  return (
    <>
      {/* Cookie Preferences Modal */}
      <CookiePreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSaved={() => setIsVisible(false)}
      />

      {/* Floating Bottom Cookie Consent Banner */}
      {isVisible && (
        <div className="fixed bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-6 max-w-4xl mx-auto z-40 animate-slideUp">
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/95 text-slate-100 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Left Info */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Cookie className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    We Value Your Privacy & Studio Experience
                  </h4>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>GDPR Compliant</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Voxaro uses cookies to maintain secure Google authentication, remember your studio preferences (currency, language, and theme), and ensure fast audio synthesis.
                </p>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-800">
              <button
                type="button"
                onClick={handleDecline}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                Decline
              </button>

              <button
                type="button"
                onClick={handleOpenCustomize}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Sliders className="w-3.5 h-3.5 text-primary-400" />
                <span>Customize</span>
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-primary-500/30 transition-all cursor-pointer shrink-0"
              >
                Accept All
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer hidden md:block"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
