/**
 * VoxCraft AI — Drop-in Website Voice Widget
 * Embed voice synthesis & read-aloud playback directly on any website.
 * Version: 1.0.0
 */
(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.VoxCraftWidgetLoaded) return;
  window.VoxCraftWidgetLoaded = true;

  class VoxCraftWidget {
    constructor() {
      this.isPlaying = false;
      this.utterance = null;
      this.synth = window.speechSynthesis;
      this.config = this.readConfig();
      this.init();
    }

    readConfig() {
      const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
      const container = document.getElementById('voxcraft-player');

      return {
        theme: container?.getAttribute('data-theme') || scriptTag?.getAttribute('data-theme') || 'auto',
        accentColor: container?.getAttribute('data-accent') || scriptTag?.getAttribute('data-accent') || '#6366f1',
        position: container?.getAttribute('data-position') || scriptTag?.getAttribute('data-position') || 'bottom-right',
        layout: container?.getAttribute('data-layout') || scriptTag?.getAttribute('data-layout') || (container ? 'inline' : 'floating'),
        buttonText: container?.getAttribute('data-text') || scriptTag?.getAttribute('data-text') || 'Listen to Article (AI Voice)',
        voiceId: container?.getAttribute('data-voice') || scriptTag?.getAttribute('data-voice') || 'en-US',
        targetSelector: container?.getAttribute('data-target') || scriptTag?.getAttribute('data-target') || 'article, .post-content, main, body',
        autoPlay: container?.getAttribute('data-autoplay') === 'true' || scriptTag?.getAttribute('data-autoplay') === 'true'
      };
    }

    extractArticleText() {
      const selectors = this.config.targetSelector.split(',').map(s => s.trim());
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          // Clone and remove scripts, styles, navs
          const clone = el.cloneNode(true);
          const removeSelectors = 'script, style, nav, footer, header, .no-speech, aside, button';
          clone.querySelectorAll(removeSelectors).forEach(n => n.remove());
          const text = clone.innerText || clone.textContent || '';
          if (text.trim().length > 30) {
            return text.trim();
          }
        }
      }
      return document.body.innerText.slice(0, 3000);
    }

    injectStyles() {
      const styleId = 'voxcraft-widget-styles';
      if (document.getElementById(styleId)) return;

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .voxcraft-container {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          z-index: 999999;
          box-sizing: border-box;
          line-height: 1.4;
        }
        .voxcraft-floating {
          position: fixed;
          bottom: 24px;
          right: 24px;
        }
        .voxcraft-floating-left {
          position: fixed;
          bottom: 24px;
          left: 24px;
        }
        .voxcraft-card {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #0f172a;
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 9999px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.15);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        .voxcraft-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.4);
          border-color: ${this.config.accentColor};
        }
        .voxcraft-play-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${this.config.accentColor};
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
          transition: transform 0.2s;
        }
        .voxcraft-card:hover .voxcraft-play-icon {
          transform: scale(1.08);
        }
        .voxcraft-play-icon svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }
        .voxcraft-info {
          display: flex;
          flex-direction: column;
        }
        .voxcraft-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .voxcraft-subtitle {
          font-size: 11px;
          opacity: 0.7;
        }
        .voxcraft-bars {
          display: flex;
          align-items: center;
          gap: 2.5px;
          height: 16px;
          margin-left: 6px;
        }
        .voxcraft-bar {
          width: 3px;
          height: 6px;
          background: ${this.config.accentColor};
          border-radius: 2px;
          transition: height 0.2s;
        }
        .voxcraft-playing .voxcraft-bar:nth-child(1) { animation: vxBounce 0.6s infinite ease-in-out alternate; }
        .voxcraft-playing .voxcraft-bar:nth-child(2) { animation: vxBounce 0.8s infinite ease-in-out alternate 0.15s; }
        .voxcraft-playing .voxcraft-bar:nth-child(3) { animation: vxBounce 0.7s infinite ease-in-out alternate 0.3s; }
        .voxcraft-playing .voxcraft-bar:nth-child(4) { animation: vxBounce 0.9s infinite ease-in-out alternate 0.1s; }
        @keyframes vxBounce {
          0% { height: 4px; }
          100% { height: 16px; }
        }
      `;
      document.head.appendChild(style);
    }

    render() {
      this.injectStyles();

      let mountPoint = document.getElementById('voxcraft-player');
      const isInline = !!mountPoint;

      if (!mountPoint) {
        mountPoint = document.createElement('div');
        mountPoint.id = 'voxcraft-player-floating';
        document.body.appendChild(mountPoint);
      }

      mountPoint.className = `voxcraft-container ${isInline ? 'voxcraft-inline' : (this.config.position === 'bottom-left' ? 'voxcraft-floating-left' : 'voxcraft-floating')}`;

      mountPoint.innerHTML = `
        <div class="voxcraft-card" id="vx-toggle-btn" role="button" aria-label="${this.config.buttonText}">
          <div class="voxcraft-play-icon" id="vx-play-icon">
            <svg id="vx-svg-play" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
            <svg id="vx-svg-pause" style="display:none;" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          </div>
          <div class="voxcraft-info">
            <span class="voxcraft-title" id="vx-title">${this.config.buttonText}</span>
            <span class="voxcraft-subtitle" id="vx-status">Powered by VoxCraft AI</span>
          </div>
          <div class="voxcraft-bars" id="vx-waveform">
            <div class="voxcraft-bar"></div>
            <div class="voxcraft-bar"></div>
            <div class="voxcraft-bar"></div>
            <div class="voxcraft-bar"></div>
          </div>
        </div>
      `;

      document.getElementById('vx-toggle-btn')?.addEventListener('click', () => this.toggleSpeech());

      if (this.config.autoPlay) {
        setTimeout(() => this.startSpeech(), 1000);
      }
    }

    toggleSpeech() {
      if (this.isPlaying) {
        this.stopSpeech();
      } else {
        this.startSpeech();
      }
    }

    startSpeech() {
      if (!this.synth) {
        alert('Your browser does not support Speech Synthesis.');
        return;
      }

      this.synth.cancel();
      const text = this.extractArticleText();

      if (!text || text.length === 0) {
        alert('No readable article text found on this page.');
        return;
      }

      this.utterance = new SpeechSynthesisUtterance(text);
      
      // Select matching voice
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        const langVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Emma') || v.name.includes('Samantha')));
        if (langVoice) this.utterance.voice = langVoice;
      }

      this.utterance.rate = 1.0;
      this.utterance.pitch = 1.0;

      this.utterance.onstart = () => {
        this.isPlaying = true;
        this.updateUI(true);
      };

      this.utterance.onend = () => {
        this.isPlaying = false;
        this.updateUI(false);
      };

      this.utterance.onerror = () => {
        this.isPlaying = false;
        this.updateUI(false);
      };

      // Prevent garbage collection bug in Chromium
      window.__vxUtterance = this.utterance;
      this.synth.speak(this.utterance);
    }

    stopSpeech() {
      if (this.synth) {
        this.synth.cancel();
      }
      this.isPlaying = false;
      this.updateUI(false);
    }

    updateUI(playing) {
      const card = document.querySelector('.voxcraft-card');
      const playSvg = document.getElementById('vx-svg-play');
      const pauseSvg = document.getElementById('vx-svg-pause');
      const status = document.getElementById('vx-status');

      if (playing) {
        card?.classList.add('voxcraft-playing');
        if (playSvg) playSvg.style.display = 'none';
        if (pauseSvg) pauseSvg.style.display = 'block';
        if (status) status.textContent = 'Speaking article... (Click to Pause)';
      } else {
        card?.classList.remove('voxcraft-playing');
        if (playSvg) playSvg.style.display = 'block';
        if (pauseSvg) pauseSvg.style.display = 'none';
        if (status) status.textContent = 'Powered by VoxCraft AI';
      }
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.render());
      } else {
        this.render();
      }
    }
  }

  // Initialize
  new VoxCraftWidget();
})();
