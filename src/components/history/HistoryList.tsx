import React, { useState, useMemo } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { AwardService } from '../../services/awardService';
import { HistoryCard } from './HistoryCard';
import { 
  History, 
  Search, 
  Trash2, 
  Mic, 
  AlertCircle, 
  Sparkles, 
  Trophy, 
  Clock, 
  Zap, 
  Globe, 
  ArrowRight,
  Cloud,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export const HistoryList: React.FC = () => {
  const { history, clearHistory } = useAudio();
  const { user, authUser, isAuthenticated, setShowAuthModal, setCurrentView, t } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    return AwardService.getRealtimeStats(history, user, authUser);
  }, [history, user, authUser]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      j => j.title.toLowerCase().includes(q) ||
           j.inputText.toLowerCase().includes(q) ||
           j.voice.name.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <History className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Saved Audios & Generation History
            </h1>
            {isAuthenticated ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Multi-Device Cloud Sync Active
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                Guest Mode (Generations Not Saved)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review, re-play, edit, or export your voice synthesis projects synced seamlessly across all your devices.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('awards')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>{stats.unlockedAwardsCount} Awards Unlocked</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your entire generation history?')) {
                  clearHistory();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Guest Mode Notice Banner when not logged in */}
      {!isAuthenticated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Guest Mode — Speech Generations Are Not Saved
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Sign in with Google to automatically save, organize, and sync all your voice projects across 2–3+ devices simultaneously.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-1.5 shadow-md shadow-primary-500/20 shrink-0 cursor-pointer transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Sync</span>
          </button>
        </div>
      )}

      {/* Real-time Live Audio Metrics Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Audios</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{stats.totalAudios}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Playback Time</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{formatDuration(stats.totalDurationSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Chars</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{stats.totalCharacters.toLocaleString()}</span>
          </div>
        </div>

        <div 
          onClick={() => setCurrentView('awards')}
          className="flex items-center gap-3 cursor-pointer p-1.5 -m-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          title="Click to view full awards dashboard"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
              Awards <ArrowRight className="w-2.5 h-2.5 text-amber-500" />
            </span>
            <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
              {stats.unlockedAwardsCount} / {stats.totalAwardsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search history by script title, text, or voice name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
          />
        </div>
      )}

      {/* History List or Empty State */}
      {history.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto shadow-sm">
            <Mic className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {isAuthenticated ? 'No audio generations saved yet' : 'Sign in to save and sync your generations'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {isAuthenticated
              ? 'Synthesize your first script in the Studio editor, and it will be saved to your cloud account automatically.'
              : 'Generations created in guest mode are temporary. Sign in with Google to access your cloud studio on any device.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            {!isAuthenticated && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            )}
            <button
              onClick={() => setCurrentView('editor')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-sm shadow-primary-500/20 cursor-pointer"
            >
              Open Studio Editor
            </button>
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
          No records match "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((job) => (
            <HistoryCard key={job.id} job={job} />
          ))}
        </div>
      )}

    </div>
  );
};
