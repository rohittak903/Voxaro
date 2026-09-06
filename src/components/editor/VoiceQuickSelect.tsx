import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { VOICES } from '../../data/voices';
import { Sparkles, Play, Square, ChevronRight, Crown } from 'lucide-react';

export const VoiceQuickSelect: React.FC = () => {
  const { selectedVoice, setSelectedVoice, previewVoice, previewingVoiceId, stopPreview } = useAudio();
  const { setCurrentView, user } = useUser();

  // Pick top 6 representative voices for quick carousel selection
  const quickVoices = VOICES.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          Selected Voice
        </label>
        <button
          onClick={() => setCurrentView('library')}
          className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
        >
          <span>Browse all 25+ voices</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Featured Active Voice Card */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${selectedVoice.avatarColor} text-white font-bold flex items-center justify-center text-base shadow-sm flex-shrink-0`}>
            {selectedVoice.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedVoice.name}</h3>
              {selectedVoice.isPremium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <Crown className="w-2.5 h-2.5" /> PRO
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {selectedVoice.language}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {selectedVoice.accent} • {selectedVoice.style} • {selectedVoice.gender}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => previewVoice(selectedVoice)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              previewingVoiceId === selectedVoice.id
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950 dark:hover:text-primary-400 text-slate-700 dark:text-slate-200'
            }`}
          >
            {previewingVoiceId === selectedVoice.id ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" /> Stop
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Sample Preview
              </>
            )}
          </button>

          <button
            onClick={() => setCurrentView('library')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      {/* Quick Switch Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {quickVoices.map((v) => {
          const isSelected = selectedVoice.id === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVoice(v)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${v.avatarColor}`} />
              <span>{v.name.split(' ')[0]}</span>
              {v.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
