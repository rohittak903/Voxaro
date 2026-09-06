import { AdminUserItem, AdminTransactionItem, AdminVoiceOverride, NotificationItem, PlanType, AppView, UserProfile, AuthUser } from '../types';
import { StorageService } from './storage';
import { VOICES } from '../data/voices';

const STORAGE_KEYS = {
  ADMIN_USERS: 'voxaro_real_admin_users',
  ADMIN_TRANSACTIONS: 'voxaro_real_admin_transactions',
  VOICE_OVERRIDES: 'voxaro_real_voice_overrides'
};

const ROOT_SUPER_ADMIN: AdminUserItem = {
  id: 'usr-admin-root',
  name: 'Super Administrator',
  email: 'admin@voxaro.ai',
  role: 'super_admin',
  plan: 'pro',
  charactersUsedThisMonth: 0,
  monthlyLimit: 500000,
  status: 'active',
  provider: 'email',
  joinedAt: '2026-09-01T00:00:00Z',
  lastActiveAt: new Date().toISOString(),
  totalGenerations: 0
};

export class AdminService {
  // --- USERS MANAGEMENT (100% REAL-TIME) ---
  static getUsers(): AdminUserItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
      if (!data) {
        // Initialize with super admin and current active app user if present
        const initialUsers: AdminUserItem[] = [ROOT_SUPER_ADMIN];
        
        try {
          const currentProfile = StorageService.getUserProfile();
          const authUser = StorageService.loadAuthUser();
          const history = StorageService.loadHistory();
          
          if (authUser && authUser.email !== 'admin@voxaro.ai') {
            initialUsers.push({
              id: authUser.id || 'usr-live-01',
              name: authUser.name || currentProfile.name,
              email: authUser.email,
              role: 'user',
              plan: currentProfile.plan || 'free',
              charactersUsedThisMonth: currentProfile.charactersUsedThisMonth || 0,
              monthlyLimit: currentProfile.plan === 'pro' ? 500000 : (currentProfile.plan === 'creator' ? 100000 : 10000),
              status: 'active',
              provider: authUser.provider || 'google',
              joinedAt: authUser.createdAt || new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
              totalGenerations: history.length
            });
          }
        } catch {}

        localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(initialUsers));
        return initialUsers;
      }
      return JSON.parse(data);
    } catch {
      return [ROOT_SUPER_ADMIN];
    }
  }

  static saveUsers(users: AdminUserItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save admin users', e);
    }
  }

  /**
   * Automatically syncs real users from the application in real-time
   */
  static syncUserFromApp(profile: UserProfile, authUser: AuthUser | null, generationsCount?: number): void {
    try {
      const users = this.getUsers();
      const email = authUser?.email || profile.email;
      if (!email || email === 'admin@voxaro.ai') return;

      const existingIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      const now = new Date().toISOString();
      const genCount = generationsCount !== undefined ? generationsCount : StorageService.loadHistory().length;

      if (existingIndex >= 0) {
        users[existingIndex] = {
          ...users[existingIndex],
          name: profile.name || authUser?.name || users[existingIndex].name,
          plan: profile.plan,
          charactersUsedThisMonth: profile.charactersUsedThisMonth,
          provider: authUser?.provider || users[existingIndex].provider,
          lastActiveAt: now,
          totalGenerations: Math.max(users[existingIndex].totalGenerations, genCount)
        };
      } else {
        users.push({
          id: authUser?.id || profile.id || 'usr-' + Date.now(),
          name: profile.name || authUser?.name || 'Studio Creator',
          email,
          role: 'user',
          plan: profile.plan,
          charactersUsedThisMonth: profile.charactersUsedThisMonth,
          monthlyLimit: profile.plan === 'pro' ? 500000 : (profile.plan === 'creator' ? 100000 : 10000),
          status: 'active',
          provider: authUser?.provider || 'google',
          joinedAt: authUser?.createdAt || now,
          lastActiveAt: now,
          totalGenerations: genCount
        });
      }

      this.saveUsers(users);
    } catch (e) {
      console.warn('Failed to sync user to admin registry', e);
    }
  }

  static updateUserPlan(userId: string, plan: PlanType): AdminUserItem[] {
    const limits: Record<PlanType, number> = { free: 10000, creator: 100000, pro: 500000 };
    const users = this.getUsers().map(u => {
      if (u.id === userId) {
        return { ...u, plan, monthlyLimit: limits[plan] };
      }
      return u;
    });
    this.saveUsers(users);
    return users;
  }

  static updateUserQuota(userId: string, addCredits: number): AdminUserItem[] {
    const users = this.getUsers().map(u => {
      if (u.id === userId) {
        return { ...u, monthlyLimit: u.monthlyLimit + addCredits };
      }
      return u;
    });
    this.saveUsers(users);
    return users;
  }

  static toggleUserStatus(userId: string): AdminUserItem[] {
    const users = this.getUsers().map(u => {
      if (u.id === userId) {
        return { ...u, status: (u.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended' };
      }
      return u;
    });
    this.saveUsers(users);
    return users;
  }

  static deleteUser(userId: string): AdminUserItem[] {
    const users = this.getUsers().filter(u => u.id !== userId && u.id !== 'usr-admin-root');
    this.saveUsers(users);
    return users;
  }

  // --- TRANSACTIONS & REVENUE (100% REAL-TIME) ---
  static getTransactions(): AdminTransactionItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_TRANSACTIONS);
      if (!data) {
        // Real-time: start with empty transactions list (0 fake data)
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static recordRealTransaction(tx: AdminTransactionItem): void {
    try {
      const existing = this.getTransactions();
      const updated = [tx, ...existing.filter(item => item.id !== tx.id)];
      localStorage.setItem(STORAGE_KEYS.ADMIN_TRANSACTIONS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to record real transaction in admin service', e);
    }
  }

  static getFinancialMetrics(): {
    totalRevenueInr: number;
    mrrInr: number;
    paidOrdersCount: number;
    activeSubscribersCount: number;
    avgOrderValueInr: number;
  } {
    const transactions = this.getTransactions();
    const paidTxs = transactions.filter(t => t.status === 'paid');
    const totalRevenue = paidTxs.reduce((acc, t) => acc + t.amountInr, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const mrr = paidTxs
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amountInr, 0);

    const users = this.getUsers();
    const activeSubs = users.filter(u => u.plan !== 'free' && u.status === 'active').length;

    return {
      totalRevenueInr: totalRevenue,
      mrrInr: mrr,
      paidOrdersCount: paidTxs.length,
      activeSubscribersCount: activeSubs,
      avgOrderValueInr: paidTxs.length > 0 ? Math.round(totalRevenue / paidTxs.length) : 0
    };
  }

  // --- VOICE CATALOG OVERRIDES ---
  static getVoiceOverrides(): Record<string, AdminVoiceOverride> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOICE_OVERRIDES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static toggleVoiceActive(voiceId: string): Record<string, AdminVoiceOverride> {
    const overrides = this.getVoiceOverrides();
    const current = overrides[voiceId] || { voiceId, isActive: true, isPremium: false };
    overrides[voiceId] = { ...current, isActive: !current.isActive };
    localStorage.setItem(STORAGE_KEYS.VOICE_OVERRIDES, JSON.stringify(overrides));
    return overrides;
  }

  static toggleVoicePremium(voiceId: string): Record<string, AdminVoiceOverride> {
    const overrides = this.getVoiceOverrides();
    const current = overrides[voiceId] || { voiceId, isActive: true, isPremium: false };
    overrides[voiceId] = { ...current, isPremium: !current.isPremium };
    localStorage.setItem(STORAGE_KEYS.VOICE_OVERRIDES, JSON.stringify(overrides));
    return overrides;
  }

  // --- BROADCAST ANNOUNCEMENT DISPATCHER ---
  static broadcastAnnouncement(payload: {
    title: string;
    description: string;
    type: 'feature' | 'system' | 'billing' | 'tip';
    badge?: string;
    actionLabel?: string;
    actionView?: AppView;
  }): NotificationItem {
    const newNotif: NotificationItem = {
      id: 'notif-bc-' + Date.now(),
      title: payload.title.trim(),
      description: payload.description.trim(),
      type: payload.type,
      timestamp: new Date().toISOString(),
      read: false,
      badge: payload.badge?.trim() || 'BROADCAST',
      actionLabel: payload.actionLabel?.trim(),
      actionView: payload.actionView
    };

    const existingNotifs = StorageService.loadNotifications();
    const updated = [newNotif, ...existingNotifs];
    StorageService.saveNotifications(updated);

    return newNotif;
  }
}
