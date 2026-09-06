import React, { useState, useEffect } from 'react';
import { CookieService, CookieConsent } from '../../services/cookieService';
import { Cookie, ShieldCheck, Sliders, BarChart3, Check, X, Lock } from 'lucide-react';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const CookiePreferencesModal: React.FC<CookiePreferencesModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [preferences, setPreferences] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const consent = CookieService.getConsent();
      if (consent) {
        setPreferences(consent.preferences);
        setAnalytics(consent.analytics);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    CookieService.saveConsent({
      necessary: true,
      preferences,
      analytics,
    });
    onSaved?.();
    onClose();
  };

  const handleAcceptAll = () => {
    CookieService.acceptAll();
    onSaved?.();
    onClose();
  };

  const handleRejectAll = () => {
    CookieService.rejectNonEssential();
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-xs shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Cookie & Privacy Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize how Voxaro uses cookies on your device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            When you visit Voxaro, we store small cookies in your browser to keep you securely signed in, remember your studio settings (currency, language, theme), and optimize audio synthesis performance.
          </p>

          {/* 1. Strictly Necessary Cookies */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Strictly Necessary Cookies
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                <Lock className="w-3 h-3" />
                <span>Always Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Essential for core functions such as Google OAuth 2.0 authentication, quota management, and protection against CSRF attacks. These cookies cannot be disabled.
            </p>
          </div>

          {/* 2. Functional & Preference Cookies */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-primary-500 shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Preferences & Studio Settings
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences}
                  onChange={(e) => setPreferences(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Stores your chosen studio preferences, including auto-detected localized currency (? INR / $ USD), dark/light appearance mode, language locale, and voice synthesis pitch/speed sliders.
            </p>
          </div>

          {/* 3. Analytics & Performance Cookies */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-indigo-500 shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Analytics & Generation Performance
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Provides anonymous synthesis response metrics to help us optimize speech synthesis latency, server cache speed, and overall studio responsiveness.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleRejectAll}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:underline cursor-pointer order-3 sm:order-1"
          >
            Decline Non-Essential
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
            <button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-primary-500/25 transition-all cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
