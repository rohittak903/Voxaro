import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppView, AuthUser, InvoiceRecord, LocaleCode, NotificationItem, PlanDetails, PlanType, PronunciationRule, UserProfile } from '../types';
import { StorageService } from '../services/storage';
import { CloudSyncService } from '../services/cloudSyncService';
import { AdminService, DEFAULT_PLAN_CONFIGS } from '../services/adminService';
import { LOCALES, LocaleStrings } from '../data/locales';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';

export const PLANS: Record<PlanType, PlanDetails> = DEFAULT_PLAN_CONFIGS;

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UserContextType {
  user: UserProfile;
  plans: Record<PlanType, PlanDetails>;
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
  const [plans, setPlans] = useState<Record<PlanType, PlanDetails>>(() => AdminService.getPlanConfigs());
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
    // 1. Initial fetch from cloud to guarantee fresh prices on mobile/desktop
    AdminService.fetchLatestPlanConfigs().then(latestPlans => {
      if (latestPlans) setPlans(latestPlans);
    });

    // 2. Local window events listener
    const handlePlansUpdated = () => {
      setPlans(AdminService.getPlanConfigs());
    };
    window.addEventListener('voxaro_plans_updated', handlePlansUpdated);
    window.addEventListener('storage', handlePlansUpdated);

    // 3. Live global cloud plans synchronization (SSE + 10s poll + focus wakeup for mobile)
    const stopGlobalPlansSync = CloudSyncService.startGlobalPlansSync((updatedPlans) => {
      setPlans(updatedPlans);
      localStorage.setItem('voxaro_custom_plans', JSON.stringify(updatedPlans));
    });

    return () => {
      window.removeEventListener('voxaro_plans_updated', handlePlansUpdated);
      window.removeEventListener('storage', handlePlansUpdated);
      stopGlobalPlansSync();
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('voxcraft_theme', theme);
  }, [theme]);

  // Auto-sync on initial mount and listen for Live Multi-Device Sync
  useEffect(() => {
    if (!authUser || !authUser.email) return;

    const email = authUser.email.toLowerCase().trim();

    // 1. Instant pull on startup/refresh
    CloudSyncService.syncOnLogin(authUser, (mergedProfile, mergedHistory) => {
      setUser(mergedProfile);
      window.dispatchEvent(new CustomEvent('voxaro_account_synced', { 
        detail: { profile: mergedProfile, history: mergedHistory, email } 
      }));
    }).then(res => {
      setUser(res.profile);
      window.dispatchEvent(new CustomEvent('voxaro_account_synced', { 
        detail: { profile: res.profile, history: res.history, email } 
      }));
    });

    // 2. Start Live Multi-Device Pub/Sub & Polling
    const stopLiveSync = CloudSyncService.startLiveDeviceSync(email, (syncedData) => {
      if (syncedData) {
        setUser(prev => {
          const updatedUsage = syncedData.charactersUsedThisMonth !== undefined 
            ? syncedData.charactersUsedThisMonth 
            : prev.charactersUsedThisMonth;
          const updatedPlan = syncedData.plan || prev.plan;
          
          return {
            ...prev,
            name: syncedData.name || prev.name,
            avatarUrl: syncedData.avatarUrl || prev.avatarUrl,
            plan: updatedPlan,
            charactersUsedThisMonth: updatedUsage,
            favorites: syncedData.favorites || prev.favorites,
            customPronunciations: syncedData.customPronunciations || prev.customPronunciations
          };
        });

        if (Array.isArray(syncedData.history)) {
          window.dispatchEvent(new CustomEvent('voxaro_account_synced', { 
            detail: { history: syncedData.history, email } 
          }));
        }
      }
    });

    // 3. Local BroadcastChannel cross-tab listener
    const unsubscribeLocal = CloudSyncService.subscribeToSyncEvents((event) => {
      if (event.email && event.email.toLowerCase() === email) {
        const syncedData = event.data;
        if (syncedData) {
          setUser(prev => ({
            ...prev,
            name: syncedData.name || prev.name,
            avatarUrl: syncedData.avatarUrl || prev.avatarUrl,
            plan: syncedData.plan || prev.plan,
            charactersUsedThisMonth: syncedData.charactersUsedThisMonth !== undefined ? syncedData.charactersUsedThisMonth : prev.charactersUsedThisMonth,
            favorites: syncedData.favorites || prev.favorites,
            customPronunciations: syncedData.customPronunciations || prev.customPronunciations
          }));
          if (Array.isArray(syncedData.history)) {
            window.dispatchEvent(new CustomEvent('voxaro_account_synced', { 
              detail: { history: syncedData.history, email } 
            }));
          }
        }
      }
    });

    return () => {
      stopLiveSync();
      unsubscribeLocal();
    };
  }, [authUser?.email]);

  // Auth Handlers
  const login = async (email: string, name?: string, provider: 'email' | 'google' | 'github' | 'guest' = 'email', avatarUrl?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const displayName = name || cleanEmail.split('@')[0] || 'Studio Creator';
    const newAuth: AuthUser = {
      id: 'usr-' + Date.now(),
      name: displayName,
      email: cleanEmail,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
      plan: user.plan,
      provider,
      createdAt: new Date().toISOString()
    };

    setAuthUser(newAuth);
    StorageService.saveAuthUser(newAuth);

    // Initial local profile update
    const updatedProfile: UserProfile = {
      ...user,
      name: displayName,
      email: cleanEmail
    };
    setUser(updatedProfile);
    StorageService.saveUserProfile(updatedProfile);

    // Pull and merge cloud data for this account across devices
    try {
      const syncResult = await CloudSyncService.syncOnLogin(newAuth, (mergedProfile, mergedHistory) => {
        setUser(mergedProfile);
        window.dispatchEvent(new CustomEvent('voxaro_account_synced', { 
          detail: { profile: mergedProfile, history: mergedHistory, email: cleanEmail } 
        }));
      });
      setUser(syncResult.profile);
      window.dispatchEvent(new CustomEvent('voxaro_account_synced', { 
        detail: { profile: syncResult.profile, history: syncResult.history, email: cleanEmail } 
      }));
    } catch (e) {
      console.warn('Sync on login fallback to local profile', e);
    }

    // Real-time sync with Admin Registry
    AdminService.syncUserFromApp(updatedProfile, newAuth);

    setShowAuthModal(false);
    showToast(`Welcome back, ${displayName}! Account synced across devices.`, 'success');
  };

  const signup = (email: string, name: string) => {
    login(email, name, 'email');
    showToast('Account created successfully! Enjoy Voxaro.', 'success');
  };

  const logout = () => {
    const currentEmail = authUser?.email;
    setAuthUser(null);
    StorageService.clearAuthUser();
    
    // Reset to clean unauthenticated state
    const defaultProfile = StorageService.getUserProfile();
    setUser(defaultProfile);

    // Notify AudioContext and UI that user signed out
    window.dispatchEvent(new CustomEvent('voxaro_user_logged_out', { detail: { email: currentEmail } }));
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
    
    if (authUser?.email) {
      CloudSyncService.queueDebouncedSync(authUser.email, { plan: updated.plan });
    }

    const planName = (plans[plan] || DEFAULT_PLAN_CONFIGS[plan]).name;
    showToast(`Successfully upgraded to ${planName}!`, 'success');
    setShowPricingModal(false);
    setShowCheckoutModal(false);
  };

  const recordUsage = (chars: number): boolean => {
    const currentPlan = plans[user.plan] || DEFAULT_PLAN_CONFIGS[user.plan];
    if (user.charactersUsedThisMonth + chars > currentPlan.monthlyLimit) {
      showToast('Monthly character limit reached! Please upgrade your plan.', 'warning');
      setShowPricingModal(true);
      return false;
    }
    const updated = StorageService.incrementUsage(chars);
    setUser(updated);
    AdminService.syncUserFromApp(updated, authUser);

    if (authUser?.email) {
      CloudSyncService.queueDebouncedSync(authUser.email, { 
        charactersUsedThisMonth: updated.charactersUsedThisMonth 
      });
    }

    return true;
  };

  const toggleFavorite = (voiceId: string) => {
    const updatedFavs = StorageService.toggleFavorite(voiceId);
    setUser(prev => ({ ...prev, favorites: updatedFavs }));
    const isNowFav = updatedFavs.includes(voiceId);

    if (authUser?.email) {
      CloudSyncService.queueDebouncedSync(authUser.email, { favorites: updatedFavs });
    }

    showToast(isNowFav ? 'Voice added to favorites' : 'Voice removed from favorites', 'info');
  };

  const isFavorite = (voiceId: string) => user.favorites.includes(voiceId);

  const updatePronunciations = (rules: PronunciationRule[]) => {
    StorageService.savePronunciations(rules);
    setUser(prev => ({ ...prev, customPronunciations: rules }));

    if (authUser?.email) {
      CloudSyncService.queueDebouncedSync(authUser.email, { customPronunciations: rules });
    }

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

  const planDetails = plans[user.plan] || DEFAULT_PLAN_CONFIGS[user.plan];
  const t = LOCALES[locale] || LOCALES.en;

  return (
    <UserContext.Provider
      value={{
        user,
        plans,
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

