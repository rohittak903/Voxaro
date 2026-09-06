import React, { useState } from 'react';
import { AdminService } from '../../services/adminService';
import { StorageService } from '../../services/storage';
import { useUser } from '../../context/UserContext';
import { AppView, NotificationType } from '../../types';
import { 
  Send, 
  Sparkles, 
  Bell, 
  Check, 
  Megaphone, 
  Layers, 
  ExternalLink
} from 'lucide-react';

export const AdminBroadcastTab: React.FC = () => {
  const { showToast } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<NotificationType>('feature');
  const [badge, setBadge] = useState('NEW');
  const [actionLabel, setActionLabel] = useState('');
  const [actionView, setActionView] = useState<AppView | ''>('api');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please provide both Title and Description', 'error');
      return;
    }

    setIsSending(true);
    await new Promise(r => setTimeout(r, 600));

    AdminService.broadcastAnnouncement({
      title,
      description,
      type,
      badge: badge || undefined,
      actionLabel: actionLabel || undefined,
      actionView: actionView ? (actionView as AppView) : undefined
    });

    setIsSending(false);
    setTitle('');
    setDescription('');
    setActionLabel('');
    showToast('🚀 In-app notification broadcasted to all users!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Broadcast Info Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-400" />
            In-App Feature Announcement Broadcaster
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Broadcast instant notifications and feature updates directly to every user's notification bell.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-400 text-xs font-bold self-start sm:self-center">
          Real-Time Sync
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Broadcast Form (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            Compose Announcement
          </h4>

          <form onSubmit={handleBroadcast} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Notification Headline Title
              </label>
              <input
                type="text"
                placeholder="e.g. 🚀 Developer REST API & Embed Widget Live!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Message Body
              </label>
              <textarea
                rows={3}
                placeholder="Explain the new feature, how it helps creators, or any important system update..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            {/* Category & Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notification Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="feature">✨ New Feature</option>
                  <option value="billing">💳 Billing & Quota</option>
                  <option value="tip">💡 Studio Pro Tip</option>
                  <option value="system">⚙️ System Alert</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Badge Tag</label>
                <input
                  type="text"
                  placeholder="e.g. NEW, UPDATE, HOT"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none uppercase"
                />
              </div>
            </div>

            {/* Action Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Action Button Text</label>
                <input
                  type="text"
                  placeholder="e.g. Try Website Widget"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Studio View</label>
                <select
                  value={actionView}
                  onChange={(e) => setActionView(e.target.value as AppView | '')}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="api">API & Integrations</option>
                  <option value="editor">Studio Text Editor</option>
                  <option value="library">AI Voice Library</option>
                  <option value="pricing">Pricing & Upgrades</option>
                  <option value="history">Audio History</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-2 shadow-md shadow-primary-500/25 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <span>Broadcasting to users...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Notification Now</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right: Live Notification Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Live Notification Tray Preview
              </span>
            </div>

            {/* Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[200px]">
                  {title || 'Announcement Title Preview'}
                </span>
                {badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary-500/20 text-primary-300">
                    {badge}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                {description || 'This is how your announcement message will appear in the Notification Bell dropdown for all users across the platform.'}
              </p>

              {actionLabel && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-primary-400 underline flex items-center gap-1">
                    <span>{actionLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Broadcasting delivers instantly without requiring any server rebuild or redeployment.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
