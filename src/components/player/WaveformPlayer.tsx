import React, { useRef, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { ExportModal } from './ExportModal';
import { ShareModal } from './ShareModal';
import { formatTime } from '../../utils/helpers';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  Repeat, 
  Sparkles,
  Layers,
  Crown
} from 'lucide-react';

export const WaveformPlayer: React.FC = () => {
  const {
    currentJob,
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
    setShowExportModal,
    setShowShareModal,
  } = useAudio();

  const { t, planDetails } = useUser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const peaks = currentJob?.waveformPeaks || [];
  const currentDuration = duration > 0 ? duration : (currentJob?.duration || 1);
  const progressRatio = Math.min(1, Math.max(0, currentTime / currentDuration));

  // Draw Interactive Canvas Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = 3;
    const barGap = 3;
    const totalBars = Math.floor(width / (barWidth + barGap));
    const step = peaks.length / totalBars;

    for (let i = 0; i < totalBars; i++) {
      const peakIndex = Math.floor(i * step);
      const rawPeak = peaks[peakIndex % peaks.length] || 30;
      
      // Calculate dynamic bar height
      const barHeight = Math.max(6, (rawPeak / 100) * (height - 14));
      const x = i * (barWidth + barGap);
      const y = (height - barHeight) / 2;

      const isPlayed = (x / width) <= progressRatio;

      // Color styling
      if (isPlayed) {
        // Gradient for played progress
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#6366f1');
        grad.addColorStop(1, '#a855f7');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#334155' : '#cbd5e1';
      }

      // Rounded rectangle bars
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    }

    // Draw glowing playhead needle if playing or progress > 0
    const playheadX = Math.min(width - 2, Math.max(0, progressRatio * width));
    ctx.fillStyle = '#a855f7';
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 10;
    ctx.fillRect(Math.max(0, playheadX - 1.5), 0, 3, height);
    ctx.shadowBlur = 0;

  }, [peaks, progressRatio, currentTime, duration, currentDuration]);

  // Click / Drag to seek
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || currentDuration <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(clickRatio * currentDuration);
  };

  if (!currentJob) return null;

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md p-5 space-y-4 animate-fadeIn">
      
      {/* Waveform Player Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${currentJob.voice.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
            {currentJob.voice.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{currentJob.title}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                {currentJob.format.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentJob.voice.name} • {currentJob.tone} tone • {currentJob.characterCount} chars
            </p>
          </div>
        </div>

        {/* Download & Share Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.share}</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-1.5 shadow-sm shadow-primary-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.download}</span>
          </button>
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div className="relative py-2">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-20 cursor-pointer rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60"
        />

        {/* Time Progress Overlay */}
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(currentDuration)}</span>
        </div>
      </div>

      {/* Playback Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        
        {/* Left: Play/Pause, Rewind, Loop */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <button
            onClick={() => seekTo(0)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-xl bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-500/25 transition-all transform active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={toggleLoop}
            className={`p-2 rounded-xl transition-colors ${
              isLooping
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Loop playback"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Playback Speed Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200/80 dark:border-slate-700/60">
          {speedOptions.map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackRate(s)}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                playbackRate === s
                  ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Right: Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.85)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20"
          />
        </div>

      </div>

      <ExportModal />
      <ShareModal />

    </div>
  );
};
