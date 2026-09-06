import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { downloadAudioFile } from '../../services/audioExporter';
import { AudioSynthesisEngine } from '../../services/audioSynthesizer';
import { Download, Check, Crown, FileAudio, X, Sparkles, Loader2 } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { currentJob, showExportModal, setShowExportModal } = useAudio();
  const { user, planDetails, setShowPricingModal, showToast } = useUser();
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'wav'>(planDetails.wavExport ? 'wav' : 'mp3');
  const [isExporting, setIsExporting] = useState(false);

  if (!showExportModal || !currentJob) return null;

  const handleDownload = async () => {
    if (selectedFormat === 'wav' && !planDetails.wavExport) {
      showToast('Lossless WAV export is available on Creator and Pro plans.', 'warning');
      setShowPricingModal(true);
      return;
    }

    setIsExporting(true);

    try {
      const filename = `voxaro-${currentJob.voice.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${selectedFormat}`;
      
      let blob = currentJob.audioBlob;
      if (!blob || blob.size === 0) {
        const res = await AudioSynthesisEngine.synthesizeJob(
          currentJob.inputText,
          currentJob.voice,
          currentJob.speed || 1.0,
          currentJob.pitch || 0,
          currentJob.tone || 'neutral'
        );
        blob = res.audioBlob;
        currentJob.audioBlob = blob;
        currentJob.audioUrl = res.audioUrl;
      }

      downloadAudioFile(blob, filename);
      showToast(`Downloaded ${filename} successfully!`, 'success');
      setShowExportModal(false);
    } catch (err) {
      console.error('Export failed', err);
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setShowExportModal(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Export Audio File</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Save high-quality voiceover to your device</p>
          </div>
        </div>

        {/* Format Selection Cards */}
        <div className="space-y-3 mb-6">
          
          {/* MP3 Option */}
          <div
            onClick={() => setSelectedFormat('mp3')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              selectedFormat === 'mp3'
                ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                MP3
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">MP3 Format (320 kbps)</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Compressed, universal playback for podcasts & web</p>
              </div>
            </div>
            {selectedFormat === 'mp3' && <Check className="w-5 h-5 text-primary-600" />}
          </div>

          {/* WAV Option */}
          <div
            onClick={() => {
              if (!planDetails.wavExport) {
                setShowPricingModal(true);
              } else {
                setSelectedFormat('wav');
              }
            }}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              selectedFormat === 'wav'
                ? 'border-primary-600 bg-primary-50/40 dark:bg-primary-950/40'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                WAV
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Lossless WAV (44.1 kHz)</p>
                  {!planDetails.wavExport && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Uncompressed studio quality for video editors & DAWs</p>
              </div>
            </div>
            {selectedFormat === 'wav' && <Check className="w-5 h-5 text-primary-600" />}
          </div>

        </div>

        {/* Audio Meta Summary */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 text-xs space-y-1.5 mb-6 text-slate-600 dark:text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Voice:</span>
            <span className="font-semibold">{currentJob.voice.name} ({currentJob.voice.language})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Duration:</span>
            <span className="font-semibold">{currentJob.duration} seconds</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">License:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Commercial / Royalty-Free</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Preparing High-Quality Audio...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download .{selectedFormat.toUpperCase()}</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
