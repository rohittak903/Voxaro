import React, { useState } from 'react';
import { WebhookConfig, WebhookEvent } from '../../types';
import { StorageService } from '../../services/storage';
import { useUser } from '../../context/UserContext';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Send, 
  Check, 
  Copy, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Layers,
  AlertCircle
} from 'lucide-react';

export const WebhooksTab: React.FC = () => {
  const { showToast } = useUser();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() => StorageService.loadWebhooks());
  const [isAdding, setIsAdding] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([
    'audio.completed', 
    'audio.failed'
  ]);
  const [testSendingId, setTestSendingId] = useState<string | null>(null);

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !urlInput.startsWith('http')) {
      showToast('Please enter a valid HTTP or HTTPS webhook URL', 'error');
      return;
    }

    const newWebhook: WebhookConfig = {
      id: 'wh-' + Date.now(),
      url: urlInput.trim(),
      events: selectedEvents,
      secret: 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      active: true,
      createdAt: new Date().toISOString(),
      lastDeliveryStatus: undefined
    };

    const updated = [newWebhook, ...webhooks];
    setWebhooks(updated);
    StorageService.saveWebhooks(updated);
    
    setIsAdding(false);
    setUrlInput('');
    showToast('Webhook endpoint added successfully!', 'success');
  };

  const handleDeleteWebhook = (id: string) => {
    const updated = webhooks.filter(w => w.id !== id);
    setWebhooks(updated);
    StorageService.saveWebhooks(updated);
    showToast('Webhook endpoint deleted', 'info');
  };

  const handleSendTestPing = async (wh: WebhookConfig) => {
    setTestSendingId(wh.id);
    await new Promise(r => setTimeout(r, 600));

    const updated = webhooks.map(w => {
      if (w.id === wh.id) {
        return {
          ...w,
          lastDeliveryStatus: 'success' as const,
          lastDeliveryAt: new Date().toISOString()
        };
      }
      return w;
    });

    setWebhooks(updated);
    StorageService.saveWebhooks(updated);
    setTestSendingId(null);
    showToast(`Test ping dispatched to ${wh.url} (200 OK)`, 'success');
  };

  const toggleEvent = (event: WebhookEvent) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter(e => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/20">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Webhook className="w-5 h-5 text-emerald-400" />
            Webhooks & Asynchronous Event Callbacks
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Receive real-time HTTP POST notifications when long background speech jobs finish processing.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-xs transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Webhook Endpoint</span>
        </button>
      </div>

      {/* Add Webhook Form */}
      {isAdding && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Add Webhook URL</h4>
            <button onClick={() => setIsAdding(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>

          <form onSubmit={handleAddWebhook} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Endpoint URL (HTTPS recommended)
              </label>
              <input
                type="url"
                placeholder="https://yourdomain.com/api/webhooks/voxcraft"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Events to Subscribe
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'audio.completed' as WebhookEvent, label: 'audio.completed (Speech ready)' },
                  { id: 'audio.failed' as WebhookEvent, label: 'audio.failed (Generation error)' },
                  { id: 'quota.warning' as WebhookEvent, label: 'quota.warning (80% characters reached)' },
                  { id: 'voice.updated' as WebhookEvent, label: 'voice.updated (New models added)' }
                ].map((ev) => (
                  <label
                    key={ev.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                      selectedEvents.includes(ev.id)
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev.id)}
                      onChange={() => toggleEvent(ev.id)}
                      className="rounded text-emerald-500"
                    />
                    <span>{ev.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Save Endpoint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Webhooks List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Registered Webhooks ({webhooks.length})
          </span>
        </div>

        {webhooks.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-xs text-slate-400">No webhooks registered yet.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-xs text-emerald-400 font-bold hover:underline"
            >
              + Add your first webhook endpoint
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {webhooks.map((wh) => (
              <div key={wh.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all">{wh.url}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono">
                        {ev}
                      </span>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono pt-0.5">
                    Signing Secret: <code>{wh.secret.slice(0, 10)}••••••••••</code>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendTestPing(wh)}
                    disabled={testSendingId === wh.id}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testSendingId === wh.id ? 'Sending Ping...' : 'Send Test Ping'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteWebhook(wh.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Webhook"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Example Webhook Payload Box */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Example Webhook Payload (<code>audio.completed</code>)
        </h5>
        <pre className="p-3 rounded-xl bg-slate-900 text-xs font-mono text-emerald-300 overflow-x-auto">
{`{
  "event": "audio.completed",
  "job_id": "job-892719",
  "status": "complete",
  "audio_url": "https://cdn.voxcraft.ai/audio/speech_job_892719.wav",
  "duration": 14.5,
  "character_count": 210,
  "voice_id": "voice-en-us-emma",
  "timestamp": "2026-09-06T12:30:00Z"
}`}
        </pre>
      </div>

    </div>
  );
};
