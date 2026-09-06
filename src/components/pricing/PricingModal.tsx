import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { PlanType } from '../../types';
import { CurrencyService, SUPPORTED_CURRENCIES, CurrencyConfig } from '../../services/currencyService';
import { 
  Check, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Zap, 
  Lock, 
  MapPin, 
  Compass, 
  Globe2, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';

export const PricingModal: React.FC<{ isStandalone?: boolean }> = ({ isStandalone = false }) => {
  const { user, plans, upgradePlan, openCheckout, showPricingModal, setShowPricingModal, showToast } = useUser();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<CurrencyConfig>(() => CurrencyService.getActiveCurrency());
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  useEffect(() => {
    const handleCurrencyChange = (e: any) => {
      if (e.detail) {
        setCurrency(e.detail);
      }
    };
    window.addEventListener('voxaro_currency_changed', handleCurrencyChange);
    return () => window.removeEventListener('voxaro_currency_changed', handleCurrencyChange);
  }, []);

  if (!isStandalone && !showPricingModal) return null;

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationStatus('Detecting geolocation & region...');

    try {
      const result = await CurrencyService.requestGeoLocationPermission();
      setCurrency(result.currency);
      setLocationStatus(result.message);
      showToast(result.message, 'success');
    } catch (e: any) {
      showToast('Could not detect location. Defaulted to INR.', 'info');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleCurrencySelect = (code: string) => {
    const newConfig = CurrencyService.setActiveCurrency(code);
    setCurrency(newConfig);
    setLocationStatus(`Currency switched to ${newConfig.name} (${newConfig.code})`);
    showToast(`Displaying prices in ${newConfig.name} (${newConfig.code})`, 'info');
  };

  const planTypes: PlanType[] = ['free', 'creator', 'pro'];

  const content = (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="flex items-center justify-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
            Flexible Global Studio Plans
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            INR Base (₹)
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Upgrade Your AI Voiceover Studio
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Scale with studio-grade neural audio output, lossless WAV downloads, priority queue processing, and commercial usage rights.
        </p>

        {/* Geo-Location & Currency Switcher Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          
          {/* Location Detection Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Auto-detect country using browser geolocation"
          >
            <Compass className={`w-3.5 h-3.5 text-primary-500 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'Detecting Location...' : 'Auto-Detect Country / Currency'}</span>
          </button>

          {/* Currency Dropdown */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1 shadow-2xs">
            <Globe2 className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <span className="text-[11px] font-bold text-slate-400 mr-1.5">Currency:</span>
            <select
              value={currency.code}
              onChange={(e) => handleCurrencySelect(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {c.flag} {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.2 text-[9px] rounded bg-emerald-500 text-white font-extrabold">-20%</span>
            </button>
          </div>
        </div>

        {/* Location Status Message */}
        {locationStatus && (
          <div className="text-[11px] text-primary-600 dark:text-primary-400 font-medium flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{locationStatus}</span>
          </div>
        )}
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planTypes.map((type) => {
          const plan = plans[type];
          const isCurrent = user.plan === type;
          const isPopular = type === 'creator';
          
          // Compute Base INR price
          const inrBasePrice = billingCycle === 'annual' ? Math.round(plan.price * 0.8) : plan.price;
          
          // Formatted display price in target currency
          const formattedDisplayPrice = CurrencyService.formatPrice(inrBasePrice, currency.code);

          return (
            <div
              key={type}
              className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between border ${
                isPopular
                  ? 'bg-white dark:bg-slate-900 border-primary-500 ring-2 ring-primary-500/30 shadow-xl scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-600 text-white shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {type === 'free' ? 'Great for trying out AI voices' : type === 'creator' ? 'For creators & podcasters' : 'For agencies & high-volume teams'}
                    </p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="space-y-1 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                      {formattedDisplayPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">/ month</span>
                  </div>

                  {plan.price > 0 && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <span>Base: ₹{inrBasePrice.toLocaleString('en-IN')} INR/mo</span>
                      {billingCycle === 'annual' && <span className="text-emerald-500 font-bold">(Save 20%)</span>}
                    </div>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade Button */}
              <div>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (type === 'free') {
                        upgradePlan('free');
                      } else {
                        setShowPricingModal(false);
                        openCheckout(type);
                      }
                    }}
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                      isPopular
                        ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                    }`}
                  >
                    <span>{type === 'free' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}</span>
                    {type !== 'free' && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>Royalty-free commercial licensing included</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Cancel or switch plans anytime with 1-click</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-500" />
          <span>Razorpay 256-Bit SSL Encrypted checkout</span>
        </div>
      </div>

    </div>
  );

  if (isStandalone) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative my-8">
        <button
          onClick={() => setShowPricingModal(false)}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {content}
      </div>
    </div>
  );
};
