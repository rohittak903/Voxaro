import React, { useState } from 'react';
import { ApiKeysTab } from './ApiKeysTab';
import { ApiDocsTab } from './ApiDocsTab';
import { WidgetBuilderTab } from './WidgetBuilderTab';
import { WebhooksTab } from './WebhooksTab';
import { StorageService } from '../../services/storage';
import { 
  Key, 
  Terminal, 
  Globe, 
  Webhook, 
  Code2, 
  Sparkles, 
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const ApiPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'keys' | 'docs' | 'widget' | 'webhooks'>('keys');

  const keys = StorageService.loadApiKeys();
  const totalRequests = keys.reduce((acc, k) => acc + (k.requestsCount || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20">
              DEVELOPER PLATFORM
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
              v1.0 REST API
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            API & Website Integrations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Embed text-to-speech directly into your websites, mobile apps, blogs, and backend workflows.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 text-xs self-start md:self-center shadow-xs">
          <div className="px-2 border-r border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">API Keys</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{keys.length} Active</span>
          </div>
          <div className="px-2">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Calls</span>
            <span className="font-extrabold text-primary-500">{totalRequests.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'keys'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Key className="w-4 h-4 text-primary-500" />
          <span>API Keys</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {keys.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'docs'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4 text-indigo-500" />
          <span>REST API & Playground</span>
        </button>

        <button
          onClick={() => setActiveTab('widget')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'widget'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 text-purple-500" />
          <span>Website Widget Builder</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/20 text-indigo-400">
            POPULAR
          </span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'webhooks'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Webhook className="w-4 h-4 text-emerald-500" />
          <span>Webhooks</span>
        </button>
      </div>

      {/* Render Active Sub-Tab */}
      <div className="pt-2">
        {activeTab === 'keys' && <ApiKeysTab />}
        {activeTab === 'docs' && <ApiDocsTab />}
        {activeTab === 'widget' && <WidgetBuilderTab />}
        {activeTab === 'webhooks' && <WebhooksTab />}
      </div>

    </div>
  );
};
