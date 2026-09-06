import React, { useState, useMemo } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { HistoryCard } from './HistoryCard';
import { History, Search, Trash2, Mic, AlertCircle, Sparkles } from 'lucide-react';

export const HistoryList: React.FC = () => {
  const { history, clearHistory } = useAudio();
  const { setCurrentView, t } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      j => j.title.toLowerCase().includes(q) ||
           j.inputText.toLowerCase().includes(q) ||
           j.voice.name.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Generation History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review, re-play, edit, or export your past voice synthesis projects
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your entire generation history?')) {
                  clearHistory();
                }
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
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
            No audio generations saved yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Synthesize your first script in the Studio editor, and it will appear here for easy playback and download.
          </p>
          <button
            onClick={() => setCurrentView('editor')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-sm shadow-primary-500/20"
          >
            Open Studio Editor
          </button>
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
