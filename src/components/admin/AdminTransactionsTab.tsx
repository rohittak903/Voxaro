import React, { useState } from 'react';
import { AdminService } from '../../services/adminService';
import { AdminTransactionItem } from '../../types';
import { useUser } from '../../context/UserContext';
import { ReceiptPdfService } from '../../services/receiptPdfService';
import { 
  CreditCard, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  FileText,
  Smartphone,
  Building2,
  X
} from 'lucide-react';

export const AdminTransactionsTab: React.FC = () => {
  const { showToast } = useUser();
  const [transactions] = useState<AdminTransactionItem[]>(() => AdminService.getTransactions());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<AdminTransactionItem | null>(null);

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getMethodIcon = (m: string) => {
    if (m.includes('upi')) return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
    if (m.includes('netbanking')) return <Building2 className="w-3.5 h-3.5 text-indigo-500" />;
    return <CreditCard className="w-3.5 h-3.5 text-purple-500" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, email, or Payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          {['all', 'paid', 'refunded', 'pending'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === s
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Invoice / Customer</th>
                <th className="py-3.5 px-4">Razorpay Payment ID</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Amount (INR)</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Receipt</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <CreditCard className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
                      <p className="font-bold text-slate-700 dark:text-slate-300">No transactions recorded yet</p>
                      <p className="text-[11px] text-slate-500">
                        Real-time customer payments via Razorpay checkout will automatically appear here as soon as orders are placed.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  
                  {/* Customer */}
                  <td className="py-4 px-5">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{t.customerName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{t.invoiceNumber}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">{t.customerEmail}</span>
                    </div>
                  </td>

                  {/* Payment ID */}
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 select-all">
                    {t.paymentId}
                  </td>

                  {/* Plan */}
                  <td className="py-4 px-4 font-bold uppercase text-xs">
                    <span className={t.plan === 'pro' ? 'text-emerald-500' : 'text-indigo-500'}>
                      {t.plan}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white font-mono text-xs">
                    ₹{t.amountInr.toLocaleString()}
                  </td>

                  {/* Payment Method */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      {getMethodIcon(t.paymentMethod)}
                      <span className="capitalize">{t.paymentMethod.replace('razorpay_', '')}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === 'paid' 
                        ? 'bg-emerald-500/15 text-emerald-400' 
                        : t.status === 'refunded'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-rose-500/15 text-rose-400'
                    }`}>
                      {t.status}
                    </span>
                  </td>

                  {/* Invoice action */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          ReceiptPdfService.downloadReceiptPdf({
                            invoiceNumber: t.invoiceNumber,
                            customerName: t.customerName,
                            customerEmail: t.customerEmail,
                            planName: t.plan === 'pro' ? 'Pro Enterprise Plan' : 'Creator Studio Plan',
                            planType: t.plan,
                            amountInr: t.amountInr,
                            paymentId: t.paymentId,
                            paymentMethod: t.paymentMethod,
                            date: t.date,
                            status: t.status,
                            monthlyLimit: t.plan === 'pro' ? 500000 : 100000
                          });
                          showToast(`PDF Receipt ${t.invoiceNumber} downloaded!`, 'success');
                        }}
                        title="Download PDF Receipt"
                        className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1 transition-colors border border-emerald-200 dark:border-emerald-800/60"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">PDF</span>
                      </button>

                      <button
                        onClick={() => setSelectedInvoice(t)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>

                </tr>
              )))
            }
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 font-mono">Invoice {selectedInvoice.invoiceNumber}</span>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-600 dark:text-slate-300">{selectedInvoice.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Razorpay ID:</span>
                <span className="text-blue-400 select-all">{selectedInvoice.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-600 dark:text-slate-300">{new Date(selectedInvoice.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-bold">
                <span>Amount Paid:</span>
                <span className="text-emerald-500">₹{selectedInvoice.amountInr.toLocaleString()} INR</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  ReceiptPdfService.downloadReceiptPdf({
                    invoiceNumber: selectedInvoice.invoiceNumber,
                    customerName: selectedInvoice.customerName,
                    customerEmail: selectedInvoice.customerEmail,
                    planName: selectedInvoice.plan === 'pro' ? 'Pro Enterprise Plan' : 'Creator Studio Plan',
                    planType: selectedInvoice.plan,
                    amountInr: selectedInvoice.amountInr,
                    paymentId: selectedInvoice.paymentId,
                    paymentMethod: selectedInvoice.paymentMethod,
                    date: selectedInvoice.date,
                    status: selectedInvoice.status,
                    monthlyLimit: selectedInvoice.plan === 'pro' ? 500000 : 100000
                  });
                  showToast(`Tax invoice PDF ${selectedInvoice.invoiceNumber} downloaded!`, 'success');
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
