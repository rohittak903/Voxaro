import { Voice } from '../types';

export const VOICES: Voice[] = [
  // English (US)
  {
    id: 'voice-en-us-emma',
    name: 'Emma Hayes',
    gender: 'female',
    language: 'English (US)',
    langCode: 'en-US',
    accent: 'American (Standard)',
    ageGroup: 'adult',
    style: 'conversational',
    isPremium: false,
    avatarColor: 'from-pink-500 to-rose-500',
    sampleText: 'Welcome to our platform! Today we are introducing exciting new AI text to speech capabilities.',
    description: 'Warm, clear, and friendly voice ideal for podcasts, explainer videos, and interactive assistants.',
    tags: ['Podcast', 'Explainer', 'Natural', 'Warm']
  },
  {
    id: 'voice-en-us-james',
    name: 'James Sterling',
    gender: 'male',
    language: 'English (US)',
    langCode: 'en-US',
    accent: 'American (Deep)',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: false,
    avatarColor: 'from-blue-600 to-indigo-700',
    sampleText: 'Deep space exploration continues to unveil the greatest mysteries of our expanding universe.',
    description: 'Authoritative, resonant, and cinematic tone perfect for documentaries and audiobooks.',
    tags: ['Documentary', 'Audiobook', 'Authoritative', 'Cinematic']
  },
  {
    id: 'voice-en-us-ava',
    name: 'Ava Martinez',
    gender: 'female',
    language: 'English (US)',
    langCode: 'en-US',
    accent: 'American (Energetic)',
    ageGroup: 'young',
    style: 'commercial',
    isPremium: true,
    avatarColor: 'from-amber-400 to-orange-500',
    sampleText: 'Hurry up! The biggest summer sale of the season is here with up to fifty percent discount on everything!',
    description: 'Vibrant, high-energy, and dynamic delivery crafted for marketing ads and social media clips.',
    tags: ['Promo', 'YouTube', 'TikTok', 'Commercial']
  },
  {
    id: 'voice-en-us-ethan',
    name: 'Ethan Cole',
    gender: 'male',
    language: 'English (US)',
    langCode: 'en-US',
    accent: 'American (Casual)',
    ageGroup: 'young',
    style: 'conversational',
    isPremium: false,
    avatarColor: 'from-cyan-500 to-blue-500',
    sampleText: 'Hey everyone, in this tutorial we are going to build a clean full stack web application from scratch.',
    description: 'Casual, modern, and relatable voice tailored for tech tutorials and gaming commentary.',
    tags: ['Tutorial', 'Tech', 'Casual', 'Vlog']
  },
  {
    id: 'voice-en-us-oliver',
    name: 'Oliver Vance',
    gender: 'male',
    language: 'English (US)',
    langCode: 'en-US',
    accent: 'American (Mature)',
    ageGroup: 'senior',
    style: 'calm',
    isPremium: true,
    avatarColor: 'from-slate-600 to-slate-800',
    sampleText: 'Take a deep breath in through your nose, hold it for three seconds, and gently release.',
    description: 'Soothing, mature, and deeply calming voice for guided meditation, wellness, and sleep stories.',
    tags: ['Meditation', 'Sleep Story', 'Calm', 'Mindfulness']
  },

  // English (UK)
  {
    id: 'voice-en-gb-charlotte',
    name: 'Charlotte Kensington',
    gender: 'female',
    language: 'English (UK)',
    langCode: 'en-GB',
    accent: 'British (Received Pronunciation)',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: false,
    avatarColor: 'from-purple-500 to-indigo-600',
    sampleText: 'In the heart of the historic archives lies a manuscript that transformed modern literature forever.',
    description: 'Sophisticated, elegant, and articulate British voice suitable for premium documentaries and literature.',
    tags: ['Audiobook', 'Luxury', 'Articulate', 'History']
  },
  {
    id: 'voice-en-gb-arthur',
    name: 'Arthur Pendelton',
    gender: 'male',
    language: 'English (UK)',
    langCode: 'en-GB',
    accent: 'British (Classic)',
    ageGroup: 'senior',
    style: 'news',
    isPremium: true,
    avatarColor: 'from-emerald-600 to-teal-700',
    sampleText: 'Good evening. Tonight we bring you a special report on the global renewable energy summit.',
    description: 'Distinguished, BBC-style broadcast news anchor voice with impeccable clarity.',
    tags: ['News', 'Broadcasting', 'Formal', 'Corporate']
  },

  // English (Australia & India)
  {
    id: 'voice-en-au-chloe',
    name: 'Chloe Lawson',
    gender: 'female',
    language: 'English (Australia)',
    langCode: 'en-AU',
    accent: 'Australian',
    ageGroup: 'adult',
    style: 'conversational',
    isPremium: false,
    avatarColor: 'from-teal-400 to-emerald-500',
    sampleText: 'G day! Ready to discover the most breathtaking road trips across the coastal highway?',
    description: 'Upbeat, friendly Australian accent great for travel guides, lifestyle content, and podcasts.',
    tags: ['Travel', 'Friendly', 'Lifestyle', 'Australian']
  },
  {
    id: 'voice-en-in-arav',
    name: 'Aarav Sharma',
    gender: 'male',
    language: 'English (India)',
    langCode: 'en-IN',
    accent: 'Indian (Standard)',
    ageGroup: 'adult',
    style: 'conversational',
    isPremium: false,
    avatarColor: 'from-orange-500 to-amber-600',
    sampleText: 'Welcome back. Let us review the quarter three performance metrics and product roadmap goals.',
    description: 'Professional, articulate Indian English voice ideal for corporate presentations, webinars, and education.',
    tags: ['E-Learning', 'Corporate', 'Webinar', 'Finance']
  },
  {
    id: 'voice-en-in-priya',
    name: 'Priya Iyer',
    gender: 'female',
    language: 'English (India)',
    langCode: 'en-IN',
    accent: 'Indian (Pleasant)',
    ageGroup: 'young',
    style: 'narration',
    isPremium: false,
    avatarColor: 'from-rose-500 to-pink-600',
    sampleText: 'Through continuous practice and dedication, students can master complex algorithmic concepts.',
    description: 'Clear, encouraging, and instructional voice tailored for e-learning courses and audiobooks.',
    tags: ['Education', 'EdTech', 'Clear', 'Instructional']
  },

  // Hindi
  {
    id: 'voice-hi-in-kavya',
    name: 'Kavya Verma',
    gender: 'female',
    language: 'Hindi (हिंदी)',
    langCode: 'hi-IN',
    accent: 'Hindi (Standard)',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: false,
    avatarColor: 'from-red-500 to-orange-600',
    sampleText: 'नमस्ते! हमारी नई एआई वॉयस तकनीक में आपका हार्दिक स्वागत है।',
    description: 'सुरीली, स्पष्ट और स्वाभाविक हिंदी आवाज जो कहानियों और विज्ञापनों के लिए सर्वश्रेष्ठ है।',
    tags: ['Hindi', 'Storytelling', 'Commercial', 'Natural']
  },
  {
    id: 'voice-hi-in-rohit',
    name: 'Rohit Malhotra',
    gender: 'male',
    language: 'Hindi (हिंदी)',
    langCode: 'hi-IN',
    accent: 'Hindi (Conversational)',
    ageGroup: 'adult',
    style: 'conversational',
    isPremium: true,
    avatarColor: 'from-indigo-600 to-blue-700',
    sampleText: 'आज के इस विशेष पॉडकास्ट में हम बात करेंगे तकनीक और हमारे दैनिक जीवन के तालमेल पर।',
    description: 'गंभीर और आत्मविश्वास से भरी हिंदी आवाज पॉडकास्ट और समाचारों के लिए।',
    tags: ['Podcast', 'News', 'Corporate', 'Hindi']
  },

  // Spanish (Spain & Latin America)
  {
    id: 'voice-es-es-lucia',
    name: 'Lucía Fernández',
    gender: 'female',
    language: 'Spanish (Español)',
    langCode: 'es-ES',
    accent: 'Castilian Spanish',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: false,
    avatarColor: 'from-yellow-500 to-red-500',
    sampleText: 'Bienvenidos al curso avanzado de diseño digital y experiencia de usuario.',
    description: 'Voz española natural y melodiosa, perfecta para audiolibros, cursos y anuncios.',
    tags: ['Spanish', 'Audiolibros', 'Educación', 'Castellano']
  },
  {
    id: 'voice-es-mx-mateo',
    name: 'Mateo Morales',
    gender: 'male',
    language: 'Spanish (Latinoamérica)',
    langCode: 'es-MX',
    accent: 'Mexican Spanish',
    ageGroup: 'adult',
    style: 'commercial',
    isPremium: true,
    avatarColor: 'from-teal-500 to-emerald-600',
    sampleText: 'Descubre una nueva forma de conectar con tu audiencia utilizando inteligencia artificial.',
    description: 'Voz dinámica y persuasiva de América Latina para comerciales y videos virales.',
    tags: ['Comercial', 'Latam', 'Dinamismo', 'Marketing']
  },

  // French
  {
    id: 'voice-fr-fr-camille',
    name: 'Camille Dubois',
    gender: 'female',
    language: 'French (Français)',
    langCode: 'fr-FR',
    accent: 'Parisian French',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: false,
    avatarColor: 'from-blue-500 to-cyan-500',
    sampleText: 'Bienvenue dans notre voyage sonore à travers les chefs-d’œuvre de l’art moderne.',
    description: 'Voix française douce, raffinée et élégante, idéale pour les documentaires et la narration.',
    tags: ['French', 'Documentaire', 'Élégance', 'Narration']
  },
  {
    id: 'voice-fr-fr-julien',
    name: 'Julien Laurent',
    gender: 'male',
    language: 'French (Français)',
    langCode: 'fr-FR',
    accent: 'Standard French',
    ageGroup: 'adult',
    style: 'conversational',
    isPremium: true,
    avatarColor: 'from-violet-600 to-purple-800',
    sampleText: 'Explorons ensemble les nouvelles frontières de l’intelligence artificielle appliquée.',
    description: 'Voix masculine posée et claire pour podcasts techniques et présentations d’entreprise.',
    tags: ['Tech', 'Podcast', 'Business', 'Français']
  },

  // German
  {
    id: 'voice-de-de-hannah',
    name: 'Hannah Weber',
    gender: 'female',
    language: 'German (Deutsch)',
    langCode: 'de-DE',
    accent: 'Standard German',
    ageGroup: 'adult',
    style: 'conversational',
    isPremium: false,
    avatarColor: 'from-amber-500 to-red-600',
    sampleText: 'Herzlich willkommen zu unserem Online-Seminar für moderne Softwarearchitektur.',
    description: 'Präzise, professionelle und angenehme deutsche Stimme für E-Learning und Unternehmensmedien.',
    tags: ['Deutsch', 'E-Learning', 'Präzise', 'Business']
  },
  {
    id: 'voice-de-de-lukas',
    name: 'Lukas Becker',
    gender: 'male',
    language: 'German (Deutsch)',
    langCode: 'de-DE',
    accent: 'Standard German',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: true,
    avatarColor: 'from-zinc-700 to-slate-900',
    sampleText: 'Die Entwicklung moderner Technologien verändert nachhaltig unsere Gesellschaft.',
    description: 'Tiefe, vertrauenswürdige deutsche Stimme für Dokumentarfilme und Hörbücher.',
    tags: ['Hörbuch', 'Doku', 'Vertrauen', 'Deutsch']
  },

  // Japanese
  {
    id: 'voice-ja-jp-sakura',
    name: 'Sakura Tanaka (さくら)',
    gender: 'female',
    language: 'Japanese (日本語)',
    langCode: 'ja-JP',
    accent: 'Tokyo Standard',
    ageGroup: 'young',
    style: 'conversational',
    isPremium: false,
    avatarColor: 'from-rose-400 to-pink-500',
    sampleText: 'こんにちは！最新の音声合成テクノロジーの世界へようこそ。',
    description: '明るく親しみやすい日本の標準音声。アニメやキャラクター、解説動画に最適。',
    tags: ['Japanese', 'Anime', 'Friendly', 'Assistant']
  },
  {
    id: 'voice-ja-jp-kenji',
    name: 'Kenji Sato (健二)',
    gender: 'male',
    language: 'Japanese (日本語)',
    langCode: 'ja-JP',
    accent: 'Tokyo Standard',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: true,
    avatarColor: 'from-blue-700 to-slate-800',
    sampleText: '日本の伝統的な庭園美と近代建築の調和について考察します。',
    description: '落ち着いた重厚感のある日本語ナレーション音声。',
    tags: ['Narration', 'Documentary', 'Formal', 'Japanese']
  },

  // Italian
  {
    id: 'voice-it-it-giulia',
    name: 'Giulia Rossi',
    gender: 'female',
    language: 'Italian (Italiano)',
    langCode: 'it-IT',
    accent: 'Standard Italian',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: false,
    avatarColor: 'from-green-600 to-emerald-700',
    sampleText: 'Benvenuti in un viaggio affascinante attraverso la storia e la cultura d’Italia.',
    description: 'Voce italiana calda, espressiva e armoniosa per audiolibri e narrazioni.',
    tags: ['Italiano', 'Cultura', 'Calda', 'Audiobook']
  },

  // Portuguese (Brazil & Portugal)
  {
    id: 'voice-pt-br-gabriel',
    name: 'Gabriel Santos',
    gender: 'male',
    language: 'Portuguese (Português)',
    langCode: 'pt-BR',
    accent: 'Brazilian Portuguese',
    ageGroup: 'adult',
    style: 'conversational',
    isPremium: false,
    avatarColor: 'from-yellow-400 to-green-600',
    sampleText: 'Olá! Sejam muito bem-vindos ao nosso canal de tecnologia e inovação.',
    description: 'Voz calorosa e comunicativa do Brasil para podcasts, vídeos e comerciais.',
    tags: ['Brasil', 'Podcast', 'Energia', 'Português']
  },

  // Mandarin Chinese
  {
    id: 'voice-zh-cn-mei',
    name: 'Mei Lin (美玲)',
    gender: 'female',
    language: 'Chinese (中文)',
    langCode: 'zh-CN',
    accent: 'Mandarin (Standard)',
    ageGroup: 'adult',
    style: 'narration',
    isPremium: false,
    avatarColor: 'from-red-600 to-yellow-500',
    sampleText: '欢迎体验全新的智能语音合成系统，带来清晰自然的听觉盛宴。',
    description: '标准清晰的普通话播音级音质，适合新闻播报与专业课程讲解。',
    tags: ['Mandarin', 'Professional', 'Broadcast', 'Chinese']
  },

  // Non-binary / Synthesized Studio Voices
  {
    id: 'voice-en-us-echo',
    name: 'Echo Neutral',
    gender: 'non-binary',
    language: 'English (US)',
    langCode: 'en-US',
    accent: 'Futuristic Studio',
    ageGroup: 'young',
    style: 'calm',
    isPremium: true,
    avatarColor: 'from-cyan-400 via-violet-500 to-fuchsia-500',
    sampleText: 'All systems are operating at optimal parameters. Initiating audio synthesis pipeline.',
    description: 'Crisp, synthetic-cybernetic neutral tone tailored for AI assistants, sci-fi games, and UI prompts.',
    tags: ['Cyber', 'AI Assistant', 'Sci-Fi', 'Futuristic']
  },
  {
    id: 'voice-en-us-sam',
    name: 'Sam Harper',
    gender: 'non-binary',
    language: 'English (US)',
    langCode: 'en-US',
    accent: 'American (Neutral)',
    ageGroup: 'adult',
    style: 'audiobook',
    isPremium: false,
    avatarColor: 'from-indigo-500 to-teal-400',
    sampleText: 'The morning mist hovered quietly over the lake as the first rays of sunlight broke through.',
    description: 'Balanced, soothing, and neutral cadence designed for multi-chapter audiobook narration.',
    tags: ['Audiobook', 'Balanced', 'Narrative', 'Modern']
  }
];

export const VOICE_LANGUAGES = Array.from(new Set(VOICES.map(v => v.language)));
export const VOICE_STYLES = Array.from(new Set(VOICES.map(v => v.style)));
export const VOICE_GENDERS = ['male', 'female', 'non-binary'] as const;
