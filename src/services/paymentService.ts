import { InvoiceRecord, PlanType, AdminTransactionItem } from '../types';
import { StorageService } from './storage';
import { AdminService } from './adminService';

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
   * Dynamic Plans INR pricing table from AdminService
   */
  static getPlanPriceInr(plan: PlanType, cycle: 'monthly' | 'yearly' = 'monthly'): { 
    price: number; 
    originalMonthly: number; 
    regularTotal: number;
    savingsInr: number;
    savingsPercent: number 
  } {
    if (plan === 'free') return { price: 0, originalMonthly: 0, regularTotal: 0, savingsInr: 0, savingsPercent: 0 };
    
    const planConfigs = AdminService.getPlanConfigs();
    const targetConfig = planConfigs[plan];
    const monthly = targetConfig?.price || (plan === 'pro' ? 2999 : 1199);
    const originalMonthly = targetConfig?.originalPrice || (plan === 'pro' ? 4999 : 1999);

    if (cycle === 'yearly') {
      const discountedYearly = Math.round(monthly * 12 * 0.8);
      const regularYearly = originalMonthly * 12;
      return { 
        price: discountedYearly, 
        originalMonthly,
        regularTotal: regularYearly,
        savingsInr: Math.max(0, regularYearly - discountedYearly),
        savingsPercent: Math.round(((regularYearly - discountedYearly) / regularYearly) * 100) 
      };
    }

    return { 
      price: monthly, 
      originalMonthly,
      regularTotal: originalMonthly,
      savingsInr: Math.max(0, originalMonthly - monthly),
      savingsPercent: targetConfig?.discountPercent || Math.round(((originalMonthly - monthly) / originalMonthly) * 100) 
    };
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

    // Real-time sync with Admin Transactions & Financial metrics
    const adminTx: AdminTransactionItem = {
      id: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      customerName: options.customerName,
      customerEmail: options.customerEmail,
      plan: options.plan,
      amountInr: options.amountInr,
      paymentMethod: options.paymentMethod as any,
      paymentId,
      date: newInvoice.date,
      status: 'paid'
    };
    AdminService.recordRealTransaction(adminTx);

    return newInvoice;
  }
}
