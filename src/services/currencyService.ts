export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  inrRate: number; // How many target currency units for 1 INR (e.g. 1 INR = 0.0115 USD)
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    inrRate: 1.0,
    decimals: 0
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    inrRate: 1 / 86.8, // ₹1,199 ≈ $13.8 -> $14
    decimals: 0
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    inrRate: 1 / 94.2, // ₹1,199 ≈ €12.7 -> €13
    decimals: 0
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    inrRate: 1 / 110.5, // ₹1,199 ≈ £10.8 -> £11
    decimals: 0
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    inrRate: 1 / 23.6, // ₹1,199 ≈ 50.8 AED -> 51 AED
    decimals: 0
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    inrRate: 1 / 64.1, // ₹1,199 ≈ CA$18.7 -> CA$19
    decimals: 0
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    inrRate: 1 / 56.4, // ₹1,199 ≈ AU$21.2 -> AU$21
    decimals: 0
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    inrRate: 1 / 0.58, // ₹1,199 ≈ ¥2,067 JPY
    decimals: 0
  },
  SGD: {
    code: 'SGD',
    symbol: 'SG$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    inrRate: 1 / 65.0, // ₹1,199 ≈ SG$18.4 -> SG$18
    decimals: 0
  }
};

const STORAGE_CURRENCY_KEY = 'voxaro_user_currency';
const STORAGE_GEO_KEY = 'voxaro_detected_country';

export class CurrencyService {
  /**
   * Returns saved user currency or attempts auto-detection
   */
  static getActiveCurrency(): CurrencyConfig {
    if (typeof window === 'undefined') return SUPPORTED_CURRENCIES.INR;

    try {
      const savedCode = localStorage.getItem(STORAGE_CURRENCY_KEY);
      if (savedCode && SUPPORTED_CURRENCIES[savedCode]) {
        return SUPPORTED_CURRENCIES[savedCode];
      }
    } catch {}

    // Auto-detect based on timezone & locale
    const detectedCode = this.detectCurrencyFromTimezone();
    return SUPPORTED_CURRENCIES[detectedCode] || SUPPORTED_CURRENCIES.INR;
  }

  /**
   * Sets and persists the user preferred currency
   */
  static setActiveCurrency(currencyCode: string): CurrencyConfig {
    const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;
    try {
      localStorage.setItem(STORAGE_CURRENCY_KEY, config.code);
      window.dispatchEvent(new CustomEvent('voxaro_currency_changed', { detail: config }));
    } catch {}
    return config;
  }

  /**
   * Detects country & currency from browser timezone
   */
  static detectCurrencyFromTimezone(): string {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      
      if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) {
        return 'INR';
      }
      if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago') || tz.includes('Denver') || tz.includes('America/')) {
        return 'USD';
      }
      if (tz.includes('London') || tz.includes('Belfast') || tz.includes('Europe/London')) {
        return 'GBP';
      }
      if (tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Rome') || tz.includes('Madrid') || tz.includes('Amsterdam') || tz.includes('Europe/')) {
        return 'EUR';
      }
      if (tz.includes('Dubai') || tz.includes('Abu_Dhabi') || tz.includes('Asia/Dubai')) {
        return 'AED';
      }
      if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal')) {
        return 'CAD';
      }
      if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Australia/')) {
        return 'AUD';
      }
      if (tz.includes('Tokyo') || tz.includes('Asia/Tokyo')) {
        return 'JPY';
      }
      if (tz.includes('Singapore') || tz.includes('Asia/Singapore')) {
        return 'SGD';
      }
    } catch {}

    return 'INR'; // Default base currency
  }

  /**
   * Requests HTML5 Geolocation permission and resolves precise country
   */
  static async requestGeoLocationPermission(): Promise<{ countryCode: string; currency: CurrencyConfig; message: string }> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        const curr = this.getActiveCurrency();
        resolve({ countryCode: 'AUTO', currency: curr, message: 'Geolocation not supported. Using locale timezone.' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          let detectedCurrency = 'INR';
          let detectedCountry = 'India';

          // Lat/Lng bounding boxes for quick zero-latency reverse lookup
          if (lat >= 8.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0) {
            detectedCurrency = 'INR';
            detectedCountry = 'India';
          } else if (lat >= 24.0 && lat <= 50.0 && lng >= -125.0 && lng <= -66.0) {
            detectedCurrency = 'USD';
            detectedCountry = 'United States';
          } else if (lat >= 50.0 && lat <= 60.0 && lng >= -8.0 && lng <= 2.0) {
            detectedCurrency = 'GBP';
            detectedCountry = 'United Kingdom';
          } else if (lat >= 35.0 && lat <= 70.0 && lng >= -10.0 && lng <= 30.0) {
            detectedCurrency = 'EUR';
            detectedCountry = 'Europe';
          } else if (lat >= 22.0 && lat <= 26.5 && lng >= 51.0 && lng <= 56.5) {
            detectedCurrency = 'AED';
            detectedCountry = 'United Arab Emirates';
          } else if (lat >= 45.0 && lat <= 83.0 && lng >= -141.0 && lng <= -52.0) {
            detectedCurrency = 'CAD';
            detectedCountry = 'Canada';
          } else if (lat >= -44.0 && lat <= -10.0 && lng >= 112.0 && lng <= 154.0) {
            detectedCurrency = 'AUD';
            detectedCountry = 'Australia';
          } else if (lat >= 24.0 && lat <= 46.0 && lng >= 122.0 && lng <= 153.0) {
            detectedCurrency = 'JPY';
            detectedCountry = 'Japan';
          } else {
            detectedCurrency = this.detectCurrencyFromTimezone();
            detectedCountry = 'Detected Region';
          }

          const currency = this.setActiveCurrency(detectedCurrency);
          try {
            localStorage.setItem(STORAGE_GEO_KEY, detectedCountry);
          } catch {}

          resolve({
            countryCode: detectedCurrency,
            currency,
            message: `Location verified: ${detectedCountry} (${currency.code})`
          });
        },
        (error) => {
          const fallbackCurrency = this.getActiveCurrency();
          resolve({
            countryCode: fallbackCurrency.code,
            currency: fallbackCurrency,
            message: `Location permission not granted. Defaulted to ${fallbackCurrency.name} (${fallbackCurrency.code}).`
          });
        },
        { timeout: 6000, maximumAge: 300000 }
      );
    });
  }

  /**
   * Converts INR amount to target currency amount
   */
  static convertInrToCurrency(inrAmount: number, currencyCode: string = 'INR'): number {
    if (inrAmount === 0) return 0;
    const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;
    if (config.code === 'INR') return inrAmount;

    const raw = inrAmount * config.inrRate;
    return config.decimals === 0 ? Math.round(raw) : Math.round(raw * 100) / 100;
  }

  /**
   * Formats an INR price into localized currency display string
   */
  static formatPrice(inrAmount: number, currencyCode?: string): string {
    if (inrAmount === 0) return 'Free';
    const config = currencyCode ? (SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR) : this.getActiveCurrency();
    const converted = this.convertInrToCurrency(inrAmount, config.code);
    
    if (config.code === 'INR') {
      return `₹${converted.toLocaleString('en-IN')}`;
    }
    if (config.code === 'JPY') {
      return `¥${converted.toLocaleString('ja-JP')}`;
    }
    return `${config.symbol}${converted.toLocaleString()}`;
  }
}
