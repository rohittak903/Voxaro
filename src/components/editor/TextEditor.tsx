import React, { useState, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { VoiceQuickSelect } from './VoiceQuickSelect';
import { FileUploadModal } from './FileUploadModal';
import { PronunciationModal } from './PronunciationModal';
import { WaveformPlayer } from '../player/WaveformPlayer';
import { PRESET_SAMPLES } from '../../data/presets';
import { EmotionTone } from '../../types';
import { estimateAudioDuration } from '../../utils/helpers';
import { 
  Wand2, 
  Clock, 
  Sliders, 
  UploadCloud, 
  BookA, 
  FileText, 
  Trash2, 
  Play, 
  Pause, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Volume2,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';

export const TextEditor: React.FC = () => {
  const {
    inputText,
    setInputText,
    selectedVoice,
    speed,
    setSpeed,
    pitch,
    setPitch,
    tone,
    setTone,
    isGenerating,
    generationProgress,
    generationStatus,
    generateAudio,
    cancelGeneration,
    currentJob,
    lastDraftSavedTime,
  } = useAudio();

  const { planDetails, t, showToast, isAuthenticated, setShowAuthModal } = useUser();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPronounceModal, setShowPronounceModal] = useState(false);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const charCount = inputText.length;
  const maxChars = planDetails.maxCharactersPerGen;
  const isNearLimit = charCount > maxChars * 0.85;
  const isOverLimit = charCount > maxChars;
  const estimatedDuration = estimateAudioDuration(inputText, speed);

  const insertPause = (pauseTag: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = inputText.substring(0, start);
    const after = inputText.substring(end);
    const newText = before + ` ${pauseTag} ` + after;
    setInputText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + pauseTag.length + 2, start + pauseTag.length + 2);
    }, 50);
  };

  const handleApplyPreset = (preset: typeof PRESET_SAMPLES[0]) => {
    setInputText(preset.text);
    setTone(preset.tone);
    setSpeed(preset.speed);
    setShowPresetsDropdown(false);
    showToast(`Loaded preset "${preset.title}"`, 'success');
  };

  const handleClear = () => {
    if (inputText.length > 0 && confirm('Are you sure you want to clear the editor?')) {
      setInputText('');
    }
  };

  const tones: { id: EmotionTone; label: string; emoji: string }[] = [
    { id: 'neutral', label: 'Neutral', emoji: '🎙️' },
    { id: 'happy', label: 'Happy', emoji: '✨' },
    { id: 'excited', label: 'Excited', emoji: '🚀' },
    { id: 'calm', label: 'Calm', emoji: '🍃' },
    { id: 'serious', label: 'Serious', emoji: '💼' },
    { id: 'sad', label: 'Melancholy', emoji: '🌧️' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Top Header: Voice Selector */}
      <VoiceQuickSelect />

      {/* Main Studio Editor Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all">
        
        {/* Editor Top Bar: Presets, Pause Insertion, File Upload, Pronunciation */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2.5">
          
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            
            {/* Pause Insertion Pill buttons */}
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 p-1 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Pause:
              </span>
              <button
                onClick={() => insertPause('[pause:0.5s]')}
                className="px-2 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors"
                title="Insert 0.5s pause tag"
              >
                +0.5s
              </button>
              <button
                onClick={() => insertPause('[pause:1s]')}
                className="px-2 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors"
                title="Insert 1s pause tag"
              >
                +1.0s
              </button>
              <button
                onClick={() => insertPause('[pause:2s]')}
                className="px-2 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-primary-600 transition-colors"
                title="Insert 2s pause tag"
              >
                +2.0s
              </button>
            </div>

            {/* Pronunciation Override */}
            <button
              onClick={() => setShowPronounceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-primary-400 transition-colors shadow-2xs"
            >
              <BookA className="w-3.5 h-3.5 text-primary-500" />
              <span>{t.pronunciation}</span>
            </button>

            {/* Document Import */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-primary-400 transition-colors shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.uploadDoc}</span>
            </button>
          </div>

          {/* Presets & Clear */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Presets Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold hover:bg-primary-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.presets}</span>
              </button>

              {showPresetsDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowPresetsDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-40 space-y-1">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Sample Scripts
                    </p>
                    {PRESET_SAMPLES.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col gap-0.5"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">{preset.title}</span>
                        <span className="text-[10px] text-slate-400">{preset.category} • {preset.tone}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Clear Button */}
            {inputText.length > 0 && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Clear Text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Text Area */}
        <div className="p-4 sm:p-5 relative flex-1">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste the script you want your AI voice to read aloud... You can insert pauses using [pause:1s] markers."
            rows={7}
            className="w-full resize-y bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-lg leading-relaxed focus:outline-none font-normal"
          />

          {/* In-Editor Status Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            {/* Auto-save & Duration Estimate */}
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              {lastDraftSavedTime && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Draft saved {lastDraftSavedTime}</span>
                </span>
              )}
              {estimatedDuration > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Duration: ~{estimatedDuration}s</span>
                </span>
              )}
            </div>

            {/* Character Counter */}
            <div className="flex items-center gap-1 font-mono">
              <span className={`font-semibold ${
                isOverLimit 
                  ? 'text-rose-500 font-bold' 
                  : isNearLimit 
                  ? 'text-amber-500' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {charCount.toLocaleString()}
              </span>
              <span className="text-slate-400">/ {maxChars.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 uppercase ml-0.5">{t.characters}</span>
            </div>
          </div>
        </div>

        {/* Customization Sliders & Emotion Controls Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            
            {/* Speed Control Slider (0.5x - 2.0x) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-primary-500" />
                  <span>{t.speed}</span>
                </label>
                <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.5x (Slow)</span>
                <span>1.0x</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            {/* Pitch Control Slider (-10 to +10) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-primary-500" />
                  <span>{t.pitch}</span>
                </label>
                <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                  {pitch > 0 ? `+${pitch}` : pitch} st
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-10 (Deep)</span>
                <span>0 (Natural)</span>
                <span>+10 (High)</span>
              </div>
            </div>

            {/* Emotion / Tone Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                  <span>{t.tone}</span>
                </label>
                <span className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold truncate max-w-[130px]">
                  {tones.find(item => item.id === tone)?.label} Tone
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {tones.map((tItem) => (
                  <button
                    key={tItem.id}
                    onClick={() => setTone(tItem.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                      tone === tItem.id
                        ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-400'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{tItem.emoji}</span>
                    <span className="truncate">{tItem.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Action / Generate Button Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Status info or progress */}
          <div className="w-full sm:w-auto flex-1">
            {isGenerating ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {generationStatus}
                  </span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{generationProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Zero-latency neural synthesis • Ready to generate</span>
              </div>
            )}
          </div>

          {/* Big Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isGenerating ? (
              <button
                onClick={cancelGeneration}
                className="px-4 py-3 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={generateAudio}
                disabled={isOverLimit || inputText.trim().length === 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 hover:from-primary-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2.5 transform active:scale-98 transition-all cursor-pointer"
              >
                <Wand2 className="w-5 h-5" />
                <span>{t.generateBtn}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Embedded Waveform Studio Player when audio job is ready */}
      {currentJob && <WaveformPlayer />}

      {/* Modals */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onTextLoaded={(txt) => setInputText(txt)}
      />

      <PronunciationModal
        isOpen={showPronounceModal}
        onClose={() => setShowPronounceModal(false)}
      />

    </div>
  );
};
