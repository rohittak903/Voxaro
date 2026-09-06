import React from 'react';
import { GenerationJob } from '../../types';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { formatDate, formatTime } from '../../utils/helpers';
import { downloadAudioFile } from '../../services/audioExporter';
import { Play, Pause, Trash2, Edit3, Download, Share2, Sparkles, Volume2 } from 'lucide-react';

interface HistoryCardProps {
  job: GenerationJob;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ job }) => {
  const { 
    currentJob, 
    setCurrentJob, 
    isPlaying, 
    togglePlay, 
    deleteHistoryItem, 
    loadJobIntoEditor, 
    setShowExportModal 
  } = useAudio();
  const { setCurrentView, showToast } = useUser();

  const isCurrentActive = currentJob?.id === job.id;
  const isPlayingThis = isCurrentActive && isPlaying;

  const handlePlayToggle = () => {
    if (!isCurrentActive) {
      setCurrentJob(job);
    }
    togglePlay();
  };

  const handleLoadToEditor = () => {
    loadJobIntoEditor(job);
    setCurrentView('editor');
  };

  const handleDownload = () => {
    if (job.audioBlob) {
      downloadAudioFile(job.audioBlob, `voxaro-${job.voice.name.toLowerCase().replace(/\s+/g, '-')}-${job.id}.${job.format}`);
      showToast('Download started', 'success');
    } else if (job.audioUrl) {
      const link = document.createElement('a');
      link.href = job.audioUrl;
      link.download = `voxaro-${job.voice.name.toLowerCase().replace(/\s+/g, '-')}-${job.id}.${job.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Download started', 'success');
    } else {
      showToast('Audio file not cached locally', 'warning');
    }
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
      isCurrentActive
        ? 'bg-primary-50/40 dark:bg-primary-950/30 border-primary-400 shadow-sm'
        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
    }`}>
      
      {/* Left: Play button + Meta */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        
        {/* Play / Pause Toggle Button */}
        <button
          onClick={handlePlayToggle}
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
            isPlayingThis
              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary-100 dark:hover:bg-primary-950/80 hover:text-primary-600'
          }`}
          title={isPlayingThis ? 'Pause' : 'Play audio'}
        >
          {isPlayingThis ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {job.title}
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
              {job.format}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1.5">
            "{job.inputText}"
          </p>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {job.voice.name} ({job.voice.language})
            </span>
            <span>•</span>
            <span>{job.duration}s</span>
            <span>•</span>
            <span>{job.characterCount} chars</span>
            <span>•</span>
            <span>{formatDate(job.createdAt)}</span>
          </div>
        </div>

      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 self-end sm:self-center">
        
        {/* Re-edit */}
        <button
          onClick={handleLoadToEditor}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition-colors"
          title="Load into Studio Editor"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
          title="Download audio file"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={() => deleteHistoryItem(job.id)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Delete from history"
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
