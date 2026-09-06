# VoxCraft AI — Text-to-Speech & AI Voice Generator

> **Production-grade AI Voice Synthesis & Text-to-Speech Platform built with React 18, TypeScript, Tailwind CSS, and Web Audio API DSP Engine.**

---

## 🌟 Overview

**VoxCraft AI** is a professional text-to-speech (TTS) studio application designed based on the **v1.0 Product Requirements Document (PRD)**. It converts written text into lifelike speech across 25+ diverse voices and 15+ languages, with real-time waveform visualization, speed/pitch/tone modulation, pause insertion, and direct lossless WAV / MP3 file export.

---

## 🚀 Features & PRD Compliance Checklist

### 1. Text Input & Processing Module (FR-1.1 – FR-1.4)
- [x] **5,000 Max Character Text Editor**: Dynamic character counter with color-coded warning limits.
- [x] **File Import / Parser**: Drag & drop support for `.txt`, `.docx`, `.pdf`, and `.md` files with direct text extraction.
- [x] **Input Validation & Sanitization**: Empty input rejection, auto-trim, and safety checks.
- [x] **Auto-Save Drafts**: Automatic background saving to `localStorage` every 5 seconds with timestamp status.

### 2. Voice Library & Customization Module (FR-2.1 – FR-3.5)
- [x] **25+ AI Voices across 15+ Languages**: English (US, UK, AU, IN), Spanish, French, German, Hindi, Japanese, Italian, Portuguese, Mandarin, etc.
- [x] **Comprehensive Filtering**: Filter by Language, Gender (Male, Female, Non-Binary), Style (Conversational, Narration, Commercial, News, Calm, Audiobook), and Favorites.
- [x] **Sample Audio Previews**: Instant 3-second voice preview on every voice card.
- [x] **Speed Control Slider**: Smooth 0.5x – 2.0x playback rate adjustment.
- [x] **Pitch Control Slider**: -10 to +10 semitone pitch shift modulation.
- [x] **Emotion / Tone Selector**: Neutral, Happy, Excited, Serious, Calm, Melancholy.
- [x] **Manual Pause Insertion**: 1-click toolbar for `[pause:0.5s]`, `[pause:1s]`, and `[pause:2s]` tags.
- [x] **Custom Pronunciation Dictionary**: Phonetic replacement engine for acronyms and special terms.

### 3. Generation & Waveform Playback Module (FR-4.1 – FR-4.4)
- [x] **Generation Pipeline**: Real-time progress bar with live stage feedback and ETA calculation.
- [x] **Interactive Canvas Waveform Player**: Play, pause, scrub/seek, volume control, loop mode, and variable playback speeds (0.75x, 1x, 1.25x, 1.5x, 2x).
- [x] **Zero-Error Handling**: Toast notification system with clear recovery paths.

### 4. Audio Export & Sharing Module (FR-5.1 – FR-5.4)
- [x] **Real Audio File Exporter**: Built-in 16-bit PCM WAV and 320kbps MP3 encoders for direct file downloads.
- [x] **Share Modal**: Copy direct link, download HTML embed snippet, or trigger native mobile Web Share.

### 5. History & Quota Tracking (FR-6.1 – FR-6.4)
- [x] **Generation History**: List past jobs with inline audio players, re-edit in editor, download, and delete.
- [x] **Monthly Quota Meter**: Visual usage bar tracking characters used vs tier allowance.

### 6. Monetization & Subscription Tiers (FR-7.1 – FR-7.3)
- [x] **Tier System**: Free Tier (10k chars/mo), Creator Studio ($15/mo), Pro Enterprise ($39/mo).
- [x] **Simulated Stripe Checkout**: Interactive modal with instant tier upgrades and feature unlocks.

### 7. UI/UX & Responsive Design (Section 8)
- [x] **Indigo (#4F46E5) & Emerald (#10B981) Palette**: Clean cards with 12px radius and dark/light mode toggle.
- [x] **Mobile Responsive Mode**: Dedicated bottom navigation tabs for iOS & Android viewports.
- [x] **3-Step Onboarding Tour**: Walkthrough modal for new users.
- [x] **Multi-Language Localization**: English, Spanish, French, German, and Hindi.

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🏗️ Technical Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Audio Synthesis**: Web Speech API + Web Audio API OfflineAudioContext DSP Engine
- **Audio Encoding**: Client-side 16-bit PCM WAV & MP3 Blob generation
- **State & Storage**: React Context + LocalStorage persistence
- **Parsers**: Custom OpenXML / PDF stream text extractor & SSML pause regex parser
