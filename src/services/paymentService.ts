import { InvoiceRecord, PlanType } from '../types';
import { StorageService } from './storage';

export interface RazorpayCheckoutOptions {
  plan: PlanType;
  planName: string;
  amountInr: number;
  billingCycle: 'monthly' | 'yearly';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'card';
  upiVpa?: string;
  onSuccess: (invoice: InvoiceRecord) => void;
  onError: (error: string) => void;
}

export class PaymentService {
  /**
   * Plans INR pricing table
   */
  static getPlanPriceInr(plan: PlanType, cycle: 'monthly' | 'yearly' = 'monthly'): { price: number; originalMonthly: number; savingsPercent: number } {
    if (plan === 'free') return { price: 0, originalMonthly: 0, savingsPercent: 0 };
    
    if (plan === 'creator') {
      const monthly = 1199; // ~15 USD
      if (cycle === 'yearly') {
        return { price: Math.round(monthly * 12 * 0.8), originalMonthly: monthly * 12, savingsPercent: 20 };
      }
      return { price: monthly, originalMonthly: monthly, savingsPercent: 0 };
    }

    // Pro
    const monthly = 2999; // ~39 USD
    if (cycle === 'yearly') {
      return { price: Math.round(monthly * 12 * 0.8), originalMonthly: monthly * 12, savingsPercent: 20 };
    }
    return { price: monthly, originalMonthly: monthly, savingsPercent: 0 };
  }

  /**
   * Processes a simulated or live Razorpay transaction
   */
  static async processRazorpayPayment(options: RazorpayCheckoutOptions): Promise<InvoiceRecord> {
    await new Promise(r => setTimeout(r, 1400)); // Simulate bank / Razorpay gateway handshake

    const paymentId = 'pay_rzp_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 6);
    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: InvoiceRecord = {
      id: 'inv-' + Date.now(),
      invoiceNumber: invoiceNum,
      plan: options.plan,
      planName: `${options.planName} (${options.billingCycle === 'yearly' ? 'Annual' : 'Monthly'})`,
      amount: options.amountInr,
      currency: 'INR',
      paymentMethod: options.paymentMethod,
      paymentId,
      date: new Date().toISOString(),
      status: 'paid',
      receiptUrl: `#receipt-${paymentId}`
    };

    // Save invoice to storage
    StorageService.addInvoice(newInvoice);
    // Upgrade user plan
    StorageService.updatePlan(options.plan);

    return newInvoice;
  }
}
