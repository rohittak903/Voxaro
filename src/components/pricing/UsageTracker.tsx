import React from 'react';
import { useUser } from '../../context/UserContext';
import { Zap, Crown, Check, ArrowUpRight } from 'lucide-react';

export const UsageTracker: React.FC = () => {
  const { user, planDetails, setShowPricingModal } = useUser();

  const usagePercent = Math.min(100, Math.round((user.charactersUsedThisMonth / planDetails.monthlyLimit) * 100));
  const remaining = Math.max(0, planDetails.monthlyLimit - user.charactersUsedThisMonth);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Quota Tracker</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plan: <span className="font-semibold text-primary-600 dark:text-primary-400">{planDetails.name}</span></p>
          </div>
        </div>

        <button
          onClick={() => setShowPricingModal(true)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors flex items-center gap-1"
        >
          <span>Change Plan</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-600 dark:text-slate-300">
            {user.charactersUsedThisMonth.toLocaleString()} characters used
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {remaining.toLocaleString()} remaining
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              usagePercent > 85 ? 'bg-rose-500' : 'bg-gradient-to-r from-primary-600 to-indigo-500'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>WAV Export: {planDetails.wavExport ? 'Enabled' : 'MP3 Only'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>Max / Gen: {planDetails.maxCharactersPerGen.toLocaleString()} chars</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span>Priority Queue: {planDetails.priorityQueue ? 'Active' : 'Standard'}</span>
        </div>
      </div>

    </div>
  );
};
