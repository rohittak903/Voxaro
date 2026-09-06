export type Gender = 'male' | 'female' | 'non-binary';

export type AgeGroup = 'young' | 'adult' | 'senior';

export type VoiceStyle = 
  | 'narration'
  | 'conversational'
  | 'energetic'
  | 'calm'
  | 'audiobook'
  | 'news'
  | 'commercial';

export type EmotionTone = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'serious'
  | 'calm';

export interface Voice {
  id: string;
  name: string;
  gender: Gender;
  language: string;
  langCode: string; // e.g. en-US, es-ES, fr-FR, hi-IN
  accent: string;
  ageGroup: AgeGroup;
  style: VoiceStyle;
  isPremium: boolean;
  avatarColor: string;
  sampleText: string;
  description: string;
  tags: string[];
  nativeVoiceName?: string; // Matching browser speech synthesis voice name if available
}

export type JobStatus = 'idle' | 'queued' | 'processing' | 'complete' | 'failed';

export interface GenerationJob {
  id: string;
  title: string;
  inputText: string;
  processedText: string;
  voiceId: string;
  voice: Voice;
  speed: number;
  pitch: number;
  tone: EmotionTone;
  status: JobStatus;
  audioUrl?: string;
  audioBlob?: Blob;
  duration: number; // in seconds
  characterCount: number;
  format: 'mp3' | 'wav';
  createdAt: string;
  waveformPeaks?: number[];
  error?: string;
}

export interface PronunciationRule {
  id: string;
  original: string;
  replacement: string;
  caseSensitive: boolean;
  enabled: boolean;
}

export type PlanType = 'free' | 'creator' | 'pro';

export interface PlanDetails {
  type: PlanType;
  name: string;
  price: number; // Current discounted / sale price (INR)
  originalPrice?: number; // Original / regular strike-through price (INR)
  discountPercent?: number; // e.g. 40 for 40% OFF
  discountBadge?: string; // e.g. '40% OFF SALE' or 'LAUNCH DEAL'
  saleEndsIn?: string; // Optional countdown or promo tag
  monthlyLimit: number;
  features: string[];
  badgeColor: string;
  wavExport: boolean;
  maxCharactersPerGen: number;
  priorityQueue: boolean;
  allVoices: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: PlanType;
  charactersUsedThisMonth: number;
  favorites: string[]; // voice IDs
  customPronunciations: PronunciationRule[];
  apiKey?: string;
  autoSaveDraft: boolean;
}

export interface PresetSample {
  id: string;
  category: 'Commercial' | 'E-Learning' | 'Podcast' | 'Storytelling' | 'Accessibility' | 'Meditation';
  title: string;
  text: string;
  voiceId: string;
  tone: EmotionTone;
  speed: number;
}

export type LocaleCode = 'en' | 'es' | 'fr' | 'de' | 'hi';

export type AppView = 'editor' | 'library' | 'history' | 'pricing' | 'settings' | 'api' | 'awards';

export interface RealtimeAudioStats {
  totalAudios: number;
  totalCharacters: number;
  totalDurationSeconds: number;
  uniqueVoicesUsed: number;
  uniqueLanguagesUsed: number;
  unlockedAwardsCount: number;
  totalAwardsCount: number;
}

export interface AwardBadge {
  id: string;
  title: string;
  description: string;
  category: 'generation' | 'exploration' | 'studio' | 'account';
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  targetValue: number;
  currentValue: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export type ApiKeyScope = 'full_access' | 'synthesis_only' | 'read_only';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string; // e.g. vx_live_ or vx_test_
  scope: ApiKeyScope;
  environment: 'live' | 'test';
  createdAt: string;
  lastUsedAt: string | null;
  requestsCount: number;
  charsProcessed: number;
  status: 'active' | 'revoked';
}

export type WebhookEvent = 'audio.completed' | 'audio.failed' | 'quota.warning' | 'voice.updated';

export interface WebhookConfig {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastDeliveryStatus?: 'success' | 'failed' | 'pending';
  lastDeliveryAt?: string;
}

export interface WidgetConfig {
  theme: 'dark' | 'light' | 'auto';
  accentColor: string;
  position: 'bottom-right' | 'bottom-left' | 'inline' | 'floating-bar';
  layout: 'button' | 'compact-player' | 'full-player';
  voiceId: string;
  buttonText: string;
  autoPlay: boolean;
  showSpeedControls: boolean;
  targetSelector: string; // css selector for article text (e.g. 'article', '.post-content', 'body')
}

// Authentication Types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: PlanType;
  provider: 'email' | 'google' | 'github' | 'guest';
  createdAt: string;
}

// Razorpay & Invoices Types
export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  plan: PlanType;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'card';
  paymentId: string;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  receiptUrl?: string;
}

// In-App Notification Types
export type NotificationType = 'feature' | 'system' | 'billing' | 'tip';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  badge?: string;
  actionLabel?: string;
  actionView?: AppView;
  linkUrl?: string;
}

export interface FeatureAnnouncement {
  id: string;
  version: string;
  title: string;
  subtitle: string;
  releaseDate: string;
  tag: string;
  gradient: string;
  features: {
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    actionView?: AppView;
  }[];
}

// Interactive Tour Types
export interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSelector: string; // DOM selector to spotlight
  placement: 'top' | 'bottom' | 'left' | 'right';
  badge?: string;
}

// Super Admin Interfaces
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  charactersUsedThisMonth: number;
  monthlyLimit: number;
  status: 'active' | 'suspended';
  provider: 'email' | 'google' | 'github' | 'guest';
  joinedAt: string;
  lastActiveAt: string;
  totalGenerations: number;
}

export interface AdminTransactionItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  plan: PlanType;
  amountInr: number;
  paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking';
  paymentId: string;
  date: string;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
}

export interface AdminVoiceOverride {
  voiceId: string;
  isActive: boolean;
  isPremium: boolean;
  customSampleUrl?: string;
}



