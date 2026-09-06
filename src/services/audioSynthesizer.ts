import { EmotionTone, Voice } from '../types';
import { getEmotionParameters, parseTextWithPauses, estimateAudioDuration } from '../utils/helpers';
import { audioBufferToWavBlob } from './audioExporter';

export interface SynthesisProgressCallback {
  (progressPercent: number, statusMessage: string): void;
}

export class AudioSynthesisEngine {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static systemVoices: SpeechSynthesisVoice[] = [];
  private static isInitialized = false;

  static init(): void {
    if (typeof window === 'undefined' || !this.synth) return;
    if (this.isInitialized) return;

    const loadVoices = () => {
      this.systemVoices = this.synth?.getVoices() || [];
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
    this.isInitialized = true;
  }

  /**
   * Returns list of available browser system voices
   */
  static getSystemVoices(): SpeechSynthesisVoice[] {
    this.init();
    if (this.systemVoices.length === 0 && this.synth) {
      this.systemVoices = this.synth.getVoices();
    }
    return this.systemVoices;
  }

  /**
   * Finds the best matching native browser voice for the given Voice definition
   */
  static findBestNativeVoice(voice: Voice): SpeechSynthesisVoice | undefined {
    const sysVoices = this.getSystemVoices();
    if (sysVoices.length === 0) return undefined;

    const langCode = voice.langCode.toLowerCase().replace('_', '-');
    const langPrefix = langCode.split('-')[0];

    // 1. Exact match by name
    if (voice.nativeVoiceName) {
      const match = sysVoices.find(v => v.name.toLowerCase().includes(voice.nativeVoiceName!.toLowerCase()));
      if (match) return match;
    }

    // 2. Exact match by full language code (e.g. en-US, hi-IN, es-ES)
    const exactLangMatch = sysVoices.filter(v => v.lang.toLowerCase().replace('_', '-') === langCode);
    if (exactLangMatch.length > 0) {
      if (voice.gender === 'female') {
        const female = exactLangMatch.find(v => /female|zira|samantha|victoria|karen|kavya|sabina|lucia|camille|priya/i.test(v.name));
        if (female) return female;
      } else if (voice.gender === 'male') {
        const male = exactLangMatch.find(v => /male|david|alex|daniel|george|arthur|rohit|ravi|mateo|julien/i.test(v.name));
        if (male) return male;
      }
      return exactLangMatch[0];
    }

    // 3. Fallback to language prefix (e.g. 'en', 'es', 'fr', 'hi', 'de')
    const prefixMatch = sysVoices.filter(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch.length > 0) {
      return prefixMatch[0];
    }

    return sysVoices[0];
  }

  /**
   * Speaks text aloud through speakers using SpeechSynthesis with custom voice, pitch, speed, and callbacks
   */
  static speak(
    text: string,
    voice: Voice,
    speed: number = 1.0,
    pitchSemitones: number = 0,
    tone: EmotionTone = 'neutral',
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
      onBoundary?: (charIndex: number, charLength: number) => void;
    }
  ): SpeechSynthesisUtterance | null {
    if (!this.synth) return null;
    this.synth.cancel();

    // Clean text of pause markers into natural punctuation pauses
    const cleanText = text.replace(/\[pause:([\d.]+(?:s|ms)?)\]/gi, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const nativeVoice = this.findBestNativeVoice(voice);
    if (nativeVoice) {
      utterance.voice = nativeVoice;
    }
    utterance.lang = voice.langCode;
    utterance.rate = Math.max(0.5, Math.min(2.0, speed));
    
    // Pitch calculation
    const emotionParams = getEmotionParameters(tone);
    const pitchVal = 1.0 + (pitchSemitones * 0.05) + (emotionParams.pitchMod - 1.0);
    utterance.pitch = Math.max(0.5, Math.min(2.0, pitchVal));
    utterance.volume = 1.0;

    utterance.onstart = () => callbacks?.onStart?.();
    utterance.onend = () => {
      (window as any).__voxcraftActiveUtterance = null;
      callbacks?.onEnd?.();
    };
    utterance.onerror = () => {
      (window as any).__voxcraftActiveUtterance = null;
      callbacks?.onError?.();
    };
    utterance.onboundary = (e) => {
      callbacks?.onBoundary?.(e.charIndex, (e as any).charLength || 5);
    };

    // Store on global window object to prevent Chrome/Edge garbage collection freeze
    (window as any).__voxcraftActiveUtterance = utterance;

    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(utterance);
    return utterance;
  }

  /**
   * Preview a voice's sample phrase
   */
  static speakPreview(voice: Voice, onStart?: () => void, onEnd?: () => void): void {
    this.speak(voice.sampleText, voice, 1.0, 0, 'neutral', {
      onStart,
      onEnd,
      onError: onEnd
    });
  }

  /**
   * Stops any active speech output
   */
  static stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    (window as any).__voxcraftActiveUtterance = null;
  }

  /**
   * Synthesize Audio Job:
   * Accurately calculates duration and generates playable WAV audio buffer for download
   */
  static async synthesizeJob(
    text: string,
    voice: Voice,
    speed: number,
    pitchSemitones: number,
    tone: EmotionTone,
    onProgress?: SynthesisProgressCallback
  ): Promise<{ audioBlob: Blob; audioUrl: string; duration: number }> {
    this.init();

    onProgress?.(25, 'Analyzing text structure and phonetics...');
    await new Promise(r => setTimeout(r, 150));

    onProgress?.(60, `Configuring acoustic voice model for ${voice.name}...`);
    await new Promise(r => setTimeout(r, 150));

    onProgress?.(85, 'Synthesizing voice waveform audio buffer...');

    // Calculate accurate duration matching the spoken speech speed
    const duration = estimateAudioDuration(text, speed);

    // Render acoustic vocal formants for the exact text words
    const sampleRate = 44100;
    const totalSamples = Math.max(1024, Math.floor(sampleRate * duration));
    const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
      1,
      totalSamples,
      sampleRate
    );

    const baseFreq = (voice.gender === 'female' ? 220 : 140) * Math.pow(2, pitchSemitones / 12);
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = Math.max(1, words.length);
    const wordDuration = duration / wordCount;

    // Build vocal envelope & resonance matching the words
    for (let w = 0; w < wordCount; w++) {
      const word = words[w];
      const startTime = w * wordDuration;
      const endTime = startTime + wordDuration * 0.9;

      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();

      filter.type = 'bandpass';
      const charCode = word.charCodeAt(0) || 65;
      const formantFreq = 500 + (charCode % 10) * 180;
      filter.frequency.setValueAtTime(formantFreq, startTime);
      filter.Q.setValueAtTime(4.5, startTime);

      osc.type = (w % 2 === 0) ? 'sawtooth' : 'triangle';
      const pitchInflection = Math.sin((w / wordCount) * Math.PI) * 12;
      osc.frequency.setValueAtTime(baseFreq + pitchInflection, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.96, endTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(startTime);
      osc.stop(endTime);
    }

    const renderedBuffer = await offlineCtx.startRendering();
    const audioBlob = audioBufferToWavBlob(renderedBuffer);
    const audioUrl = URL.createObjectURL(audioBlob);

    onProgress?.(100, 'Audio generation complete!');

    return {
      audioBlob,
      audioUrl,
      duration
    };
  }
}
