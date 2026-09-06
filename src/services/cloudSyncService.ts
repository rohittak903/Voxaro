import { GenerationJob, UserProfile, InvoiceRecord, PronunciationRule, AuthUser, PlanType } from '../types';
import { StorageService } from './storage';

export interface AccountSyncPayload {
  email: string;
  name?: string;
  avatarUrl?: string;
  plan?: PlanType;
  charactersUsedThisMonth?: number;
  favorites?: string[];
  customPronunciations?: PronunciationRule[];
  history?: GenerationJob[];
  invoices?: InvoiceRecord[];
  lastSyncedAt?: string;
}

const SYNC_BUS_NAME = 'voxaro_sync_channel';

export class CloudSyncService {
  private static broadcastChannel: BroadcastChannel | null = typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(SYNC_BUS_NAME)
    : null;

  private static syncDebounceTimer: any = null;

  /**
   * Pulls the latest cloud account state from the server for the given user email
   */
  static async fetchCloudAccount(email: string): Promise<AccountSyncPayload | null> {
    if (!email) return null;
    try {
      const res = await fetch(`/api/sync?email=${encodeURIComponent(email.toLowerCase().trim())}`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as AccountSyncPayload;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch cloud account state (offline mode)', err);
      return null;
    }
  }

  /**
   * Pushes updated account details to the serverless cloud sync backend
   */
  static async pushCloudAccount(payload: AccountSyncPayload): Promise<boolean> {
    if (!payload.email) return false;
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return false;
      const json = await res.json();
      
      // Notify other tabs on this device
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'CLOUD_SYNC_UPDATED',
          email: payload.email,
          data: payload,
          timestamp: Date.now()
        });
      }

      return json.success === true;
    } catch (err) {
      console.warn('Failed to push cloud account sync update', err);
      return false;
    }
  }

  /**
   * Schedules a debounced background sync push (e.g. after generating audio or changing settings)
   */
  static queueDebouncedSync(email: string, partial: Partial<AccountSyncPayload>): void {
    if (!email) return;
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }

    this.syncDebounceTimer = setTimeout(async () => {
      const currentProfile = StorageService.getUserProfile();
      const currentHistory = StorageService.loadHistory();
      const currentInvoices = StorageService.loadInvoices();

      const fullPayload: AccountSyncPayload = {
        email: email.toLowerCase().trim(),
        name: currentProfile.name,
        avatarUrl: currentProfile.avatarUrl,
        plan: currentProfile.plan,
        charactersUsedThisMonth: currentProfile.charactersUsedThisMonth,
        favorites: currentProfile.favorites,
        customPronunciations: currentProfile.customPronunciations,
        history: currentHistory,
        invoices: currentInvoices,
        ...partial
      };

      await this.pushCloudAccount(fullPayload);
    }, 1200);
  }

  /**
   * Called when a user logs in on ANY device:
   * Merges cloud profile & history with local storage so everything is identical
   */
  static async syncOnLogin(
    authUser: AuthUser, 
    onSynced?: (mergedProfile: UserProfile, mergedHistory: GenerationJob[]) => void
  ): Promise<{ profile: UserProfile; history: GenerationJob[] }> {
    const email = authUser.email.toLowerCase().trim();
    const cloudData = await this.fetchCloudAccount(email);
    const localProfile = StorageService.getUserProfile();
    const localHistory = StorageService.loadHistory();

    if (cloudData) {
      // 1. Merge Profile details
      const mergedProfile: UserProfile = {
        ...localProfile,
        id: authUser.id || localProfile.id,
        name: cloudData.name || authUser.name || localProfile.name,
        email: email,
        avatarUrl: cloudData.avatarUrl || authUser.avatarUrl || localProfile.avatarUrl,
        plan: cloudData.plan || localProfile.plan || 'free',
        charactersUsedThisMonth: cloudData.charactersUsedThisMonth !== undefined 
          ? cloudData.charactersUsedThisMonth 
          : localProfile.charactersUsedThisMonth,
        favorites: Array.from(new Set([...(cloudData.favorites || []), ...(localProfile.favorites || [])])),
        customPronunciations: cloudData.customPronunciations && cloudData.customPronunciations.length > 0
          ? cloudData.customPronunciations
          : localProfile.customPronunciations
      };

      // 2. Merge History items without duplicates
      const historyMap = new Map<string, GenerationJob>();
      (cloudData.history || []).forEach(j => {
        if (j && j.id) historyMap.set(j.id, j);
      });
      localHistory.forEach(j => {
        if (j && j.id) historyMap.set(j.id, j);
      });

      const mergedHistory = Array.from(historyMap.values())
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      // 3. Save merged state to localStorage
      StorageService.saveUserProfile(mergedProfile);
      StorageService.saveHistory(mergedHistory);

      if (cloudData.invoices && cloudData.invoices.length > 0) {
        StorageService.saveInvoices(cloudData.invoices);
      }

      // 4. Push combined state back to ensure cloud is 100% up-to-date
      this.pushCloudAccount({
        email,
        name: mergedProfile.name,
        avatarUrl: mergedProfile.avatarUrl,
        plan: mergedProfile.plan,
        charactersUsedThisMonth: mergedProfile.charactersUsedThisMonth,
        favorites: mergedProfile.favorites,
        customPronunciations: mergedProfile.customPronunciations,
        history: mergedHistory,
        invoices: StorageService.loadInvoices()
      });

      onSynced?.(mergedProfile, mergedHistory);
      return { profile: mergedProfile, history: mergedHistory };
    } else {
      // New cloud account or first time on cloud: upload initial state
      const initialPayload: AccountSyncPayload = {
        email,
        name: authUser.name || localProfile.name,
        avatarUrl: authUser.avatarUrl || localProfile.avatarUrl,
        plan: localProfile.plan || 'free',
        charactersUsedThisMonth: localProfile.charactersUsedThisMonth || 0,
        favorites: localProfile.favorites,
        customPronunciations: localProfile.customPronunciations,
        history: localHistory,
        invoices: StorageService.loadInvoices()
      };

      await this.pushCloudAccount(initialPayload);
      onSynced?.(localProfile, localHistory);
      return { profile: localProfile, history: localHistory };
    }
  }

  /**
   * Subscribe to cross-device and cross-tab sync events
   */
  static subscribeToSyncEvents(callback: (event: any) => void): () => void {
    if (!this.broadcastChannel) {
      return () => {};
    }

    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'CLOUD_SYNC_UPDATED') {
        callback(e.data);
      }
    };

    this.broadcastChannel.addEventListener('message', handler);
    return () => {
      this.broadcastChannel?.removeEventListener('message', handler);
    };
  }
}
