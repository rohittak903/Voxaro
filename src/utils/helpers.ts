import { EmotionTone, PronunciationRule, Voice } from '../types';

export interface ParsedSpeechSegment {
  type: 'speech' | 'pause';
  text?: string;
  durationMs?: number;
}

/**
 * Parses text containing [pause:Xs] or [pause:Xms] tags into ordered speech and pause segments
 */
export function parseTextWithPauses(text: string): ParsedSpeechSegment[] {
  const pauseRegex = /\[pause:([\d.]+(?:s|ms)?)\]/gi;
  const segments: ParsedSpeechSegment[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pauseRegex.exec(text)) !== null) {
    const preText = text.substring(lastIndex, match.index);
    if (preText.trim().length > 0) {
      segments.push({ type: 'speech', text: preText });
    }

    const durationStr = match[1].toLowerCase();
    let durationMs = 1000;
    if (durationStr.endsWith('ms')) {
      durationMs = parseFloat(durationStr);
    } else if (durationStr.endsWith('s')) {
      durationMs = parseFloat(durationStr) * 1000;
    } else {
      durationMs = parseFloat(durationStr) * 1000;
    }

    // Clamp pause between 100ms and 10000ms
    durationMs = Math.max(100, Math.min(10000, durationMs));
    segments.push({ type: 'pause', durationMs });

    lastIndex = match.index + match[0].length;
  }

  const remainingText = text.substring(lastIndex);
  if (remainingText.trim().length > 0) {
    segments.push({ type: 'speech', text: remainingText });
  }

  return segments.length > 0 ? segments : [{ type: 'speech', text }];
}

/**
 * Applies user-defined custom pronunciation rules to text
 */
export function applyPronunciationOverrides(text: string, rules: PronunciationRule[]): string {
  let processed = text;
  const activeRules = rules.filter(r => r.enabled && r.original.trim().length > 0);

  for (const rule of activeRules) {
    const flags = rule.caseSensitive ? 'g' : 'gi';
    const escaped = rule.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, flags);
    processed = processed.replace(regex, rule.replacement);
  }

  return processed;
}

/**
 * Calculates estimated audio duration in seconds based on character/word count and speed
 */
export function estimateAudioDuration(text: string, speedMultiplier: number = 1.0): number {
  if (!text || text.trim().length === 0) return 0;

  const cleanText = text.replace(/\[pause:[^\]]+\]/g, ' ').trim();
  if (cleanText.length === 0) return 0;

  // Check if text has non-Latin/Indic/Asian characters (e.g., Hindi, Chinese, Japanese)
  const isNonLatin = /[\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(cleanText);
  
  let baseSeconds = 0;
  if (isNonLatin) {
    // Non-Latin/Indic speaking rate: ~12-14 characters per second
    baseSeconds = cleanText.length / 13;
  } else {
    // English/Latin speaking rate: ~2.6 words per second
    const words = cleanText.split(/\s+/).filter(Boolean).length;
    baseSeconds = Math.max(1, words / 2.6);
  }

  const speed = Math.max(0.5, Math.min(2.0, speedMultiplier));
  const duration = baseSeconds / speed;

  // Add parsed pause durations
  const pauseSegments = parseTextWithPauses(text).filter(s => s.type === 'pause');
  const totalPauseSec = pauseSegments.reduce((acc, s) => acc + (s.durationMs || 0) / 1000, 0);

  return Math.max(1.5, Math.round((duration + totalPauseSec) * 10) / 10);
}

/**
 * Generates realistic audio waveform peak data (0 to 100) for visualizer
 */
export function generateWaveformPeaks(length: number = 60, seedString: string = ''): number[] {
  const peaks: number[] = [];
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed + seedString.charCodeAt(i) * 31) % 1000;
  }

  for (let i = 0; i < length; i++) {
    const sinWave = Math.sin((i / length) * Math.PI * 3 + seed);
    const noise = Math.sin(i * 12.34 + seed) * 0.3;
    const envelope = Math.sin((i / length) * Math.PI); // tapering ends
    const rawPeak = Math.abs(sinWave * 0.7 + noise * 0.3) * envelope;
    const normalized = Math.max(12, Math.min(100, Math.floor(rawPeak * 90 + 15)));
    peaks.push(normalized);
  }

  return peaks;
}

/**
 * Formats seconds into MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats date to relative or human-readable format
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Recently';
  }
}

/**
 * Emotion tone parameters for Speech Synthesis & DSP
 */
export function getEmotionParameters(tone: EmotionTone): { pitchMod: number; rateMod: number; resonance: number } {
  switch (tone) {
    case 'happy':
      return { pitchMod: 1.15, rateMod: 1.08, resonance: 1.2 };
    case 'excited':
      return { pitchMod: 1.25, rateMod: 1.2, resonance: 1.4 };
    case 'sad':
      return { pitchMod: 0.85, rateMod: 0.85, resonance: 0.8 };
    case 'serious':
      return { pitchMod: 0.92, rateMod: 0.95, resonance: 1.0 };
    case 'calm':
      return { pitchMod: 0.95, rateMod: 0.85, resonance: 0.9 };
    case 'neutral':
    default:
      return { pitchMod: 1.0, rateMod: 1.0, resonance: 1.0 };
  }
}
