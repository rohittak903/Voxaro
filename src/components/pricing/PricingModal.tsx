import React, { useState } from 'react';
import { useUser, PLANS } from '../../context/UserContext';
import { PlanType } from '../../types';
import { Crown, Check, Sparkles, X, ShieldCheck, Zap, CreditCard, Lock } from 'lucide-react';

export const PricingModal: React.FC<{ isStandalone?: boolean }> = ({ isStandalone = false }) => {
  const { user, upgradePlan, openCheckout, showPricingModal, setShowPricingModal, showToast } = useUser();
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanType | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isStandalone && !showPricingModal) return null;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    setIsProcessing(true);
    setTimeout(() => {
      upgradePlan(selectedPlanForCheckout);
      setIsProcessing(false);
      setSelectedPlanForCheckout(null);
    }, 1200);
  };

  const planTypes: PlanType[] = ['free', 'creator', 'pro'];

  const content = (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
          Flexible Studio Plans
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Upgrade Your AI Voiceover Studio
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Scale with studio-grade audio output, lossless WAV downloads, priority queue processing, and commercial usage rights.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-2">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              billingCycle === 'annual'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-emerald-500 text-white font-bold">20% OFF</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planTypes.map((type) => {
          const plan = PLANS[type];
          const isCurrent = user.plan === type;
          const isPopular = type === 'creator';
          const price = billingCycle === 'annual' ? Math.round(plan.price * 0.8) : plan.price;

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

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ month</span>
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
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                      isPopular
                        ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                    }`}
                  >
                    {type === 'free' ? 'Downgrade to Free' : `Upgrade via Razorpay`}
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
          <span>256-Bit SSL Encrypted checkout</span>
        </div>
      </div>

      {/* Simulated Stripe Checkout Modal */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            
            <button
              onClick={() => setSelectedPlanForCheckout(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Secure Checkout</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upgrading to {PLANS[selectedPlanForCheckout].name} (${PLANS[selectedPlanForCheckout].price}/mo)
                </p>
              </div>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  defaultValue={user.name}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  defaultValue="4242 •••• •••• 4242"
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expiry</label>
                  <input
                    type="text"
                    required
                    defaultValue="12/28"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">CVC / CVV</label>
                  <input
                    type="text"
                    required
                    defaultValue="888"
                    placeholder="CVC"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${PLANS[selectedPlanForCheckout].price}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                  <span>Total Today:</span>
                  <span>${PLANS[selectedPlanForCheckout].price}.00</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
              >
                {isProcessing ? (
                  <span>Authorizing Payment...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Confirm & Upgrade Plan (${PLANS[selectedPlanForCheckout].price})</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

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
