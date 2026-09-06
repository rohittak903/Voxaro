import { PresetSample } from '../types';

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'preset-commercial-1',
    category: 'Commercial',
    title: 'Summer Tech Launch Promo',
    text: 'Meet the future of sound. [pause:0.5s] Ultra-crisp audio, intelligent noise cancellation, and all-day battery life. Order yours today at twenty percent off with code SOUND20!',
    voiceId: 'voice-en-us-ava',
    tone: 'excited',
    speed: 1.1
  },
  {
    id: 'preset-podcast-1',
    category: 'Podcast',
    title: 'Tech Horizons Podcast Intro',
    text: 'Welcome to Tech Horizons, the podcast where we dive into artificial intelligence, space exploration, and the ideas shaping our tomorrow. [pause:1s] I am your host, and today we have an extraordinary story for you.',
    voiceId: 'voice-en-us-emma',
    tone: 'neutral',
    speed: 1.0
  },
  {
    id: 'preset-elearning-1',
    category: 'E-Learning',
    title: 'Cloud Architecture Module 1',
    text: 'In this module, we will explore the foundational principles of distributed microservices. [pause:0.5s] Notice how asynchronous event messaging decouples our backend services and improves fault tolerance.',
    voiceId: 'voice-en-in-arav',
    tone: 'serious',
    speed: 0.95
  },
  {
    id: 'preset-story-1',
    category: 'Storytelling',
    title: 'The Whispering Forest (Audiobook)',
    text: 'The ancient clock tower struck midnight. [pause:1.5s] Through the silver mist of the enchanted forest, a mysterious glowing light flickered among the oak branches.',
    voiceId: 'voice-en-us-james',
    tone: 'calm',
    speed: 0.9
  },
  {
    id: 'preset-meditation-1',
    category: 'Meditation',
    title: '5-Minute Mindful Reset',
    text: 'Close your eyes gently. [pause:1s] Allow your shoulders to drop away from your ears. [pause:2s] Breathe in peace and clarity... [pause:2s] and exhale any tension from your day.',
    voiceId: 'voice-en-us-oliver',
    tone: 'calm',
    speed: 0.8
  },
  {
    id: 'preset-accessibility-1',
    category: 'Accessibility',
    title: 'Article Reader & Summary',
    text: 'Daily Digest: Global scientific teams have announced breakthrough developments in fusion energy containment, signaling a major step forward for clean power production.',
    voiceId: 'voice-en-gb-charlotte',
    tone: 'neutral',
    speed: 1.0
  }
];
