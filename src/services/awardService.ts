import { GenerationJob, UserProfile, AuthUser, AwardBadge, RealtimeAudioStats } from '../types';

export class AwardService {
  /**
   * Computes real-time audio generation metrics dynamically from the live state
   */
  static getRealtimeStats(
    history: GenerationJob[],
    user: UserProfile,
    authUser: AuthUser | null
  ): RealtimeAudioStats {
    const totalAudios = history.length;
    const historyChars = history.reduce((sum, j) => sum + (j.characterCount || (j.inputText ? j.inputText.length : 0)), 0);
    const totalCharacters = Math.max(user.charactersUsedThisMonth || 0, historyChars);
    const totalDurationSeconds = history.reduce((sum, j) => sum + (Number(j.duration) || 0), 0);
    
    const uniqueVoicesUsed = new Set(history.map(j => j.voice.id)).size;
    const uniqueLanguagesUsed = new Set(history.map(j => j.voice.language)).size;

    const awards = this.calculateAwards(history, user, authUser);
    const unlockedAwardsCount = awards.filter(a => a.isUnlocked).length;
    const totalAwardsCount = awards.length;

    return {
      totalAudios,
      totalCharacters,
      totalDurationSeconds,
      uniqueVoicesUsed,
      uniqueLanguagesUsed,
      unlockedAwardsCount,
      totalAwardsCount
    };
  }

  /**
   * Calculates all achievements & awards with exact progress percentages in real time
   */
  static calculateAwards(
    history: GenerationJob[],
    user: UserProfile,
    authUser: AuthUser | null
  ): AwardBadge[] {
    const audioCount = history.length;
    const historyChars = history.reduce((sum, j) => sum + (j.characterCount || (j.inputText ? j.inputText.length : 0)), 0);
    const totalChars = Math.max(user.charactersUsedThisMonth || 0, historyChars);
    const totalDuration = history.reduce((sum, j) => sum + (Number(j.duration) || 0), 0);
    const uniqueVoices = new Set(history.map(j => j.voice.id)).size;
    const uniqueLangs = new Set(history.map(j => j.voice.language)).size;
    const isGoogleAuth = authUser?.provider === 'google';
    const isPremiumPlan = user.plan === 'creator' || user.plan === 'pro';

    const rawAwards: AwardBadge[] = [
      {
        id: 'first_audio',
        title: 'Voice Debut',
        description: 'Synthesized your first AI speech script in Voxaro Studio',
        category: 'generation',
        icon: 'mic',
        tier: 'bronze',
        targetValue: 1,
        currentValue: audioCount,
        unit: 'audio',
        isUnlocked: audioCount >= 1,
        progressPercent: Math.min(100, Math.round((audioCount / 1) * 100))
      },
      {
        id: 'speech_creator',
        title: 'Studio Creator',
        description: 'Generated 5 unique audio tracks and voice clips',
        category: 'generation',
        icon: 'flame',
        tier: 'silver',
        targetValue: 5,
        currentValue: audioCount,
        unit: 'audios',
        isUnlocked: audioCount >= 5,
        progressPercent: Math.min(100, Math.round((audioCount / 5) * 100))
      },
      {
        id: 'voice_maestro',
        title: 'Voice Maestro',
        description: 'Synthesized 20 complete high-definition audio generations',
        category: 'generation',
        icon: 'award',
        tier: 'gold',
        targetValue: 20,
        currentValue: audioCount,
        unit: 'audios',
        isUnlocked: audioCount >= 20,
        progressPercent: Math.min(100, Math.round((audioCount / 20) * 100))
      },
      {
        id: 'wordsmith',
        title: 'Wordsmith Master',
        description: 'Converted 2,500+ characters into natural, human-like voice',
        category: 'generation',
        icon: 'zap',
        tier: 'silver',
        targetValue: 2500,
        currentValue: totalChars,
        unit: 'chars',
        isUnlocked: totalChars >= 2500,
        progressPercent: Math.min(100, Math.round((totalChars / 2500) * 100))
      },
      {
        id: 'titan_narrator',
        title: 'Titan Storyteller',
        description: 'Synthesized over 10,000 characters of high-fidelity voice',
        category: 'generation',
        icon: 'sparkles',
        tier: 'platinum',
        targetValue: 10000,
        currentValue: totalChars,
        unit: 'chars',
        isUnlocked: totalChars >= 10000,
        progressPercent: Math.min(100, Math.round((totalChars / 10000) * 100))
      },
      {
        id: 'global_polyglot',
        title: 'Global Polyglot',
        description: 'Produced multi-lingual audio in 2 or more distinct languages',
        category: 'exploration',
        icon: 'globe',
        tier: 'gold',
        targetValue: 2,
        currentValue: uniqueLangs,
        unit: 'languages',
        isUnlocked: uniqueLangs >= 2,
        progressPercent: Math.min(100, Math.round((uniqueLangs / 2) * 100))
      },
      {
        id: 'vocal_chameleon',
        title: 'Vocal Chameleon',
        description: 'Experimented and recorded with 3+ different AI voice personalities',
        category: 'exploration',
        icon: 'sparkles',
        tier: 'silver',
        targetValue: 3,
        currentValue: uniqueVoices,
        unit: 'voices',
        isUnlocked: uniqueVoices >= 3,
        progressPercent: Math.min(100, Math.round((uniqueVoices / 3) * 100))
      },
      {
        id: 'verified_creator',
        title: 'Verified Creator',
        description: 'Linked and authenticated with official Google Account credentials',
        category: 'account',
        icon: 'shield',
        tier: 'bronze',
        targetValue: 1,
        currentValue: isGoogleAuth ? 1 : 0,
        unit: 'auth',
        isUnlocked: isGoogleAuth,
        progressPercent: isGoogleAuth ? 100 : 0
      },
      {
        id: 'broadcast_marathon',
        title: 'Broadcast Marathon',
        description: 'Generated over 60 seconds of cumulative studio audio narration',
        category: 'studio',
        icon: 'flame',
        tier: 'silver',
        targetValue: 60,
        currentValue: Math.round(totalDuration),
        unit: 'seconds',
        isUnlocked: totalDuration >= 60,
        progressPercent: Math.min(100, Math.round((totalDuration / 60) * 100))
      },
      {
        id: 'pro_studio_elite',
        title: 'Pro Studio Elite',
        description: 'Active subscription to Creator Studio or Pro Enterprise plan',
        category: 'studio',
        icon: 'crown',
        tier: 'platinum',
        targetValue: 1,
        currentValue: isPremiumPlan ? 1 : 0,
        unit: 'tier',
        isUnlocked: isPremiumPlan,
        progressPercent: isPremiumPlan ? 100 : 0
      }
    ];

    return rawAwards;
  }
}
