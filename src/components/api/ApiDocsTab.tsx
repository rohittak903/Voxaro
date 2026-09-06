import React, { useState } from 'react';
import { API_ENDPOINTS, ApiEndpointDoc, ApiService } from '../../services/apiService';
import { StorageService } from '../../services/storage';
import { useUser } from '../../context/UserContext';
import { VOICES } from '../../data/voices';
import { 
  Terminal, 
  Send, 
  Copy, 
  Check, 
  Play, 
  Volume2, 
  Clock, 
  Code, 
  Layers, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ApiDocsTab: React.FC = () => {
  const { showToast } = useUser();
  const keys = StorageService.loadApiKeys();
  const defaultKey = keys.find(k => k.status === 'active')?.key || 'vx_live_demo_key_abcdef123456';

  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDoc>(API_ENDPOINTS[0]);
  const [selectedLang, setSelectedLang] = useState<'curl' | 'javascript' | 'nodejs' | 'python' | 'php' | 'go'>('curl');
  
  // Try It Out form states
  const [apiKeyInput, setApiKeyInput] = useState<string>(defaultKey);
  const [requestBodyText, setRequestBodyText] = useState<string>(
    JSON.stringify(API_ENDPOINTS[0].sampleRequestBody, null, 2)
  );
  
  // Execution response state
  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleEndpointSelect = (endpoint: ApiEndpointDoc) => {
    setSelectedEndpoint(endpoint);
    setRequestBodyText(JSON.stringify(endpoint.sampleRequestBody || {}, null, 2));
    setResponseResult(null);
  };

  const handleCopySnippet = () => {
    let parsedBody = undefined;
    try {
      if (selectedEndpoint.method === 'POST' && requestBodyText) {
        parsedBody = JSON.parse(requestBodyText);
      }
    } catch {}

    const snippet = ApiService.getCodeSnippet(selectedLang, selectedEndpoint, apiKeyInput, parsedBody);
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    showToast('Code snippet copied to clipboard', 'success');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleSendLiveRequest = async () => {
    setIsLoading(true);
    setResponseResult(null);

    let parsedBody: Record<string, any> = {};
    if (selectedEndpoint.method === 'POST') {
      try {
        parsedBody = JSON.parse(requestBodyText);
      } catch (e) {
        showToast('Invalid JSON in Request Body', 'error');
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await ApiService.executePlaygroundRequest(
        selectedEndpoint,
        apiKeyInput,
        parsedBody
      );
      setResponseResult(res);

      // If success, update the usage metrics on the active API key!
      if (res.statusCode === 200) {
        const allKeys = StorageService.loadApiKeys();
        const matchedKey = allKeys.find(k => k.key === apiKeyInput);
        if (matchedKey) {
          matchedKey.requestsCount = (matchedKey.requestsCount || 0) + 1;
          matchedKey.lastUsedAt = new Date().toISOString();
          if (parsedBody.text) {
            matchedKey.charsProcessed = (matchedKey.charsProcessed || 0) + parsedBody.text.length;
          }
          StorageService.saveApiKeys(allKeys);
        }
      }

      showToast(`API Response: ${res.statusCode} ${res.statusText}`, res.statusCode === 200 ? 'success' : 'error');
    } catch (err: any) {
      showToast(err?.message || 'API request execution failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  let parsedBodyForSnippet = undefined;
  try {
    if (selectedEndpoint.method === 'POST' && requestBodyText) {
      parsedBodyForSnippet = JSON.parse(requestBodyText);
    }
  } catch {}

  const activeSnippet = ApiService.getCodeSnippet(
    selectedLang,
    selectedEndpoint,
    apiKeyInput,
    parsedBodyForSnippet
  );

  return (
    <div className="space-y-6">
      
      {/* Endpoints Navigator Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-slate-800">
        {API_ENDPOINTS.map((ep) => (
          <button
            key={ep.id}
            onClick={() => handleEndpointSelect(ep)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              selectedEndpoint.id === ep.id
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold ${
              ep.method === 'POST' 
                ? 'bg-emerald-500/20 text-emerald-300' 
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {ep.method}
            </span>
            <span>{ep.name}</span>
          </button>
        ))}
      </div>

      {/* Main Endpoint Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Endpoint Specs & Live Playground (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Endpoint Header Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black uppercase ${
                selectedEndpoint.method === 'POST' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {selectedEndpoint.method}
              </span>
              <code className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                {selectedEndpoint.path}
              </code>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedEndpoint.description}
            </p>
          </div>

          {/* Live Request Playground */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-primary-500" />
                Live API Playground ("Try It Out")
              </h4>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Ready to execute
              </span>
            </div>

            {/* API Key Header Input & Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Authorization Header (API Key)
                </label>
                {keys.length > 0 && (
                  <select
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    value={keys.some(k => k.key === apiKeyInput) ? apiKeyInput : ''}
                    className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-0.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="" disabled>Select a saved key...</option>
                    {keys.map(k => (
                      <option key={k.id} value={k.key}>
                        {k.name} ({k.environment})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="vx_live_..."
                className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            {/* Request Body JSON Editor for POST */}
            {selectedEndpoint.method === 'POST' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Request Body (JSON)
                  </label>
                  <button
                    type="button"
                    onClick={() => setRequestBodyText(JSON.stringify(selectedEndpoint.sampleRequestBody, null, 2))}
                    className="text-[11px] text-primary-400 hover:underline"
                  >
                    Reset to Default
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  className="w-full p-3 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-emerald-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
            )}

            {/* Execute Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSendLiveRequest}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white flex items-center gap-2 shadow-sm shadow-primary-500/20 transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Response Result Card */}
          {responseResult && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    responseResult.statusCode === 200 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {responseResult.statusCode} {responseResult.statusText}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {responseResult.responseTimeMs} ms
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">HTTP/1.1</span>
              </div>

              {/* Play Audio Bar if generated */}
              {responseResult.playableAudioUrl && (
                <div className="p-3 rounded-xl bg-primary-950/40 border border-primary-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-primary-400" />
                    <span className="text-xs font-semibold text-white">Generated Audio Clip ({responseResult.data.duration}s)</span>
                  </div>
                  <audio controls src={responseResult.playableAudioUrl} className="h-7 max-w-[220px]" />
                </div>
              )}

              {/* Response JSON */}
              <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto max-h-64">
                {JSON.stringify(responseResult.data, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Right Col: Code Snippets in cURL, JS, Node, Python, PHP (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md">
            
            {/* Language Selector Bar */}
            <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1">
                {(['curl', 'javascript', 'nodejs', 'python', 'php', 'go'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                      selectedLang === lang
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'javascript' ? 'JS' : lang}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopySnippet}
                className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1 shrink-0 transition-colors"
                title="Copy code snippet"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedSnippet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Code Display */}
            <div className="p-4 overflow-x-auto">
              <pre className="font-mono text-xs text-indigo-200 leading-relaxed">
                <code>{activeSnippet}</code>
              </pre>
            </div>
          </div>

          {/* Quick Integration Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Production Best Practices
            </h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside">
              <li>Pass <code>format: "wav"</code> or <code>"mp3"</code> depending on audio bandwidth needs.</li>
              <li>Use standard ISO language voice IDs (e.g. <code>voice-en-us-emma</code>, <code>voice-hi-in-kavya</code>).</li>
              <li>Include pause markers like <code>[pause:1s]</code> in your text payload to introduce custom pauses.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
