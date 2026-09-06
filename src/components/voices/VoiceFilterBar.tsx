import React from 'react';
import { useUser } from '../../context/UserContext';
import { VOICE_LANGUAGES, VOICE_STYLES } from '../../data/voices';
import { Search, Filter, Star, Sparkles } from 'lucide-react';

interface VoiceFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  onlyFavorites: boolean;
  setOnlyFavorites: (fav: boolean) => void;
}

export const VoiceFilterBar: React.FC<VoiceFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedLanguage,
  setSelectedLanguage,
  selectedStyle,
  setSelectedStyle,
  selectedGender,
  setSelectedGender,
  onlyFavorites,
  setOnlyFavorites,
}) => {
  const { t } = useUser();

  return (
    <div className="space-y-3.5 mb-6">
      
      {/* Search Bar & Favorite Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchVoices}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
          />
        </div>

        {/* Favorite Filter Toggle */}
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            onlyFavorites
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
          <span>Favorites Only</span>
        </button>
      </div>

      {/* Filter Dropdowns / Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        
        {/* Language Filter */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          aria-label="Filter by Language"
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-2xs"
        >
          <option value="all">{t.allLanguages}</option>
          {VOICE_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        {/* Gender Filter */}
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          aria-label="Filter by Gender"
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-2xs capitalize"
        >
          <option value="all">{t.allGenders}</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non-binary">Non-Binary / Synthetic</option>
        </select>

        {/* Style Filter */}
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          aria-label="Filter by Style"
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-2xs capitalize"
        >
          <option value="all">{t.allStyles}</option>
          {VOICE_STYLES.map((st) => (
            <option key={st} value={st}>
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </option>
          ))}
        </select>

        {/* Reset Filters button if any active */}
        {(selectedLanguage !== 'all' || selectedGender !== 'all' || selectedStyle !== 'all' || searchQuery || onlyFavorites) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLanguage('all');
              setSelectedGender('all');
              setSelectedStyle('all');
              setOnlyFavorites(false);
            }}
            className="px-2.5 py-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}

      </div>

    </div>
  );
};
