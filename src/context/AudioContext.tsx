import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { EmotionTone, GenerationJob, Voice } from '../types';
import { VOICES } from '../data/voices';
import { StorageService } from '../services/storage';
import { CloudSyncService } from '../services/cloudSyncService';
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
  const { user, authUser, planDetails, recordUsage, showToast, setShowPricingModal, isAuthenticated, setShowAuthModal, t } = useUser();

  const draft = StorageService.loadDraft();
  const defaultFreeVoice = VOICES.find(v => !v.isPremium) || VOICES[0];
  const initialVoice = (() => {
    if (draft.voiceId) {
      const found = VOICES.find(v => v.id === draft.voiceId);
      if (found) {
        if (user.plan === 'free' && found.isPremium) {
          return defaultFreeVoice;
        }
        return found;
      }
    }
    return defaultFreeVoice;
  })();

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
  
  // History & Active Job: Only load persistent history for authenticated accounts
  const [history, setHistory] = useState<GenerationJob[]>(() => {
    if (typeof window !== 'undefined' && StorageService.loadAuthUser()) {
      return StorageService.loadHistory();
    }
    return [];
  });
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
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and bind HTML5 Audio Element for seamless high-fidelity speech playback
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';

    const handleTimeUpdate = () => {
      if (audio && !isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration * 10) / 10);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);

    audioElementRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleError);
      audioElementRef.current = null;
    };
  }, []);

  // Cross-device & Login/Logout Sync Event Listeners
  useEffect(() => {
    const handleAccountSynced = (e: any) => {
      if (e.detail && Array.isArray(e.detail.history)) {
        setHistory(e.detail.history);
      }
    };

    const handleUserLoggedOut = () => {
      setHistory([]);
      setCurrentJob(null);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      AudioSynthesisEngine.stopSpeaking();
      stopPlaybackProgress();
      setIsPlaying(false);
    };

    window.addEventListener('voxaro_account_synced', handleAccountSynced);
    window.addEventListener('voxaro_user_logged_out', handleUserLoggedOut);

    const unsubscribe = CloudSyncService.subscribeToSyncEvents((event) => {
      if (authUser && event.email && event.email.toLowerCase() === authUser.email.toLowerCase()) {
        if (event.data && Array.isArray(event.data.history)) {
          setHistory(event.data.history);
        }
      }
    });

    return () => {
      window.removeEventListener('voxaro_account_synced', handleAccountSynced);
      window.removeEventListener('voxaro_user_logged_out', handleUserLoggedOut);
      unsubscribe();
    };
  }, [authUser]);

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

  // Auto-save history changes (ONLY for authenticated logged-in accounts)
  useEffect(() => {
    if (isAuthenticated) {
      StorageService.saveHistory(history);
    }
  }, [history, isAuthenticated]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
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

  // Play Speech Aloud with real-time waveform sync via HTML5 Audio element
  const playSpeechAloud = (job: GenerationJob, startOffsetSec: number = 0) => {
    AudioSynthesisEngine.stopSpeaking();
    stopPlaybackProgress();

    const targetDuration = job.duration || estimateAudioDuration(job.inputText, job.speed);
    setDuration(targetDuration);

    const audio = audioElementRef.current;
    if (audio && job.audioUrl) {
      try {
        if (audio.src !== job.audioUrl) {
          audio.src = job.audioUrl;
        }
        audio.volume = volume;
        audio.playbackRate = Math.max(0.5, Math.min(2.0, playbackRate * (job.speed || 1.0)));
        audio.loop = isLooping;

        const startPlay = () => {
          if (startOffsetSec > 0 && audio.duration && !isNaN(audio.duration)) {
            try {
              audio.currentTime = Math.min(startOffsetSec, audio.duration);
            } catch {}
          }
          audio.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.warn('Audio play request:', err);
            setIsPlaying(false);
          });
        };

        if (audio.readyState >= 2) {
          startPlay();
        } else {
          audio.addEventListener('canplay', startPlay, { once: true });
          audio.load();
        }
        return;
      } catch (audioErr) {
        console.warn('HTML5 Audio playback error', audioErr);
        setIsPlaying(false);
      }
    }
  };

  // Generation Trigger
  const generateAudio = async (): Promise<boolean> => {
    // Pre-unlock audio element in synchronous user click gesture context
    if (audioElementRef.current) {
      try {
        audioElementRef.current.play().catch(() => {});
      } catch {}
    }

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

    // 3. Quota check (only deduct quota if authenticated)
    if (isAuthenticated) {
      const allowed = recordUsage(trimmed.length);
      if (!allowed) return false;
    }

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

      setCurrentJob(newJob);

      // IMMEDIATELY play the speech audio loud and clear!
      playSpeechAloud(newJob);

      // RULE: IF USER IS NOT LOGGED IN -> DO NOT SAVE TO HISTORY OR CLOUD
      if (!isAuthenticated) {
        showToast('Speech playing! (Guest mode: Not saved to history. Sign in with Google to sync across devices)', 'info');
      } else {
        // Authenticated user: Save to persistent history and sync across all devices
        const currentEmail = authUser?.email;
        const updatedHistory = [newJob, ...history];
        setHistory(updatedHistory);
        StorageService.saveHistory(updatedHistory, currentEmail);

        if (currentEmail) {
          CloudSyncService.queueDebouncedSync(currentEmail, { history: updatedHistory }, true);
        }

        showToast('Audio synthesized & saved to your account!', 'success');
      }

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
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
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
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      AudioSynthesisEngine.stopSpeaking();
      stopPlaybackProgress();
      setIsPlaying(false);
    } else {
      playSpeechAloud(currentJob, currentTime);
    }
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
    if (audioElementRef.current && currentJob?.audioUrl) {
      audioElementRef.current.currentTime = time;
    }
    if (currentJob && !audioElementRef.current) {
      playSpeechAloud(currentJob, time);
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioElementRef.current) {
      audioElementRef.current.volume = v;
    }
  };

  const setPlaybackRate = (r: number) => {
    setPlaybackRateState(r);
    if (audioElementRef.current && currentJob) {
      audioElementRef.current.playbackRate = Math.max(0.5, Math.min(2.0, r * (currentJob.speed || 1.0)));
    }
  };

  const toggleLoop = () => {
    setIsLooping(prev => {
      const next = !prev;
      if (audioElementRef.current) {
        audioElementRef.current.loop = next;
      }
      return next;
    });
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

  // History Management with Cross-Device Cloud Sync
  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(j => j.id !== id);
    setHistory(updated);
    const currentEmail = authUser?.email;
    if (isAuthenticated) {
      StorageService.saveHistory(updated, currentEmail);
      if (currentEmail) {
        CloudSyncService.queueDebouncedSync(currentEmail, { history: updated }, true);
      }
    }
    if (currentJob?.id === id) {
      setCurrentJob(null);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      AudioSynthesisEngine.stopSpeaking();
      stopPlaybackProgress();
      setIsPlaying(false);
    }
    showToast('Item removed from history', 'info');
  };

  const clearHistory = () => {
    setHistory([]);
    const currentEmail = authUser?.email;
    if (isAuthenticated) {
      StorageService.saveHistory([], currentEmail);
      if (currentEmail) {
        CloudSyncService.queueDebouncedSync(currentEmail, { history: [] }, true);
      }
    }
    setCurrentJob(null);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
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
    if (audioElementRef.current && job.audioUrl) {
      audioElementRef.current.pause();
      audioElementRef.current.src = job.audioUrl;
      audioElementRef.current.currentTime = 0;
    }
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
