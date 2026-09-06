import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { 
  User, 
  LogIn, 
  LogOut, 
  Settings, 
  Crown, 
  Receipt, 
  ChevronDown,
  Sparkles,
  Key
} from 'lucide-react';

export const UserDropdown: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { 
    user, 
    authUser, 
    isAuthenticated, 
    planDetails, 
    logout, 
    setShowAuthModal, 
    setShowPricingModal, 
    setCurrentView 
  } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        onClick={() => setShowAuthModal(true)}
        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-1.5 shadow-sm shadow-primary-500/20 transition-all"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/60 transition-all"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
          {authUser?.avatarUrl ? (
            <img src={authUser.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.slice(0, 2).toUpperCase()
          )}
        </div>
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate hidden sm:inline-block">
          {user.name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
          
          {/* User Meta Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                {user.name}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${planDetails.badgeColor}`}>
                {planDetails.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>

            {/* Character Usage Bar */}
            <div className="pt-1 space-y-1">
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
              setShowPricingModal(true);
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between transition-colors"
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
            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
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
            <span>Studio Preferences</span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

          {/* Log out */}
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

        </div>
      )}
    </div>
  );
};
