import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { PaymentService } from '../../services/paymentService';
import { CurrencyService } from '../../services/currencyService';
import { PlanType, InvoiceRecord } from '../../types';
import { ReceiptPdfService } from '../../services/receiptPdfService';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  CreditCard, 
  Building2, 
  Sparkles, 
  ArrowRight,
  Download,
  Lock,
  QrCode,
  Globe2
} from 'lucide-react';

export const RazorpayCheckoutModal: React.FC = () => {
  const { 
    showCheckoutModal, 
    setShowCheckoutModal, 
    checkoutTargetPlan, 
    user, 
    plans,
    upgradePlan,
    showToast 
  } = useUser();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking'>('razorpay_upi');
  
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<InvoiceRecord | null>(null);

  if (!showCheckoutModal) return null;

  const targetPlanDetails = (plans && plans[checkoutTargetPlan]) || {
    name: 'Creator Studio',
    monthlyLimit: 100000
  };
  const pricing = PaymentService.getPlanPriceInr(checkoutTargetPlan, billingCycle);
  const activeCurrency = CurrencyService.getActiveCurrency();
  const convertedPriceStr = CurrencyService.formatPrice(pricing.price, activeCurrency.code);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const invoice = await PaymentService.processRazorpayPayment({
        plan: checkoutTargetPlan,
        planName: targetPlanDetails.name,
        amountInr: pricing.price,
        billingCycle,
        customerName: user.name,
        customerEmail: user.email,
        paymentMethod,
        upiVpa: paymentMethod === 'razorpay_upi' ? (upiId || 'creator@okaxis') : undefined,
        onSuccess: () => {},
        onError: () => {}
      });

      setCompletedInvoice(invoice);
      upgradePlan(checkoutTargetPlan);
      showToast(`Payment Successful! Welcome to ${targetPlanDetails.name}`, 'success');
    } catch (err: any) {
      showToast('Payment transaction could not be processed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setShowCheckoutModal(false);
    setCompletedInvoice(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative max-h-[92vh] overflow-y-auto">
        
        {/* Header with Razorpay Badge */}
        <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-primary-700 text-white flex items-center justify-between relative">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                Razorpay Checkout
              </span>
              <span className="text-[11px] text-blue-200 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Secured
              </span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">
              Upgrade to {targetPlanDetails.name}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Successful Payment State */}
        {completedInvoice ? (
          <div className="p-8 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Payment Successful!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your account has been upgraded to <strong>{targetPlanDetails.name}</strong>.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{completedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment ID:</span>
                <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{completedInvoice.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-500">₹{completedInvoice.amount.toLocaleString()} INR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New Monthly Quota:</span>
                <span className="font-bold text-indigo-400">{targetPlanDetails.monthlyLimit.toLocaleString()} characters</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  ReceiptPdfService.downloadReceiptPdf({
                    invoiceNumber: completedInvoice.invoiceNumber,
                    customerName: user.name || 'Valued Creator',
                    customerEmail: user.email || 'customer@voxcraft.ai',
                    planName: targetPlanDetails.name,
                    planType: completedInvoice.plan,
                    amountInr: completedInvoice.amount,
                    paymentId: completedInvoice.paymentId,
                    paymentMethod: completedInvoice.paymentMethod,
                    date: completedInvoice.date,
                    status: 'paid',
                    billingCycle: billingCycle,
                    monthlyLimit: targetPlanDetails.monthlyLimit
                  });
                  showToast(`Tax invoice PDF ${completedInvoice.invoiceNumber} downloaded!`, 'success');
                }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Receipt</span>
              </button>

              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                Go to Studio Editor
              </button>
            </div>
          </div>
        ) : (
          /* Payment Selection & Checkout Form */
          <form onSubmit={handlePayNow} className="p-6 space-y-6">
            
            {/* Billing Cycle Switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Billing Frequency</span>
                <p className="text-[11px] text-slate-400">Save 20% on Annual subscription</p>
              </div>

              <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    billingCycle === 'monthly' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                    billingCycle === 'yearly' ? 'bg-primary-600 text-white shadow-xs' : 'text-slate-400'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-slate-900 font-extrabold">-20%</span>
                </button>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Select Razorpay Payment Method
              </label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay_upi')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                    paymentMethod === 'razorpay_upi'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay_card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                    paymentMethod === 'razorpay_card'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay_netbanking')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                    paymentMethod === 'razorpay_netbanking'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-500 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-xs">Netbanking</span>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'razorpay_upi' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter UPI ID (VPA)</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">GPay</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">PhonePe</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">Paytm</span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            )}

            {paymentMethod === 'razorpay_card' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'razorpay_netbanking' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Select Your Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Order Total Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              {pricing.savingsInr > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Regular List Price ({billingCycle}):</span>
                  <span className="line-through text-slate-400 font-mono">
                    ₹{pricing.regularTotal.toLocaleString()} INR
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Discounted Sale Subtotal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  ₹{pricing.price.toLocaleString()} INR
                  {activeCurrency.code !== 'INR' && <span className="ml-1 text-primary-500">({convertedPriceStr})</span>}
                </span>
              </div>

              {pricing.savingsInr > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Special Promotional Discount:</span>
                  <span>- ₹{pricing.savingsInr.toLocaleString()} INR ({pricing.savingsPercent}% OFF)</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>GST (18% Included):</span>
                <span>₹{Math.round(pricing.price * 0.18).toLocaleString()} INR</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-extrabold text-sm text-slate-900 dark:text-white">
                <span>Total Amount Due:</span>
                <div className="text-right">
                  <span className="text-blue-600 dark:text-blue-400 block">₹{pricing.price.toLocaleString()} INR</span>
                  {activeCurrency.code !== 'INR' && (
                    <span className="text-[11px] font-semibold text-slate-400 font-mono">
                      (Approx. {convertedPriceStr})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connecting with Razorpay Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{pricing.price.toLocaleString()} INR via Razorpay</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
