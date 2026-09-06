import { GenerationJob, UserProfile, PronunciationRule, PlanType } from '../types';

const STORAGE_KEYS = {
  DRAFT_TEXT: 'voxcraft_draft_text',
  DRAFT_VOICE_ID: 'voxcraft_draft_voice_id',
  DRAFT_SETTINGS: 'voxcraft_draft_settings',
  HISTORY: 'voxcraft_generation_history',
  USER_PROFILE: 'voxcraft_user_profile',
  THEME: 'voxcraft_theme',
  LOCALE: 'voxcraft_locale',
  FAVORITES: 'voxcraft_favorites',
  PRONUNCIATIONS: 'voxcraft_pronunciations',
  ONBOARDING_COMPLETED: 'voxcraft_onboarding_done',
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-default-01',
  name: 'Voxaro Creator',
  email: 'creator@voxaro.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  plan: 'free',
  charactersUsedThisMonth: 0,
  favorites: ['voice-en-us-emma', 'voice-en-us-ava'],
  customPronunciations: [
    { id: 'rule-1', original: 'AI', replacement: 'A.I.', caseSensitive: false, enabled: true },
    { id: 'rule-2', original: 'TTS', replacement: 'Text to Speech', caseSensitive: false, enabled: true },
    { id: 'rule-3', original: 'SaaS', replacement: 'Sass', caseSensitive: false, enabled: true }
  ],
  autoSaveDraft: true,
};

export const StorageService = {
  // Drafts
  saveDraft(text: string, voiceId?: string, settings?: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT_TEXT, text);
      if (voiceId) localStorage.setItem(STORAGE_KEYS.DRAFT_VOICE_ID, voiceId);
      if (settings) localStorage.setItem(STORAGE_KEYS.DRAFT_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save draft to localStorage', e);
    }
  },

  loadDraft(): { text: string; voiceId: string | null; settings: any | null } {
    try {
      return {
        text: localStorage.getItem(STORAGE_KEYS.DRAFT_TEXT) || '',
        voiceId: localStorage.getItem(STORAGE_KEYS.DRAFT_VOICE_ID),
        settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFT_SETTINGS) || 'null'),
      };
    } catch {
      return { text: '', voiceId: null, settings: null };
    }
  },

  // History
  saveHistory(jobs: GenerationJob[]): void {
    try {
      // Store metadata without bloated raw blobs to keep localStorage light and fast
      const serializableJobs = jobs.map(j => ({
        ...j,
        audioBlob: undefined // Blobs reconstructed or stored separately
      }));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(serializableJobs.slice(0, 100)));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  },

  loadHistory(): GenerationJob[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  // User Profile
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (!data) {
        this.saveUserProfile(DEFAULT_USER);
        return DEFAULT_USER;
      }
      return { ...DEFAULT_USER, ...JSON.parse(data) };
    } catch {
      return DEFAULT_USER;
    }
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  },

  updatePlan(plan: PlanType): UserProfile {
    const current = this.getUserProfile();
    const updated = { ...current, plan };
    this.saveUserProfile(updated);
    return updated;
  },

  incrementUsage(characters: number): UserProfile {
    const current = this.getUserProfile();
    const updated = {
      ...current,
      charactersUsedThisMonth: current.charactersUsedThisMonth + characters
    };
    this.saveUserProfile(updated);
    return updated;
  },

  // Favorites
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : DEFAULT_USER.favorites;
    } catch {
      return DEFAULT_USER.favorites;
    }
  },

  toggleFavorite(voiceId: string): string[] {
    const favs = this.getFavorites();
    const index = favs.indexOf(voiceId);
    let updated: string[];
    if (index > -1) {
      updated = favs.filter(id => id !== voiceId);
    } else {
      updated = [...favs, voiceId];
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  },

  // Pronunciations
  getPronunciations(): PronunciationRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRONUNCIATIONS);
      return data ? JSON.parse(data) : DEFAULT_USER.customPronunciations;
    } catch {
      return DEFAULT_USER.customPronunciations;
    }
  },

  savePronunciations(rules: PronunciationRule[]): void {
    localStorage.setItem(STORAGE_KEYS.PRONUNCIATIONS, JSON.stringify(rules));
  },

  // Onboarding
  isOnboardingCompleted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
  },

  setOnboardingCompleted(): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  },

  // API Keys
  loadApiKeys(): import('../types').ApiKey[] {
    try {
      const data = localStorage.getItem('voxcraft_api_keys');
      if (!data) {
        // Initial sample key for quick onboarding
        const initialKey: import('../types').ApiKey = {
          id: 'key-default-live',
          name: 'Production Web App',
          key: 'vx_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          prefix: 'vx_live_',
          scope: 'full_access',
          environment: 'live',
          createdAt: new Date().toISOString(),
          lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
          requestsCount: 42,
          charsProcessed: 3840,
          status: 'active'
        };
        this.saveApiKeys([initialKey]);
        return [initialKey];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveApiKeys(keys: import('../types').ApiKey[]): void {
    try {
      localStorage.setItem('voxcraft_api_keys', JSON.stringify(keys));
    } catch (e) {
      console.warn('Failed to save API keys', e);
    }
  },

  // Webhooks
  loadWebhooks(): import('../types').WebhookConfig[] {
    try {
      const data = localStorage.getItem('voxcraft_webhooks');
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveWebhooks(webhooks: import('../types').WebhookConfig[]): void {
    try {
      localStorage.setItem('voxcraft_webhooks', JSON.stringify(webhooks));
    } catch (e) {
      console.warn('Failed to save webhooks', e);
    }
  },

  // Widget Config
  loadWidgetConfig(): import('../types').WidgetConfig {
    const defaultConfig: import('../types').WidgetConfig = {
      theme: 'auto',
      accentColor: '#6366f1',
      position: 'bottom-right',
      layout: 'compact-player',
      voiceId: 'voice-en-us-emma',
      buttonText: 'Listen to Article (AI Voice)',
      autoPlay: false,
      showSpeedControls: true,
      targetSelector: 'article, .post-content, main, body'
    };

    try {
      const data = localStorage.getItem('voxcraft_widget_config');
      if (!data) return defaultConfig;
      return { ...defaultConfig, ...JSON.parse(data) };
    } catch {
      return defaultConfig;
    }
  },

  saveWidgetConfig(config: import('../types').WidgetConfig): void {
    try {
      localStorage.setItem('voxcraft_widget_config', JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save widget config', e);
    }
  },

  // Auth User Session
  loadAuthUser(): import('../types').AuthUser | null {
    try {
      const data = localStorage.getItem('voxcraft_auth_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveAuthUser(user: import('../types').AuthUser): void {
    try {
      localStorage.setItem('voxcraft_auth_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save auth user', e);
    }
  },

  clearAuthUser(): void {
    try {
      localStorage.removeItem('voxcraft_auth_user');
    } catch (e) {
      console.warn('Failed to clear auth user', e);
    }
  },

  // Invoices
  loadInvoices(): import('../types').InvoiceRecord[] {
    try {
      const data = localStorage.getItem('voxcraft_invoices');
      if (!data) {
        // Sample initial invoice for new accounts
        const sampleInvoice: import('../types').InvoiceRecord = {
          id: 'inv-welcome-01',
          invoiceNumber: 'INV-2026-0901',
          plan: 'free',
          planName: 'Free Starter Tier',
          amount: 0,
          currency: 'INR',
          paymentMethod: 'razorpay_upi',
          paymentId: 'pay_free_init_' + Math.random().toString(36).substring(2, 8),
          date: new Date().toISOString(),
          status: 'paid'
        };
        this.saveInvoices([sampleInvoice]);
        return [sampleInvoice];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveInvoices(invoices: import('../types').InvoiceRecord[]): void {
    try {
      localStorage.setItem('voxcraft_invoices', JSON.stringify(invoices));
    } catch (e) {
      console.warn('Failed to save invoices', e);
    }
  },

  addInvoice(invoice: import('../types').InvoiceRecord): void {
    const existing = this.loadInvoices();
    this.saveInvoices([invoice, ...existing]);
  },

  // Notifications
  loadNotifications(): import('../types').NotificationItem[] {
    try {
      const data = localStorage.getItem('voxcraft_notifications');
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveNotifications(items: import('../types').NotificationItem[]): void {
    try {
      localStorage.setItem('voxcraft_notifications', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  },

  // Tour
  isTourCompleted(): boolean {
    return localStorage.getItem('voxcraft_tour_completed') === 'true';
  },

  setTourCompleted(completed: boolean = true): void {
    localStorage.setItem('voxcraft_tour_completed', completed ? 'true' : 'false');
  }
};


