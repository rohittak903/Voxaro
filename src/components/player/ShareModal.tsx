import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUser } from '../../context/UserContext';
import { Share2, Copy, Check, Code, Globe, X } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { currentJob, showShareModal, setShowShareModal } = useAudio();
  const { showToast } = useUser();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!showShareModal || !currentJob) return null;

  const shareUrl = `${window.location.origin}/#share=${currentJob.id}`;
  const embedCode = `<iframe src="${shareUrl}&embed=true" width="100%" height="160" frameborder="0" allow="autoplay"></iframe>`;

  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2500);
      }
      showToast('Copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `VoxCraft AI Voiceover - ${currentJob.voice.name}`,
          text: currentJob.inputText.slice(0, 100),
          url: shareUrl,
        });
      } catch (e) {
        // User dismissed
      }
    } else {
      copyToClipboard(shareUrl, 'link');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setShowShareModal(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Share Voiceover</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Share direct audio link or embed player into websites</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          
          {/* Direct Link */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-primary-500" /> Direct Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 select-all font-mono"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, 'link')}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-500" /> HTML Embed Player
            </label>
            <div className="relative">
              <textarea
                readOnly
                rows={3}
                value={embedCode}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-mono resize-none"
              />
              <button
                onClick={() => copyToClipboard(embedCode, 'embed')}
                className="absolute bottom-3 right-3 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1 shadow-xs"
              >
                {copiedEmbed ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEmbed ? 'Copied' : 'Copy Embed'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Native Mobile Share Button */}
        <button
          onClick={handleNativeShare}
          className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>More Share Options</span>
        </button>

      </div>
    </div>
  );
};
