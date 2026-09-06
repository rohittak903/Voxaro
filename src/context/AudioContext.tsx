import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { EmotionTone, GenerationJob, Voice } from '../types';
import { VOICES } from '../data/voices';
import { StorageService } from '../services/storage';
import { AudioSynthesisEngine } from '../services/audioSynthesizer';
import { validateContent } from '../services/moderation';
import { applyPronunciationOverrides, generateWaveformPeaks, estimateAudioDuration } from '../utils/helpers';
import { useUser } from './UserContext';

interface AudioContextType {
  inputText: string;
  setInputText: (text: string) => void;
  selectedVoice: Voice;
  setSelectedVoice: (voice: Voice) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  tone: EmotionTone;
  setTone: (tone: EmotionTone) => void;
  
  // Generation state
  isGenerating: boolean;
  generationProgress: number;
  generationStatus: string;
  generateAudio: () => Promise<boolean>;
  cancelGeneration: () => void;
  
  // Player state
  currentJob: GenerationJob | null;
  setCurrentJob: (job: GenerationJob | null) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLooping: boolean;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleLoop: () => void;
  
  // Preview
  previewVoice: (voice: Voice) => void;
  previewingVoiceId: string | null;
  stopPreview: () => void;

  // History
  history: GenerationJob[];
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  loadJobIntoEditor: (job: GenerationJob) => void;

  // Modals
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
  lastDraftSavedTime: string | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, planDetails, recordUsage, showToast, setShowPricingModal, t } = useUser();

  const draft = StorageService.loadDraft();
  const initialVoice = VOICES.find(v => v.id === draft.voiceId) || VOICES[0];

  const [inputText, setInputText] = useState(draft.text || 'Welcome to Voxaro! Turn text into voice with natural, real, and limitless speech synthesis. Type or paste your text here to begin.');
  const [selectedVoice, setSelectedVoice] = useState<Voice>(initialVoice);
  const [speed, setSpeed] = useState<number>(draft.settings?.speed || 1.0);
  const [pitch, setPitch] = useState<number>(draft.settings?.pitch || 0);
  const [tone, setTone] = useState<EmotionTone>(draft.settings?.tone || 'neutral');
  const [lastDraftSavedTime, setLastDraftSavedTime] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  
  // History & Active Job
  const [history, setHistory] = useState<GenerationJob[]>(() => StorageService.loadHistory());
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null);

  // Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1.0);
  const [playbackRate, setPlaybackRateState] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  // Modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const playbackTimerRef = useRef<number | null>(null);
  const isGeneratingRef = useRef(false);

  // Auto-save draft every 5 seconds (FR-1.4)
  useEffect(() => {
    const timer = setInterval(() => {
      if (inputText.trim().length > 0) {
        StorageService.saveDraft(inputText, selectedVoice.id, { speed, pitch, tone });
        const now = new Date();
        setLastDraftSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [inputText, selectedVoice, speed, pitch, tone]);

  // Auto-save history changes
  useEffect(() => {
    StorageService.saveHistory(history);
  }, [history]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      AudioSynthesisEngine.stopSpeaking();
    };
  }, []);

  const stopPlaybackProgress = () => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  const startPlaybackProgress = (targetDuration: number, startOffsetSec: number = 0) => {
    stopPlaybackProgress();
    const startTime = Date.now() - (startOffsetSec * 1000);
    const interval = 50; // Smooth 20fps progress update

    playbackTimerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= targetDuration) {
        setCurrentTime(targetDuration);
        stopPlaybackProgress();
      } else {
        setCurrentTime(Math.min(targetDuration, elapsed));
      }
    }, interval);
  };

  // Play Speech Aloud with real-time word boundary sync
  const playSpeechAloud = (job: GenerationJob, startOffsetSec: number = 0) => {
    AudioSynthesisEngine.stopSpeaking();
    stopPlaybackProgress();

    const targetDuration = job.duration || estimateAudioDuration(job.inputText, job.speed);
    setIsPlaying(true);
    setCurrentTime(startOffsetSec);
    setDuration(targetDuration);
    startPlaybackProgress(targetDuration, startOffsetSec);

    const totalChars = job.inputText.length || 1;

    AudioSynthesisEngine.speak(
      job.inputText,
      job.voice,
      job.speed * playbackRate,
      job.pitch,
      job.tone,
      {
        onStart: () => {
          setIsPlaying(true);
        },
        onBoundary: (charIndex) => {
          const ratio = Math.min(1.0, Math.max(0, charIndex / totalChars));
          const time = Math.round(ratio * targetDuration * 10) / 10;
          setCurrentTime(time);
        },
        onEnd: () => {
          setIsPlaying(false);
          stopPlaybackProgress();
          setCurrentTime(targetDuration);
          setTimeout(() => {
            setCurrentTime(0);
          }, 600);
        },
        onError: () => {
          setIsPlaying(false);
          stopPlaybackProgress();
        }
      }
    );
  };

  // Generation Trigger
  const generateAudio = async (): Promise<boolean> => {
    const trimmed = inputText.trim();

    // 1. Validation
    if (!trimmed) {
      showToast(t.errorEmptyText, 'error');
      return false;
    }

    if (trimmed.length > planDetails.maxCharactersPerGen) {
      showToast(`Character limit exceeded (${trimmed.length}/${planDetails.maxCharactersPerGen}). Please upgrade to generate longer scripts.`, 'warning');
      setShowPricingModal(true);
      return false;
    }

    // 2. Content Moderation
    const moderation = validateContent(trimmed);
    if (!moderation.isValid) {
      showToast(moderation.reason || t.errorHarmfulContent, 'error');
      return false;
    }

    // 3. Quota check
    const allowed = recordUsage(trimmed.length);
    if (!allowed) return false;

    // 4. Premium Voice check
    if (selectedVoice.isPremium && user.plan === 'free') {
      showToast(`"${selectedVoice.name}" is a Premium Voice. Please upgrade to Creator or Pro to unlock.`, 'warning');
      setShowPricingModal(true);
      return false;
    }

    setIsGenerating(true);
    isGeneratingRef.current = true;
    setGenerationProgress(10);
    setGenerationStatus('Synthesizing speech audio...');

    try {
      // 5. Apply custom pronunciation rules
      const processedText = applyPronunciationOverrides(trimmed, user.customPronunciations);

      // 6. Synthesize audio buffer & calculate accurate duration
      const result = await AudioSynthesisEngine.synthesizeJob(
        processedText,
        selectedVoice,
        speed,
        pitch,
        tone,
        (prog, status) => {
          if (isGeneratingRef.current) {
            setGenerationProgress(prog);
            setGenerationStatus(status);
          }
        }
      );

      const newJob: GenerationJob = {
        id: 'job-' + Date.now(),
        title: trimmed.slice(0, 45) + (trimmed.length > 45 ? '...' : ''),
        inputText: trimmed,
        processedText,
        voiceId: selectedVoice.id,
        voice: selectedVoice,
        speed,
        pitch,
        tone,
        status: 'complete',
        audioUrl: result.audioUrl,
        audioBlob: result.audioBlob,
        duration: result.duration,
        characterCount: trimmed.length,
        format: planDetails.wavExport ? 'wav' : 'mp3',
        createdAt: new Date().toISOString(),
        waveformPeaks: generateWaveformPeaks(70, trimmed + selectedVoice.id)
      };

      setHistory(prev => [newJob, ...prev]);
      setCurrentJob(newJob);

      // Immediately play the speech audio loud and clear!
      playSpeechAloud(newJob);

      showToast('Audio synthesized and playing!', 'success');
      return true;
    } catch (err: any) {
      console.error('Generation error', err);
      showToast(err?.message || 'Audio generation failed. Please try again.', 'error');
      return false;
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const cancelGeneration = () => {
    isGeneratingRef.current = false;
    setIsGenerating(false);
    AudioSynthesisEngine.stopSpeaking();
    stopPlaybackProgress();
    setIsPlaying(false);
    showToast('Generation cancelled', 'info');
  };

  // Audio Player Controls
  const togglePlay = () => {
    if (!currentJob) {
      generateAudio();
      return;
    }

    if (isPlaying) {
      AudioSynthesisEngine.stopSpeaking();
      stopPlaybackProgress();
      setIsPlaying(false);
    } else {
      playSpeechAloud(currentJob, currentTime);
    }
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (currentJob) {
      playSpeechAloud(currentJob, time);
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
  };

  const setPlaybackRate = (r: number) => {
    setPlaybackRateState(r);
    if (currentJob && isPlaying) {
      playSpeechAloud(currentJob, currentTime);
    }
  };

  const toggleLoop = () => {
    setIsLooping(prev => !prev);
  };

  // Preview Voice Samples
  const previewVoice = (voice: Voice) => {
    if (previewingVoiceId === voice.id) {
      stopPreview();
      return;
    }

    stopPreview();
    setPreviewingVoiceId(voice.id);
    AudioSynthesisEngine.speakPreview(
      voice,
      () => setPreviewingVoiceId(voice.id),
      () => setPreviewingVoiceId(null)
    );
  };

  const stopPreview = () => {
    AudioSynthesisEngine.stopSpeaking();
    setPreviewingVoiceId(null);
  };

  // History Management
  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(j => j.id !== id));
    if (currentJob?.id === id) {
      setCurrentJob(null);
      AudioSynthesisEngine.stopSpeaking();
      stopPlaybackProgress();
      setIsPlaying(false);
    }
    showToast('Item removed from history', 'info');
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentJob(null);
    AudioSynthesisEngine.stopSpeaking();
    stopPlaybackProgress();
    setIsPlaying(false);
    showToast('History cleared', 'info');
  };

  const loadJobIntoEditor = (job: GenerationJob) => {
    setInputText(job.inputText);
    const v = VOICES.find(voice => voice.id === job.voiceId);
    if (v) setSelectedVoice(v);
    setSpeed(job.speed);
    setPitch(job.pitch);
    setTone(job.tone);
    setCurrentJob(job);
    showToast('Loaded into studio editor', 'success');
  };

  return (
    <AudioContext.Provider
      value={{
        inputText,
        setInputText,
        selectedVoice,
        setSelectedVoice,
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
        setCurrentJob,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate,
        isLooping,
        togglePlay,
        seekTo,
        setVolume,
        setPlaybackRate,
        toggleLoop,
        previewVoice,
        previewingVoiceId,
        stopPreview,
        history,
        deleteHistoryItem,
        clearHistory,
        loadJobIntoEditor,
        showExportModal,
        setShowExportModal,
        showShareModal,
        setShowShareModal,
        lastDraftSavedTime,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
