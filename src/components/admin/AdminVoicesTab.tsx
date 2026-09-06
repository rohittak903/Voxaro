import React, { useState } from 'react';
import { VOICES } from '../../data/voices';
import { AdminService } from '../../services/adminService';
import { useUser } from '../../context/UserContext';
import { 
  Volume2, 
  Crown, 
  Check, 
  X, 
  Globe, 
  Sparkles, 
  SlidersHorizontal,
  Search
} from 'lucide-react';

export const AdminVoicesTab: React.FC = () => {
  const { showToast } = useUser();
  const [overrides, setOverrides] = useState(() => AdminService.getVoiceOverrides());
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState('all');

  const handleToggleActive = (voiceId: string) => {
    const updated = AdminService.toggleVoiceActive(voiceId);
    setOverrides({ ...updated });
    showToast('Voice availability status updated', 'info');
  };

  const handleTogglePremium = (voiceId: string) => {
    const updated = AdminService.toggleVoicePremium(voiceId);
    setOverrides({ ...updated });
    showToast('Voice premium tier requirement updated', 'info');
  };

  const filteredVoices = VOICES.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.accent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = langFilter === 'all' || v.langCode.startsWith(langFilter);
    return matchesSearch && matchesLang;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search AI voice models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Languages' },
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'Hindi (हिंदी)' },
            { id: 'es', label: 'Spanish' },
            { id: 'fr', label: 'French' },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLangFilter(l.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                langFilter === l.id
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoices.map((v) => {
          const override = overrides[v.id];
          const isActive = override?.isActive !== undefined ? override.isActive : true;
          const isPremium = override?.isPremium !== undefined ? override.isPremium : v.isPremium;

          return (
            <div
              key={v.id}
              className={`p-5 rounded-3xl border transition-all space-y-3 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
              }`}
            >
              {/* Voice Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${v.avatarColor} text-white font-bold flex items-center justify-center text-xs`}>
                    {v.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{v.name}</span>
                      {isPremium && (
                        <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400">{v.language} • {v.gender}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}>
                  {isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              {/* Sample text preview */}
              <p className="text-[11px] text-slate-500 italic line-clamp-2">
                "{v.sampleText}"
              </p>

              {/* Control Switches */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                
                {/* Premium Toggle */}
                <button
                  onClick={() => handleTogglePremium(v.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    isPremium
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{isPremium ? 'Premium Plan' : 'Free Tier'}</span>
                </button>

                {/* Enable/Disable Switch */}
                <button
                  onClick={() => handleToggleActive(v.id)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                  }`}
                >
                  {isActive ? 'Disable Voice' : 'Enable Voice'}
                </button>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
