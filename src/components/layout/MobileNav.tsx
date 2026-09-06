import React from 'react';
import { useUser } from '../../context/UserContext';
import { useAudio } from '../../context/AudioContext';
import { AppView } from '../../types';
import { Mic, Library, History, CreditCard, Settings, Terminal } from 'lucide-react';

export const MobileNav: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { currentView, setCurrentView, t } = useUser();
  const { history } = useAudio();

  const items: { id: AppView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'editor', label: t.navEditor, icon: <Mic className="w-5 h-5" /> },
    { id: 'library', label: t.navVoices, icon: <Library className="w-5 h-5" /> },
    { id: 'history', label: t.navHistory, icon: <History className="w-5 h-5" />, badge: history.length > 0 ? history.length : undefined },
    { id: 'api', label: 'API', icon: <Terminal className="w-5 h-5" /> },
    { id: 'pricing', label: t.navPricing, icon: <CreditCard className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around safe-bottom">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[56px] ${
              isActive
                ? 'text-primary-600 dark:text-primary-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-primary-600 text-white text-[10px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 min-w-[56px]"
      >
        <Settings className="w-5 h-5" />
        <span className="text-[11px] mt-1">{t.navSettings}</span>
      </button>
    </nav>
  );
};
