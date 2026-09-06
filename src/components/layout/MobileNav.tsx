import React from 'react';
import { useUser } from '../../context/UserContext';
import { useAudio } from '../../context/AudioContext';
import { AppView } from '../../types';
import { Mic, Library, History, CreditCard, Settings, LogIn, User } from 'lucide-react';

export const MobileNav: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { currentView, setCurrentView, t, isAuthenticated, authUser, user, setShowAuthModal } = useUser();
  const { history } = useAudio();

  const items: { id: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'editor', label: 'Studio', icon: <Mic className="w-5 h-5" /> },
    { id: 'library', label: 'Voices', icon: <Library className="w-5 h-5" /> },
    { id: 'history', label: 'Audios', icon: <History className="w-5 h-5" />, badge: history.length > 0 ? history.length : undefined },
    { id: 'pricing', label: 'Pricing', icon: <CreditCard className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around safe-bottom">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all min-w-[50px] ${
              isActive
                ? 'text-primary-600 dark:text-primary-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-primary-600 text-white text-[9px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Account / Sign In Button on Mobile Nav */}
      {isAuthenticated ? (
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-primary-600 min-w-[50px] cursor-pointer"
          title={`Account: ${user.email}`}
        >
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold flex items-center justify-center text-[9px] overflow-hidden border border-white dark:border-slate-900">
              {authUser?.avatarUrl ? (
                <img src={authUser.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.slice(0, 1).toUpperCase()
              )}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white dark:border-slate-900 rounded-full" />
          </div>
          <span className="text-[10px] mt-0.5 font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[50px]">
            {user.name.split(' ')[0]}
          </span>
        </button>
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-primary-600 dark:text-primary-400 font-bold min-w-[50px] cursor-pointer"
          title="Sign in with Google"
        >
          <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <LogIn className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="text-[10px] mt-0.5">Sign In</span>
        </button>
      )}

      {/* Settings Tab */}
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 min-w-[50px] cursor-pointer"
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t.navSettings}</span>
      </button>
    </nav>
  );
};
