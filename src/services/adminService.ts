import { AdminUserItem, AdminTransactionItem, AdminVoiceOverride, NotificationItem, PlanType, AppView } from '../types';
import { StorageService } from './storage';
import { VOICES } from '../data/voices';

const STORAGE_KEYS = {
  ADMIN_USERS: 'voxcraft_admin_users',
  ADMIN_TRANSACTIONS: 'voxcraft_admin_transactions',
  VOICE_OVERRIDES: 'voxcraft_voice_overrides'
};

const INITIAL_USERS: AdminUserItem[] = [
  {
    id: 'usr-001',
    name: 'Sarah Jenkins',
    email: 'sarah.podcast@gmail.com',
    role: 'user',
    plan: 'pro',
    charactersUsedThisMonth: 148500,
    monthlyLimit: 500000,
    status: 'active',
    provider: 'google',
    joinedAt: '2026-08-14T10:30:00Z',
    lastActiveAt: '2026-09-06T11:45:00Z',
    totalGenerations: 64
  },
  {
    id: 'usr-002',
    name: 'Vikram Sharma',
    email: 'vikram.tech@outlook.com',
    role: 'user',
    plan: 'creator',
    charactersUsedThisMonth: 82400,
    monthlyLimit: 100000,
    status: 'active',
    provider: 'email',
    joinedAt: '2026-08-20T14:15:00Z',
    lastActiveAt: '2026-09-06T09:20:00Z',
    totalGenerations: 41
  },
  {
    id: 'usr-003',
    name: 'Elena Vance',
    email: 'elena@novamedia.co',
    role: 'super_admin',
    plan: 'pro',
    charactersUsedThisMonth: 34200,
    monthlyLimit: 500000,
    status: 'active',
    provider: 'github',
    joinedAt: '2026-07-01T08:00:00Z',
    lastActiveAt: '2026-09-06T13:00:00Z',
    totalGenerations: 182
  },
  {
    id: 'usr-004',
    name: 'Rajesh Patel',
    email: 'rajesh.marketing@gmail.com',
    role: 'user',
    plan: 'free',
    charactersUsedThisMonth: 9800,
    monthlyLimit: 10000,
    status: 'active',
    provider: 'google',
    joinedAt: '2026-09-01T16:20:00Z',
    lastActiveAt: '2026-09-05T18:10:00Z',
    totalGenerations: 12
  }
];

const INITIAL_TRANSACTIONS: AdminTransactionItem[] = [
  {
    id: 'tx-001',
    invoiceNumber: 'INV-2026-8941',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.podcast@gmail.com',
    plan: 'pro',
    amountInr: 2999,
    paymentMethod: 'razorpay_upi',
    paymentId: 'pay_rzp_9jK2mN8vX4q',
    date: '2026-09-06T11:40:00Z',
    status: 'paid'
  },
  {
    id: 'tx-002',
    invoiceNumber: 'INV-2026-8940',
    customerName: 'Vikram Sharma',
    customerEmail: 'vikram.tech@outlook.com',
    plan: 'creator',
    amountInr: 1199,
    paymentMethod: 'razorpay_card',
    paymentId: 'pay_rzp_8hG5tY2wB1z',
    date: '2026-09-05T16:20:00Z',
    status: 'paid'
  },
  {
    id: 'tx-003',
    invoiceNumber: 'INV-2026-8939',
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun@edulearn.in',
    plan: 'pro',
    amountInr: 28790, // Annual
    paymentMethod: 'razorpay_netbanking',
    paymentId: 'pay_rzp_7fD4rE9qC3m',
    date: '2026-09-04T10:15:00Z',
    status: 'paid'
  },
  {
    id: 'tx-004',
    invoiceNumber: 'INV-2026-8938',
    customerName: 'David Miller',
    customerEmail: 'david@acme.io',
    plan: 'creator',
    amountInr: 1199,
    paymentMethod: 'razorpay_upi',
    paymentId: 'pay_rzp_6bV3xW8pA2k',
    date: '2026-09-03T14:50:00Z',
    status: 'paid'
  },
  {
    id: 'tx-005',
    invoiceNumber: 'INV-2026-8937',
    customerName: 'Priya Sundaram',
    customerEmail: 'priya.s@gmail.com',
    plan: 'creator',
    amountInr: 1199,
    paymentMethod: 'razorpay_card',
    paymentId: 'pay_rzp_5nM2qL7vJ9x',
    date: '2026-09-02T09:30:00Z',
    status: 'refunded'
  }
];

export class AdminService {
  // --- USERS MANAGEMENT ---
  static getUsers(): AdminUserItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: AdminUserItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save admin users', e);
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

  // --- TRANSACTIONS & REVENUE ---
  static getTransactions(): AdminTransactionItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_TRANSACTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        return INITIAL_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TRANSACTIONS;
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
    const mrr = paidTxs.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).reduce((acc, t) => acc + t.amountInr, 0);

    const users = this.getUsers();
    const activeSubs = users.filter(u => u.plan !== 'free' && u.status === 'active').length;

    return {
      totalRevenueInr: totalRevenue,
      mrrInr: mrr || 34187,
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
