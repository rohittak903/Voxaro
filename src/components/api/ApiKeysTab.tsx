import React, { useState } from 'react';
import { ApiKey, ApiKeyScope } from '../../types';
import { ApiService } from '../../services/apiService';
import { StorageService } from '../../services/storage';
import { useUser } from '../../context/UserContext';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Trash2, 
  ShieldAlert, 
  Terminal, 
  Lock, 
  AlertCircle,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';

export const ApiKeysTab: React.FC = () => {
  const { showToast } = useUser();
  const [keys, setKeys] = useState<ApiKey[]>(() => StorageService.loadApiKeys());
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'test'>('live');
  const [newKeyScope, setNewKeyScope] = useState<ApiKeyScope>('full_access');
  
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [createdKeyModal, setCreatedKeyModal] = useState<ApiKey | null>(null);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('Please enter a descriptive name for your API key', 'error');
      return;
    }

    const created = ApiService.generateApiKey(newKeyName, newKeyEnv, newKeyScope);
    const updated = [created, ...keys];
    setKeys(updated);
    StorageService.saveApiKeys(updated);
    
    setIsCreating(false);
    setNewKeyName('');
    setCreatedKeyModal(created);
    showToast(`API Key "${created.name}" created successfully!`, 'success');
  };

  const handleDeleteKey = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke and delete key "${name}"? Any apps using this key will immediately stop working.`)) {
      const updated = keys.filter(k => k.id !== id);
      setKeys(updated);
      StorageService.saveApiKeys(updated);
      showToast(`Key "${name}" revoked`, 'info');
    }
  };

  const copyKeyToClipboard = (keyStr: string, id: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKeyId(id);
    showToast('API Key copied to clipboard', 'success');
    setTimeout(() => setCopiedKeyId(null), 2500);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeyIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string, isRevealed: boolean) => {
    if (isRevealed) return key;
    const parts = key.split('_');
    const prefix = parts.slice(0, 2).join('_') + '_';
    const rest = parts.slice(2).join('_');
    return prefix + '••••••••••••••••••••' + rest.slice(-4);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary-900/40 via-indigo-900/30 to-purple-900/30 border border-primary-500/20">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-primary-500" />
            Developer API Keys
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authenticate your website or application with Voxaro REST endpoints and SDKs.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-2 shadow-sm shadow-primary-500/20 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Key</span>
        </button>
      </div>

      {/* New Key Creation Form Modal */}
      {isCreating && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-primary-500/30 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Generate API Secret Key
            </h4>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Key Description / App Name
              </label>
              <input
                type="text"
                placeholder="e.g. Production Blog Reader, iOS App Voice Backend"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Environment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv('live')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      newKeyEnv === 'live'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🟢 Live (Production)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv('test')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      newKeyEnv === 'test'
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    🟡 Test (Sandbox)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Permission Scope
                </label>
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value as ApiKeyScope)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="full_access">Full Access (Synthesis, Voices, Usage)</option>
                  <option value="synthesis_only">Synthesis Only (POST /api/v1/tts/generate)</option>
                  <option value="read_only">Read-Only (Voices catalog & usage)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-sm transition-all"
              >
                Generate Key
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Secret Key Modal Shown Immediately After Creation */}
      {createdKeyModal && (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Save your secret API key
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-400">
                Please copy this key and store it securely in your environment variables. It won't be displayed in full again.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400">
            <span className="flex-1 break-all">{createdKeyModal.key}</span>
            <button
              onClick={() => copyKeyToClipboard(createdKeyModal.key, createdKeyModal.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copiedKeyId === createdKeyModal.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKeyId === createdKeyModal.id ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCreatedKeyModal(null)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              I Have Saved This Key
            </button>
          </div>
        </div>
      )}

      {/* Keys List Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Keys ({keys.length})
          </span>
          <span className="text-xs text-slate-400">
            Header: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-primary-400">Authorization: Bearer &lt;key&gt;</code>
          </span>
        </div>

        {keys.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No API Keys Generated</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Generate an API key to connect your website, blog, or application directly to Voxaro text-to-speech services.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white"
            >
              Generate First API Key
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {keys.map((k) => (
              <div key={k.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                
                {/* Key Meta Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{k.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      k.environment === 'live' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    }`}>
                      {k.environment}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {k.scope.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Masked Key Display */}
                  <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                    <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 select-all">
                      {maskKey(k.key, !!revealedKeyIds[k.id])}
                    </span>

                    <button
                      onClick={() => toggleReveal(k.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                      title={revealedKeyIds[k.id] ? 'Hide Key' : 'Reveal Key'}
                    >
                      {revealedKeyIds[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => copyKeyToClipboard(k.key, k.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                      title="Copy Key"
                    >
                      {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Key Usage & Dates */}
                <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                  <div className="text-right hidden sm:block">
                    <div className="font-semibold text-slate-700 dark:text-slate-200">{k.requestsCount} requests</div>
                    <div className="text-[11px] text-slate-400">{k.charsProcessed.toLocaleString()} chars</div>
                  </div>

                  <div className="text-right hidden md:block">
                    <div className="text-[11px]">Created {new Date(k.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-500">
                      {k.lastUsedAt ? `Used ${new Date(k.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteKey(k.id, k.name)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Revoke & Delete Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Best Practices Callout */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200">Security Recommendation</span>
          <p>
            Keep your API keys secret. Never commit API keys directly to public GitHub repositories or client-side frontends. For public websites, use the drop-in <strong>Website Widget</strong> or proxy requests via your backend server.
          </p>
        </div>
      </div>

    </div>
  );
};
