import React, { useState, useMemo } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { AwardService } from '../../services/awardService';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Mic, 
  Globe, 
  Zap, 
  Flame, 
  ShieldCheck, 
  Crown, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Volume2,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

export const AwardsCenter: React.FC<{ isModal?: boolean; onClose?: () => void }> = ({ isModal = false, onClose }) => {
  const { history } = useAudio();
  const { user, authUser, setCurrentView, setShowAuthModal, openCheckout } = useUser();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'progress' | 'generation' | 'exploration'>('all');

  const stats = useMemo(() => {
    return AwardService.getRealtimeStats(history, user, authUser);
  }, [history, user, authUser]);

  const awards = useMemo(() => {
    return AwardService.calculateAwards(history, user, authUser);
  }, [history, user, authUser]);

  const filteredAwards = useMemo(() => {
    return awards.filter(a => {
      if (selectedFilter === 'unlocked') return a.isUnlocked;
      if (selectedFilter === 'progress') return !a.isUnlocked;
      if (selectedFilter === 'generation') return a.category === 'generation';
      if (selectedFilter === 'exploration') return a.category === 'exploration';
      return true;
    });
  }, [awards, selectedFilter]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const rem = seconds % 60;
    return `${mins}m ${rem}s`;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'from-cyan-500 via-indigo-500 to-purple-600 border-cyan-400/40 text-cyan-300';
      case 'gold':
        return 'from-amber-400 via-amber-500 to-yellow-600 border-amber-400/40 text-amber-300';
      case 'silver':
        return 'from-slate-300 via-slate-400 to-zinc-500 border-slate-300/40 text-slate-200';
      default:
        return 'from-amber-700 via-amber-800 to-orange-900 border-amber-600/40 text-amber-200';
    }
  };

  const renderIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-5 h-5 ${isUnlocked ? 'text-white' : 'text-slate-400'}`;
    switch (iconName) {
      case 'mic': return <Mic className={className} />;
      case 'flame': return <Flame className={className} />;
      case 'award': return <Award className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'globe': return <Globe className={className} />;
      case 'shield': return <ShieldCheck className={className} />;
      case 'crown': return <Crown className={className} />;
      default: return <Trophy className={className} />;
    }
  };

  return (
    <div className={`space-y-6 ${isModal ? '' : 'max-w-5xl mx-auto pb-16 animate-fadeIn'}`}>
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/40 p-5 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Real-Time Tracking
              </span>
              <span className="text-xs text-slate-400 font-mono">Instant Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Creator Awards & Milestones</span>
              <Trophy className="w-7 h-7 text-amber-400 animate-bounce" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Track your voice synthesis achievements in real time. Generate audio, test new languages, and unlock prestigious creator badges.
            </p>
          </div>

          {/* Quick Real-time Level Card */}
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-4 shrink-0 shadow-md">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex flex-col items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-slate-900 border border-amber-400 text-[9px] font-extrabold text-amber-400">
                LIVE
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unlocked Awards</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white">{stats.unlockedAwardsCount}</span>
                <span className="text-xs font-semibold text-slate-400">/ {stats.totalAwardsCount}</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium">
                {Math.round((stats.unlockedAwardsCount / stats.totalAwardsCount) * 100)}% Completed
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Saved Audios</span>
              <span className="text-sm sm:text-base font-extrabold text-white">{stats.totalAudios}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Characters</span>
              <span className="text-sm sm:text-base font-extrabold text-white">{stats.totalCharacters.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Audio Duration</span>
              <span className="text-sm sm:text-base font-extrabold text-white">{formatDuration(stats.totalDurationSeconds)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Voices Tested</span>
              <span className="text-sm sm:text-base font-extrabold text-white">{stats.uniqueVoicesUsed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Awards (${awards.length})` },
          { id: 'unlocked', label: `Unlocked (${stats.unlockedAwardsCount})` },
          { id: 'progress', label: `In Progress (${awards.length - stats.unlockedAwardsCount})` },
          { id: 'generation', label: 'Generation Milestones' },
          { id: 'exploration', label: 'Exploration & Voices' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedFilter === tab.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Awards Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAwards.map((award) => {
          const tierGradient = getTierColor(award.tier);
          return (
            <div
              key={award.id}
              className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-4 ${
                award.isUnlocked
                  ? 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-md hover:border-primary-500/50'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60 opacity-85'
              }`}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between gap-3.5">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tierGradient} flex items-center justify-center shrink-0 shadow-md ${
                    award.isUnlocked ? 'scale-100 ring-2 ring-white/20' : 'grayscale-[40%]'
                  }`}>
                    {renderIcon(award.icon, award.isUnlocked)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {award.title}
                      </h3>
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-gradient-to-r ${tierGradient} bg-clip-text text-transparent border`}>
                        {award.tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {award.description}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {award.isUnlocked ? (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> In Progress
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Real-time Live Values */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-primary-500" /> Live Progress:
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">
                    {award.currentValue.toLocaleString()} / {award.targetValue.toLocaleString()} {award.unit}
                    <span className="ml-1.5 text-primary-600 dark:text-primary-400 font-bold">({award.progressPercent}%)</span>
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      award.isUnlocked
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-primary-600 to-indigo-500'
                    }`}
                    style={{ width: `${award.progressPercent}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" /> Want to unlock more awards?
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Synthesize scripts in the Studio, explore 25+ AI voices, or link your verified Google account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onClose) onClose();
              setCurrentView('editor');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-1.5 shadow-md shadow-primary-500/20 transition-all cursor-pointer"
          >
            <span>Open Studio Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default AwardsCenter;
