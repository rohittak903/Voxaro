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

function getSanitizedTopic(email: string): string {
  // Safe alphanumeric topic hash
  let hash = 0;
  const str = email.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const clean = str.replace(/[^a-zA-Z0-9]/g, '_');
  return `vx_sync_${clean.slice(0, 20)}_${Math.abs(hash)}`;
}

export class CloudSyncService {
  private static broadcastChannel: BroadcastChannel | null = typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel(SYNC_BUS_NAME)
    : null;

  private static syncDebounceTimer: any = null;
  private static activeEventSource: EventSource | null = null;
  private static pollingInterval: any = null;

  /**
   * Pulls the latest cloud account state across all active devices
   */
  static async fetchCloudAccount(email: string): Promise<AccountSyncPayload | null> {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try local serverless endpoint
    try {
      const res = await fetch(`/api/sync?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as AccountSyncPayload;
        }
      }
    } catch (err) {}

    // 2. Direct Cloud Topic Fallback
    try {
      const topic = getSanitizedTopic(cleanEmail);
      const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n').filter(Boolean);
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const item = JSON.parse(lines[i]);
            if (item.event === 'message' && item.message) {
              const data = JSON.parse(item.message);
              if (data && data.email) return data;
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Direct cloud topic fallback fetch error', err);
    }

    return null;
  }

  /**
   * Pushes updated account details to the serverless sync backend & global topic
   */
  static async pushCloudAccount(payload: AccountSyncPayload): Promise<boolean> {
    if (!payload.email) return false;
    const cleanEmail = payload.email.toLowerCase().trim();
    payload.email = cleanEmail;
    payload.lastSyncedAt = new Date().toISOString();

    let success = false;

    // 1. Push to /api/sync
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) success = true;
      }
    } catch (err) {}

    // 2. Relay directly to ntfy cloud topic for instant cross-device wakeup
    try {
      const topic = getSanitizedTopic(cleanEmail);
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Title': 'Voxaro Sync',
          'Tags': 'sync'
        },
        body: JSON.stringify(payload)
      });
      success = true;
    } catch (err) {}

    // 3. Notify other tabs on this device via BroadcastChannel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'CLOUD_SYNC_UPDATED',
        email: cleanEmail,
        data: payload,
        timestamp: Date.now()
      });
    }

    return success;
  }

  /**
   * Schedules a debounced background sync push
   */
  static queueDebouncedSync(email: string, partial: Partial<AccountSyncPayload>): void {
    if (!email) return;
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }

    this.syncDebounceTimer = setTimeout(async () => {
      const cleanEmail = email.toLowerCase().trim();
      const currentProfile = StorageService.getUserProfile(cleanEmail);
      const currentHistory = StorageService.loadHistory(cleanEmail);
      const currentInvoices = StorageService.loadInvoices();

      const fullPayload: AccountSyncPayload = {
        email: cleanEmail,
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
    }, 1000);
  }

  /**
   * Called on login OR on initial app mount:
   * Merges cloud profile & history with local storage so credits, plan, and history match 100% across devices
   */
  static async syncOnLogin(
    authUser: AuthUser, 
    onSynced?: (mergedProfile: UserProfile, mergedHistory: GenerationJob[]) => void
  ): Promise<{ profile: UserProfile; history: GenerationJob[] }> {
    const email = authUser.email.toLowerCase().trim();
    const cloudData = await this.fetchCloudAccount(email);
    const localProfile = StorageService.getUserProfile(email);
    const localHistory = StorageService.loadHistory(email);

    if (cloudData) {
      // 1. Merge Profile details (prefer cloud if updated)
      const mergedProfile: UserProfile = {
        ...localProfile,
        id: authUser.id || localProfile.id,
        name: cloudData.name || authUser.name || localProfile.name,
        email: email,
        avatarUrl: cloudData.avatarUrl || authUser.avatarUrl || localProfile.avatarUrl,
        plan: cloudData.plan || localProfile.plan || 'free',
        charactersUsedThisMonth: cloudData.charactersUsedThisMonth !== undefined 
          ? Math.max(cloudData.charactersUsedThisMonth, localProfile.charactersUsedThisMonth || 0)
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
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 100);

      // 3. Save merged state to account-scoped local storage
      StorageService.saveUserProfile(mergedProfile, email);
      StorageService.saveHistory(mergedHistory, email);

      if (cloudData.invoices && cloudData.invoices.length > 0) {
        StorageService.saveInvoices(cloudData.invoices);
      }

      onSynced?.(mergedProfile, mergedHistory);
      return { profile: mergedProfile, history: mergedHistory };
    } else {
      // First time on cloud: publish current local state
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
   * Starts live background synchronization across active devices via SSE + periodic polling
   */
  static startLiveDeviceSync(
    email: string, 
    onSyncUpdate: (synced: AccountSyncPayload) => void
  ): () => void {
    if (!email) return () => {};
    const cleanEmail = email.toLowerCase().trim();
    const topic = getSanitizedTopic(cleanEmail);

    // 1. Setup SSE stream
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        if (this.activeEventSource) {
          this.activeEventSource.close();
        }
        const es = new EventSource(`https://ntfy.sh/${topic}/sse`);
        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'message' && data.message) {
              const payload = JSON.parse(data.message) as AccountSyncPayload;
              if (payload && payload.email === cleanEmail) {
                onSyncUpdate(payload);
              }
            }
          } catch {}
        };
        this.activeEventSource = es;
      }
    } catch (e) {}

    // 2. Periodic background poll every 10s or when window regains focus
    const handlePoll = async () => {
      const data = await this.fetchCloudAccount(cleanEmail);
      if (data) {
        onSyncUpdate(data);
      }
    };

    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = setInterval(handlePoll, 10000);

    const handleFocus = () => handlePoll();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (this.activeEventSource) {
        this.activeEventSource.close();
        this.activeEventSource = null;
      }
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      window.removeEventListener('focus', handleFocus);
    };
  }

  /**
   * Subscribe to local cross-tab sync events
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
