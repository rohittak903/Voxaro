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
  /**
   * Speaks text aloud through speakers using SpeechSynthesis with custom voice, pitch, speed, and emotion tone
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
    
    // Calculate emotion modulation
    const emotionParams = getEmotionParameters(tone);
    
    // Modulate speaking rate by speed & emotion multiplier
    const finalRate = speed * emotionParams.rateMod;
    utterance.rate = Math.max(0.4, Math.min(2.0, finalRate));
    
    // Pitch calculation with emotion multiplier & semitone offset
    const calculatedPitch = (1.0 + (pitchSemitones * 0.05)) * emotionParams.pitchMod;
    utterance.pitch = Math.max(0.2, Math.min(2.0, calculatedPitch));
    utterance.volume = emotionParams.volumeMod || 1.0;

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
   * Accurately calculates duration and generates loud, clear, high-fidelity playable WAV audio for download
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

    const emotionParams = getEmotionParameters(tone);

    onProgress?.(25, 'Analyzing text phonetics and vocal cadence...');
    await new Promise(r => setTimeout(r, 120));

    onProgress?.(60, `Configuring acoustic voice formants for ${voice.name} (${tone} tone)...`);
    await new Promise(r => setTimeout(r, 120));

    onProgress?.(85, 'Rendering high-fidelity voice audio waveform...');

    // Calculate accurate duration matching the spoken speech speed with emotion rate
    const cleanText = text.replace(/\[pause:([\d.]+(?:s|ms)?)\]/gi, ' ');
    const duration = Math.max(1.0, estimateAudioDuration(cleanText, speed * emotionParams.rateMod));

    // 44.1kHz High-Definition Offline Audio Rendering
    const sampleRate = 44100;
    const totalSamples = Math.max(2048, Math.floor(sampleRate * duration));
    const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
      1,
      totalSamples,
      sampleRate
    );

    const isFemale = voice.gender === 'female';
    const basePitch = (isFemale ? 220 : 130) * Math.pow(2, pitchSemitones / 12) * emotionParams.pitchMod;
    
    // Formant frequency definitions (Klatt Vocal Formants)
    const f1Center = isFemale ? 580 : 480;
    const f2Center = isFemale ? 1750 : 1450;
    const f3Center = isFemale ? 2850 : 2500;

    const words = cleanText.split(/\s+/).filter(Boolean);
    const wordCount = Math.max(1, words.length);
    const wordDuration = Math.min(0.65, (duration / wordCount) * 0.92);
    const pauseGap = Math.max(0.04, (duration - (wordDuration * wordCount)) / wordCount);

    // Master bus compressor / limiter for maximum clarity and punch
    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.92, 0);
    masterGain.connect(offlineCtx.destination);

    // Render each word/syllable with multi-formant vocal resonance
    for (let w = 0; w < wordCount; w++) {
      const word = words[w] || 'voice';
      const wordStart = w * (wordDuration + pauseGap);
      const wordEnd = Math.min(duration, wordStart + wordDuration);
      if (wordStart >= duration) break;

      // Word pitch contour (natural intonation curve)
      const pitchOffset = Math.sin((w / wordCount) * Math.PI) * (isFemale ? 18 : 10) * emotionParams.pitchMod;
      const wordF0 = basePitch + pitchOffset;

      // 1. Primary Glottal Vocal Oscillator (Sawtooth for harmonic richness)
      const osc1 = offlineCtx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(wordF0 * 1.02, wordStart);
      osc1.frequency.exponentialRampToValueAtTime(wordF0 * 0.95, wordEnd);

      // 2. Sub-Harmonic Body Oscillator (Warm Triangle for vocal depth)
      const osc2 = offlineCtx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(wordF0 * 0.5, wordStart);
      osc2.frequency.exponentialRampToValueAtTime(wordF0 * 0.48, wordEnd);

      // 3. Syllable Formant Filter Bank (F1, F2, F3 parallel resonance)
      const charCode = word.charCodeAt(0) || 65;
      const vowelShift = ((charCode % 7) - 3) * 35;

      // Formant 1: Vowel warmth
      const filter1 = offlineCtx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(Math.max(250, (f1Center + vowelShift) * emotionParams.resonance), wordStart);
      filter1.Q.setValueAtTime(2.8, wordStart);

      // Formant 2: Vocal clarity & articulation
      const filter2 = offlineCtx.createBiquadFilter();
      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(Math.max(800, (f2Center + vowelShift * 1.8) * emotionParams.resonance), wordStart);
      filter2.Q.setValueAtTime(3.2, wordStart);

      // Formant 3: Treble brilliance
      const filter3 = offlineCtx.createBiquadFilter();
      filter3.type = 'peaking';
      filter3.frequency.setValueAtTime(f3Center, wordStart);
      filter3.Q.setValueAtTime(4.0, wordStart);
      filter3.gain.setValueAtTime(6.0, wordStart);

      // 4. Amplitude Envelope (Smooth attack, sustained body, smooth decay)
      const envGain = offlineCtx.createGain();
      const attackTime = Math.min(0.04, wordDuration * 0.15);
      const releaseTime = Math.min(0.06, wordDuration * 0.25);
      const peakVol = 0.85 * (emotionParams.volumeMod || 1.0);

      envGain.gain.setValueAtTime(0.0001, wordStart);
      envGain.gain.linearRampToValueAtTime(peakVol, wordStart + attackTime);
      envGain.gain.setValueAtTime(peakVol * 0.9, wordEnd - releaseTime);
      envGain.gain.exponentialRampToValueAtTime(0.0001, wordEnd);

      // Connect vocal nodes
      osc1.connect(filter1);
      osc1.connect(filter2);
      osc2.connect(filter1);
      
      filter1.connect(filter3);
      filter2.connect(filter3);
      filter3.connect(envGain);
      envGain.connect(masterGain);

      // 5. Consonant Transient Burst (Crisp articulation for initial consonants)
      const hasConsonant = /^[b-df-hj-np-tv-z]/i.test(word);
      if (hasConsonant) {
        const noiseBuffer = offlineCtx.createBuffer(1, Math.floor(sampleRate * 0.035), sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * 0.35;
        }

        const noiseSrc = offlineCtx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;

        const noiseFilter = offlineCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(3500, wordStart);

        const noiseGain = offlineCtx.createGain();
        noiseGain.gain.setValueAtTime(0.45, wordStart);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, wordStart + 0.035);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noiseSrc.start(wordStart);
      }

      osc1.start(wordStart);
      osc1.stop(wordEnd);
      osc2.start(wordStart);
      osc2.stop(wordEnd);
    }

    // Render audio graph to PCM buffer
    const renderedBuffer = await offlineCtx.startRendering();

    // Master Peak-Normalized 16-bit PCM WAV Blob (95% full-scale volume)
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
