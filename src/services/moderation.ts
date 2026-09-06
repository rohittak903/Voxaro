// Content moderation filter as required by PRD FR-8.1

const FLAGGED_PATTERNS = [
  /\b(kill\s+yourself|die|terrorist|bomb\s+threat|kill\s+all)\b/i,
  /\b(hate\s+speech|nazi|white\s+supremacy|racial\s+slur)\b/i,
  /\b(credit\s*card\s*number|cvv\s*\d{3}|ssn\s*\d{3}-\d{2}-\d{4})\b/i,
  /\b(phishing|hack\s+account|password\s+steal)\b/i
];

export interface ModerationResult {
  isValid: boolean;
  reason?: string;
  flaggedTerms?: string[];
}

export function validateContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'Text is empty.' };
  }

  const flaggedTerms: string[] = [];

  for (const pattern of FLAGGED_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      flaggedTerms.push(match[0]);
    }
  }

  if (flaggedTerms.length > 0) {
    return {
      isValid: false,
      reason: 'Content contains restricted keywords violating safety policy.',
      flaggedTerms
    };
  }

  return { isValid: true };
}
