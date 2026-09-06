import React, { useState, useMemo } from 'react';
import { VOICES } from '../../data/voices';
import { VoiceCard } from './VoiceCard';
import { VoiceFilterBar } from './VoiceFilterBar';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { Voice } from '../../types';
import { Library, Sparkles, AlertCircle } from 'lucide-react';

export const VoiceLibrary: React.FC = () => {
  const { setSelectedVoice } = useAudio();
  const { setCurrentView, isFavorite, showToast } = useUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredVoices = useMemo(() => {
    return VOICES.filter((voice) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = voice.name.toLowerCase().includes(q);
        const matchesLang = voice.language.toLowerCase().includes(q);
        const matchesAccent = voice.accent.toLowerCase().includes(q);
        const matchesTags = voice.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesLang && !matchesAccent && !matchesTags) {
          return false;
        }
      }

      // Language
      if (selectedLanguage !== 'all' && voice.language !== selectedLanguage) {
        return false;
      }

      // Style
      if (selectedStyle !== 'all' && voice.style !== selectedStyle) {
        return false;
      }

      // Gender
      if (selectedGender !== 'all' && voice.gender !== selectedGender) {
        return false;
      }

      // Favorites
      if (onlyFavorites && !isFavorite(voice.id)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedLanguage, selectedStyle, selectedGender, onlyFavorites, isFavorite]);

  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    showToast(`Selected "${voice.name}" as active voice`, 'success');
    setCurrentView('editor');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              AI Voice Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Explore 25+ natural, expressive AI voice models across multiple languages and styles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
            {filteredVoices.length} of {VOICES.length} Voices Available
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <VoiceFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedStyle={selectedStyle}
        setSelectedStyle={setSelectedStyle}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        onlyFavorites={onlyFavorites}
        setOnlyFavorites={setOnlyFavorites}
      />

      {/* Voices Grid */}
      {filteredVoices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No voices match your filters</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try adjusting your search query, language selection, or clear active filters to view the full collection.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLanguage('all');
              setSelectedGender('all');
              setSelectedStyle('all');
              setOnlyFavorites(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              onSelect={handleSelectVoice}
            />
          ))}
        </div>
      )}

    </div>
  );
};
