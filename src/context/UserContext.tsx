import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppView, AuthUser, InvoiceRecord, LocaleCode, NotificationItem, PlanDetails, PlanType, PronunciationRule, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { AdminService } from '../services/adminService';
import { LOCALES, LocaleStrings } from '../data/locales';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';

export const PLANS: Record<PlanType, PlanDetails> = {
  free: {
    type: 'free',
    name: 'Free Tier',
    price: 0,
    monthlyLimit: 10000,
    features: [
      '10,000 characters / month',
      'Standard AI voices (15+)',
      'MP3 Audio Export',
      'Standard Generation Queue',
      'Watermark-free audio'
    ],
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    wavExport: false,
    maxCharactersPerGen: 1500,
    priorityQueue: false,
    allVoices: false,
  },
  creator: {
    type: 'creator',
    name: 'Creator Studio',
    price: 15,
    monthlyLimit: 100000,
    features: [
      '100,000 characters / month',
      'All 25+ Premium & Neural Voices',
      'MP3 & Lossless WAV Export',
      'Fast Priority Generation',
      'Unlimited History Storage',
      'Commercial Usage License'
    ],
    badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    wavExport: true,
    maxCharactersPerGen: 3000,
    priorityQueue: true,
    allVoices: true,
  },
  pro: {
    type: 'pro',
    name: 'Pro Enterprise',
    price: 39,
    monthlyLimit: 500000,
    features: [
      '500,000 characters / month',
      'Ultra HD Neural Voices',
      'Lossless 48kHz WAV & MP3 Export',
      'Instant Dedicated Processing Queue',
      'Developer API Key Access',
      'Custom Pronunciation Rules Sync',
      'Priority 24/7 Support'
    ],
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    wavExport: true,
    maxCharactersPerGen: 5000,
    priorityQueue: true,
    allVoices: true,
  }
};

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UserContextType {
  user: UserProfile;
  planDetails: PlanDetails;
  currentView: AppView;
  locale: LocaleCode;
  t: LocaleStrings;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
  
  // Auth
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, provider?: 'email' | 'google' | 'github' | 'guest', avatarUrl?: string) => void;
  signup: (email: string, name: string) => void;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;

  // Razorpay Checkout & Invoices
  showPricingModal: boolean;
  showCheckoutModal: boolean;
  checkoutTargetPlan: PlanType;
  invoices: InvoiceRecord[];
  openCheckout: (plan: PlanType) => void;
  setShowCheckoutModal: (show: boolean) => void;

  // Guided Tour
  showOnboardingModal: boolean;
  isTourActive: boolean;
  startTour: () => void;
  endTour: () => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  showWhatsNewModal: boolean;
  setShowWhatsNewModal: (show: boolean) => void;

  // Navigation & Preferences
  setCurrentView: (view: AppView) => void;
  setLocale: (locale: LocaleCode) => void;
  toggleTheme: () => void;
  upgradePlan: (plan: PlanType) => void;
  recordUsage: (chars: number) => boolean;
  toggleFavorite: (voiceId: string) => void;
  isFavorite: (voiceId: string) => boolean;
  updatePronunciations: (rules: PronunciationRule[]) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  setShowPricingModal: (show: boolean) => void;
  setShowOnboardingModal: (show: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => StorageService.loadAuthUser());
  const [currentView, setCurrentView] = useState<AppView>('editor');
  const [locale, setLocaleState] = useState<LocaleCode>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voxcraft_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Modals state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTargetPlan, setCheckoutTargetPlan] = useState<PlanType>('creator');
  const [showOnboardingModal, setShowOnboardingModal] = useState(() => !StorageService.isOnboardingCompleted());
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);

  // Invoices & Notifications & Tour
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => StorageService.loadInvoices());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = StorageService.loadNotifications();
    if (saved && saved.length > 0) return saved;
    StorageService.saveNotifications(INITIAL_NOTIFICATIONS);
    return INITIAL_NOTIFICATIONS;
  });
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('voxcraft_theme', theme);
  }, [theme]);

  // Auth Handlers
  const login = (email: string, name?: string, provider: 'email' | 'google' | 'github' | 'guest' = 'email', avatarUrl?: string) => {
    const displayName = name || email.split('@')[0] || 'Studio Creator';
    const newAuth: AuthUser = {
      id: 'usr-' + Date.now(),
      name: displayName,
      email,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
      plan: user.plan,
      provider,
      createdAt: new Date().toISOString()
    };

    setAuthUser(newAuth);
    StorageService.saveAuthUser(newAuth);

    const updatedProfile: UserProfile = {
      ...user,
      name: displayName,
      email
    };
    setUser(updatedProfile);
    StorageService.saveUserProfile(updatedProfile);

    // Real-time sync with Admin Registry
    AdminService.syncUserFromApp(updatedProfile, newAuth);

    setShowAuthModal(false);
    showToast(`Welcome back, ${displayName}!`, 'success');
  };

  const signup = (email: string, name: string) => {
    login(email, name, 'email');
    showToast('Account created successfully! Enjoy Voxaro.', 'success');
  };

  const logout = () => {
    setAuthUser(null);
    StorageService.clearAuthUser();
    showToast('Signed out successfully.', 'info');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLocale = (newLocale: LocaleCode) => {
    setLocaleState(newLocale);
    localStorage.setItem('voxcraft_locale', newLocale);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openCheckout = (plan: PlanType) => {
    setCheckoutTargetPlan(plan);
    setShowPricingModal(false);
    setShowCheckoutModal(true);
  };

  const upgradePlan = (plan: PlanType) => {
    const updated = StorageService.updatePlan(plan);
    setUser(updated);
    setInvoices(StorageService.loadInvoices());
    AdminService.syncUserFromApp(updated, authUser);
    showToast(`Successfully upgraded to ${PLANS[plan].name}!`, 'success');
    setShowPricingModal(false);
    setShowCheckoutModal(false);
  };

  const recordUsage = (chars: number): boolean => {
    const plan = PLANS[user.plan];
    if (user.charactersUsedThisMonth + chars > plan.monthlyLimit) {
      showToast('Monthly character limit reached! Please upgrade your plan.', 'warning');
      setShowPricingModal(true);
      return false;
    }
    const updated = StorageService.incrementUsage(chars);
    setUser(updated);
    AdminService.syncUserFromApp(updated, authUser);
    return true;
  };

  const toggleFavorite = (voiceId: string) => {
    const updatedFavs = StorageService.toggleFavorite(voiceId);
    setUser(prev => ({ ...prev, favorites: updatedFavs }));
    const isNowFav = updatedFavs.includes(voiceId);
    showToast(isNowFav ? 'Voice added to favorites' : 'Voice removed from favorites', 'info');
  };

  const isFavorite = (voiceId: string) => user.favorites.includes(voiceId);

  const updatePronunciations = (rules: PronunciationRule[]) => {
    StorageService.savePronunciations(rules);
    setUser(prev => ({ ...prev, customPronunciations: rules }));
    showToast('Pronunciation rules updated', 'success');
  };

  // Notifications
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    StorageService.saveNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    StorageService.saveNotifications(updated);
    showToast('All notifications marked as read', 'info');
  };

  // Tour
  const startTour = () => {
    setCurrentView('editor');
    setIsTourActive(true);
    setShowOnboardingModal(false);
  };

  const endTour = () => {
    setIsTourActive(false);
    StorageService.setTourCompleted(true);
  };

  const planDetails = PLANS[user.plan];
  const t = LOCALES[locale] || LOCALES.en;

  return (
    <UserContext.Provider
      value={{
        user,
        planDetails,
        currentView,
        locale,
        t,
        theme,
        toasts,
        authUser,
        isAuthenticated: !!authUser,
        login,
        signup,
        logout,
        showAuthModal,
        setShowAuthModal,
        showPricingModal,
        showCheckoutModal,
        checkoutTargetPlan,
        invoices,
        openCheckout,
        setShowCheckoutModal,
        showOnboardingModal,
        isTourActive,
        startTour,
        endTour,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        markAllNotificationsRead,
        showWhatsNewModal,
        setShowWhatsNewModal,
        setCurrentView,
        setLocale,
        toggleTheme,
        upgradePlan,
        recordUsage,
        toggleFavorite,
        isFavorite,
        updatePronunciations,
        showToast,
        removeToast,
        setShowPricingModal,
        setShowOnboardingModal,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

