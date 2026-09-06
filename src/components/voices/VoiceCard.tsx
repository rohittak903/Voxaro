import React from 'react';
import { Voice } from '../../types';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { Play, Square, Star, Crown, Check, ArrowRight, Sparkles } from 'lucide-react';

interface VoiceCardProps {
  voice: Voice;
  onSelect: (voice: Voice) => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({ voice, onSelect }) => {
  const { selectedVoice, previewVoice, previewingVoiceId, stopPreview } = useAudio();
  const { user, toggleFavorite, isFavorite, setShowPricingModal } = useUser();

  const isSelected = selectedVoice.id === voice.id;
  const isFav = isFavorite(voice.id);
  const isPreviewing = previewingVoiceId === voice.id;

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreviewing) {
      stopPreview();
    } else {
      previewVoice(voice);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(voice.id);
  };

  const handleCardClick = () => {
    if (voice.isPremium && user.plan === 'free') {
      setShowPricingModal(true);
      return;
    }
    onSelect(voice);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
        isSelected
          ? 'bg-primary-50/50 dark:bg-primary-950/40 border-primary-500 ring-2 ring-primary-500/20 shadow-md'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
      }`}
    >
      
      {/* Top Bar: Avatar, Info, Favorite, Pro Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${voice.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform`}>
              {voice.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {voice.name}
                </h4>
                {voice.isPremium && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {voice.language} • {voice.accent}
              </p>
            </div>
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-lg transition-colors ${
              isFav
                ? 'text-amber-500 fill-amber-500'
                : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
            }`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Description & Sample Quote */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3 line-clamp-2">
          {voice.description}
        </p>

        {/* Tag Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
            {voice.gender}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
            {voice.style}
          </span>
          {voice.tags.slice(0, 2).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={handlePreviewClick}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isPreviewing
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-600 dark:hover:text-primary-400 text-slate-700 dark:text-slate-300'
          }`}
        >
          {isPreviewing ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> Stop Sample
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> Preview Sample
            </>
          )}
        </button>

        <button
          onClick={handleCardClick}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
            isSelected
              ? 'bg-primary-600 text-white'
              : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/60'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3.5 h-3.5" /> Selected
            </>
          ) : (
            <>
              Use Voice <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
