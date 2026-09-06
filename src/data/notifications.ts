import { NotificationItem, FeatureAnnouncement } from '../types';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-api-release',
    title: '🚀 Developer API & Embed Widget Live!',
    description: 'Integrate text-to-speech directly into any website with 1 line of embed code or connect via our REST API in Python, JS, and cURL.',
    type: 'feature',
    timestamp: new Date().toISOString(),
    read: false,
    badge: 'NEW',
    actionLabel: 'Explore API & Widget',
    actionView: 'api'
  },
  {
    id: 'notif-indic-voices',
    title: '🌐 Hindi & 10+ Indic Voices Added',
    description: 'Ultra-natural Hindi (Kavya, Rohit), Tamil, and regional voices with character-synchronized waveform playback are now available.',
    type: 'feature',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
    badge: 'VOICES',
    actionLabel: 'Browse Voice Library',
    actionView: 'library'
  },
  {
    id: 'notif-razorpay-live',
    title: '💳 Razorpay Instant Payments Enabled',
    description: 'Upgrade your studio plan securely via UPI (Google Pay, PhonePe, Paytm), Netbanking, and Credit/Debit Cards.',
    type: 'billing',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    read: false,
    badge: 'PAYMENT',
    actionLabel: 'View Plans',
    actionView: 'pricing'
  },
  {
    id: 'notif-waveform-scrub',
    title: '🎛️ Real-Time Waveform Scrubbing',
    description: 'Click anywhere on the visual audio waveform canvas to immediately jump and seek in your generated speech.',
    type: 'tip',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: true,
    actionLabel: 'Open Studio Editor',
    actionView: 'editor'
  }
];

export const LATEST_RELEASE: FeatureAnnouncement = {
  id: 'rel-1-1-0',
  version: 'v1.1.0',
  title: "What's New in Voxaro AI Studio",
  subtitle: 'Developer API, Razorpay Integration & Natural Indic Voices',
  releaseDate: 'September 2026',
  tag: 'MAJOR RELEASE',
  gradient: 'from-indigo-600 via-purple-600 to-pink-600',
  features: [
    {
      icon: 'Code2',
      title: 'Developer REST API & Drop-in Widget',
      description: 'Generate API keys, test in live Swagger playground, and copy 1-line HTML embed scripts for WordPress and React.',
      actionLabel: 'API Portal',
      actionView: 'api'
    },
    {
      icon: 'CreditCard',
      title: 'Razorpay Instant Payments & Billing',
      description: 'Pay via UPI, Cards, and Netbanking with instant character balance unlocks and downloadable invoice receipts.',
      actionLabel: 'Upgrade Plan',
      actionView: 'pricing'
    },
    {
      icon: 'Languages',
      title: 'Accurate Indic Speech Synthesis',
      description: 'Expanded support for Hindi, Tamil, and Asian languages with synchronized duration estimation and phonetics.',
      actionLabel: 'Voice Library',
      actionView: 'library'
    },
    {
      icon: 'Sliders',
      title: 'Interactive Guided Walkthrough',
      description: 'Step-by-step spotlight tutorial to help creators master custom pause markers, pitch adjustments, and WAV export.'
    }
  ]
};
