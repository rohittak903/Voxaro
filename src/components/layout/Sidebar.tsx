import React from 'react';
import { useUser } from '../../context/UserContext';
import { useAudio } from '../../context/AudioContext';
import { AppView } from '../../types';
import { Mic, Library, History, CreditCard, Settings, Flame, Layers, Terminal, Trophy, Cookie } from 'lucide-react';
import { AwardService } from '../../services/awardService';
import { CookieService } from '../../services/cookieService';

export const Sidebar: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { currentView, setCurrentView, t, user, authUser, planDetails } = useUser();
  const { history } = useAudio();

  const awards = AwardService.calculateAwards(history, user, authUser);
  const unlockedAwards = awards.filter(a => a.isUnlocked).length;

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'editor', label: t.navEditor, icon: <Mic className="w-5 h-5" /> },
    { id: 'library', label: t.navVoices, icon: <Library className="w-5 h-5" />, badge: '25+' },
    { id: 'history', label: t.navHistory, icon: <History className="w-5 h-5" />, badge: history.length > 0 ? history.length : undefined },
    { id: 'awards', label: 'Awards & Badges', icon: <Trophy className="w-5 h-5 text-amber-500" />, badge: `${unlockedAwards} Won` },
    { id: 'api', label: 'API & Integrations', icon: <Terminal className="w-5 h-5" />, badge: 'NEW' },
    { id: 'pricing', label: t.navPricing, icon: <CreditCard className="w-5 h-5" />, badge: user.plan === 'free' ? 'PRO' : undefined },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 justify-between h-[calc(100vh-4rem)] sticky top-16">
      
      {/* Navigation Links */}
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
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

        {/* Quick Studio Stats Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-100 to-indigo-50/50 dark:from-slate-800/60 dark:to-indigo-950/20 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fast Neural Engine</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            Synthesizing 25+ accents with real-time pitch, speed & pause modulation.
          </p>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
            <span>Generations</span>
            <span className="text-primary-600 dark:text-primary-400">{history.length} saved</span>
          </div>
        </div>
      </div>

      {/* Bottom Settings & Cookie Buttons */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span>{t.navSettings}</span>
        </button>

        <button
          onClick={() => CookieService.openPreferencesModal()}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Cookie className="w-3.5 h-3.5 text-amber-500" />
            <span>Cookie Settings</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 font-mono">GDPR</span>
        </button>
      </div>

    </aside>
  );
};
