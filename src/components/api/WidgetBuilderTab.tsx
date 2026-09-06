import React, { useState } from 'react';
import { WidgetConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { VOICES } from '../../data/voices';
import { useUser } from '../../context/UserContext';
import { 
  Globe, 
  Copy, 
  Check, 
  Palette, 
  Sliders, 
  Play, 
  Volume2, 
  Code2, 
  Sparkles, 
  ExternalLink,
  Layers,
  Layout
} from 'lucide-react';

export const WidgetBuilderTab: React.FC = () => {
  const { showToast } = useUser();
  const [config, setConfig] = useState<WidgetConfig>(() => StorageService.loadWidgetConfig());
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'react' | 'wordpress'>('script');

  // Preview interactive state
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  const handleConfigChange = (key: keyof WidgetConfig, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    StorageService.saveWidgetConfig(updated);
  };

  const selectedVoice = VOICES.find(v => v.id === config.voiceId) || VOICES[0];

  // Generated Embed Code
  const getEmbedScript = () => {
    return `<!-- Voxaro AI Web Voice Player -->
<div id="voxaro-player" 
  data-theme="${config.theme}"
  data-accent="${config.accentColor}"
  data-voice="${config.voiceId}"
  data-text="${config.buttonText}"
  data-position="${config.position}"
  data-target="${config.targetSelector}">
</div>
<script src="https://voxaro.ai/widget.js" async></script>`;
  };

  const getReactCode = () => {
    return `// React / Next.js Component
import { useEffect } from 'react';

export default function VoxaroAudioReader() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://voxaro.ai/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div 
      id="voxaro-player"
      data-theme="${config.theme}"
      data-accent="${config.accentColor}"
      data-text="${config.buttonText}"
    />
  );
};`;
  };

  const handleCopyCode = () => {
    const code = activeTab === 'react' ? getReactCode() : getEmbedScript();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Embed code copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-pink-950/30 border border-indigo-500/20">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Website "Read Aloud" Audio Widget Builder
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Let visitors listen to your blog articles, news stories, and docs with 1 line of embed code.
          </p>
        </div>

        <a
          href="/demo-widget.html"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-xs transition-all self-start sm:self-center"
        >
          <span>Open Live Demo Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Customizer Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Customize Appearance
            </h4>

            {/* Button Text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Button Label Text
              </label>
              <input
                type="text"
                value={config.buttonText}
                onChange={(e) => handleConfigChange('buttonText', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Accent Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={config.accentColor}
                  onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase"
                />
              </div>
            </div>

            {/* Position */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Widget Layout & Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'bottom-right', label: 'Floating Bottom-Right' },
                  { id: 'bottom-left', label: 'Floating Bottom-Left' },
                  { id: 'inline', label: 'Inline (Inside Article)' },
                  { id: 'floating-bar', label: 'Sticky Top Bar' }
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => handleConfigChange('position', pos.id)}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      config.position === pos.id
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Model */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Default Voice Narrator
              </label>
              <select
                value={config.voiceId}
                onChange={(e) => handleConfigChange('voiceId', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.language} - {v.gender})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Article Text CSS Selector
              </label>
              <input
                type="text"
                value={config.targetSelector}
                onChange={(e) => handleConfigChange('targetSelector', e.target.value)}
                placeholder="article, .post-content, main"
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <p className="text-[10px] text-slate-400">The widget extracts readable text from matching HTML elements.</p>
            </div>

          </div>
        </div>

        {/* Right: Live Interactive Widget Preview & Embed Code (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Live Preview Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Live Widget Interactive Preview
              </span>
              <span className="text-[11px] text-slate-400">Voice: <strong>{selectedVoice.name}</strong></span>
            </div>

            {/* Simulated Web Page Content */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3 relative min-h-[140px]">
              <div className="space-y-1">
                <div className="h-3.5 w-3/4 bg-slate-700/60 rounded"></div>
                <div className="h-2.5 w-1/2 bg-slate-800/60 rounded"></div>
              </div>

              {/* Simulated Rendered Widget Button */}
              <div className="pt-2">
                <div
                  onClick={() => {
                    setIsDemoPlaying(!isDemoPlaying);
                    showToast(isDemoPlaying ? 'Playback paused' : `Now playing with ${selectedVoice.name}`, 'info');
                  }}
                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full cursor-pointer shadow-lg transition-transform transform hover:scale-105"
                  style={{
                    backgroundColor: '#0f172a',
                    border: `1.5px solid ${config.accentColor}`,
                    boxShadow: `0 8px 20px -4px ${config.accentColor}40`
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    {isDemoPlaying ? (
                      <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{config.buttonText}</span>
                    <span className="text-[10px] text-slate-400">
                      {isDemoPlaying ? 'Speaking article...' : 'Powered by Voxaro'}
                    </span>
                  </div>

                  {/* Equalizer animation */}
                  <div className="flex items-center gap-0.5 h-4 ml-1">
                    {[12, 18, 10, 16].map((h, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full transition-all"
                        style={{
                          height: isDemoPlaying ? `${h}px` : '6px',
                          backgroundColor: config.accentColor
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-2">
                Click the preview button above to test interactive toggle.
              </div>
            </div>
          </div>

          {/* Embed Code Snippet Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs space-y-0">
            
            {/* Tab switch */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('script')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'script'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  HTML / WordPress Script
                </button>
                <button
                  onClick={() => setActiveTab('react')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'react'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  React / Next.js
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Embed Code'}</span>
              </button>
            </div>

            {/* Code Box */}
            <div className="p-4 bg-slate-950 overflow-x-auto">
              <pre className="font-mono text-xs text-indigo-300 leading-relaxed">
                <code>{activeTab === 'react' ? getReactCode() : getEmbedScript()}</code>
              </pre>
            </div>
          </div>

          {/* Quick Integration Guides */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-500" />
              Easy Integration Guide
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>WordPress / Ghost / Shopify:</strong> Paste this code snippet into your site's header template, or insert a "Custom HTML" block into your article single post template.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
