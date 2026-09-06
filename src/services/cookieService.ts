/**
 * Voxaro Cookie & Consent Engine
 * Handles secure browser cookies, GDPR/ePrivacy compliance, and user preference persistence.
 */

export interface CookieConsent {
  necessary: boolean;     // Always true (Auth, security, core studio)
  preferences: boolean;   // Theme, currency, language, volume presets
  analytics: boolean;     // Anonymous performance & generation metrics
  timestamp: string;      // Consent timestamp
  version: number;        // Consent version
}

const COOKIE_CONSENT_KEY = 'voxaro_cookie_consent';
const CURRENT_CONSENT_VERSION = 1;

export class CookieService {
  /**
   * Set a browser cookie with standard security attributes
   */
  static setCookie(name: string, value: string, days = 365, path = '/', sameSite = 'Lax'): void {
    try {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      const expires = `expires=${date.toUTCString()}`;
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${expires}; path=${path}; SameSite=${sameSite}${secure}`;
    } catch (e) {
      console.warn('Could not set cookie', name, e);
    }
  }

  /**
   * Get a browser cookie by name
   */
  static getCookie(name: string): string | null {
    try {
      const nameEQ = `${encodeURIComponent(name)}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Delete a browser cookie
   */
  static deleteCookie(name: string, path = '/'): void {
    try {
      document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    } catch (e) {
      console.warn('Could not delete cookie', name, e);
    }
  }

  /**
   * Check if user has already made a cookie choice
   */
  static hasConsented(): boolean {
    const consent = this.getConsent();
    return consent !== null && consent.version === CURRENT_CONSENT_VERSION;
  }

  /**
   * Get current cookie consent record
   */
  static getConsent(): CookieConsent | null {
    try {
      // Check cookie first
      const rawCookie = this.getCookie(COOKIE_CONSENT_KEY);
      if (rawCookie) {
        return JSON.parse(rawCookie);
      }
      // Fallback to localStorage
      const rawStorage = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (rawStorage) {
        return JSON.parse(rawStorage);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Save cookie consent preferences
   */
  static saveConsent(consent: Partial<CookieConsent>): CookieConsent {
    const fullConsent: CookieConsent = {
      necessary: true, // Always required
      preferences: consent.preferences ?? true,
      analytics: consent.analytics ?? true,
      timestamp: new Date().toISOString(),
      version: CURRENT_CONSENT_VERSION,
    };

    try {
      const serialized = JSON.stringify(fullConsent);
      this.setCookie(COOKIE_CONSENT_KEY, serialized, 365);
      localStorage.setItem(COOKIE_CONSENT_KEY, serialized);

      // Dispatch event to notify listeners
      window.dispatchEvent(new CustomEvent('voxaro_cookie_consent_updated', { detail: fullConsent }));
    } catch (e) {
      console.warn('Error saving cookie consent', e);
    }

    return fullConsent;
  }

  /**
   * Accept all cookies (Necessary + Preferences + Analytics)
   */
  static acceptAll(): CookieConsent {
    return this.saveConsent({
      necessary: true,
      preferences: true,
      analytics: true,
    });
  }

  /**
   * Decline non-essential cookies (Necessary only)
   */
  static rejectNonEssential(): CookieConsent {
    return this.saveConsent({
      necessary: true,
      preferences: false,
      analytics: false,
    });
  }

  /**
   * Open the cookie preferences modal globally
   */
  static openPreferencesModal(): void {
    window.dispatchEvent(new CustomEvent('voxaro_open_cookie_preferences'));
  }
}
