import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useAudio } from '../../context/AudioContext';
import { StorageService } from '../../services/storage';
import { LocaleCode } from '../../types';
import { ReceiptPdfService } from '../../services/receiptPdfService';
import { Settings, User, Key, Globe, Moon, Sun, Trash2, Check, X, Shield, Sparkles, Receipt, Download } from 'lucide-react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    user, 
    authUser, 
    isAuthenticated, 
    logout, 
    setShowAuthModal, 
    planDetails, 
    locale, 
    setLocale, 
    theme, 
    toggleTheme, 
    showToast, 
    setShowPricingModal, 
    invoices 
  } = useUser();
  const { clearHistory } = useAudio();
  
  const [userName, setUserName] = useState(user.name);
  const [apiKey, setApiKey] = useState(user.apiKey || '');
  const [autoSave, setAutoSave] = useState(user.autoSaveDraft);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...user,
      name: userName,
      apiKey: apiKey.trim(),
      autoSaveDraft: autoSave,
    };
    StorageService.saveUserProfile(updated);
    showToast('Settings saved successfully', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Studio Settings & Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your connected account and studio preferences</p>
          </div>
        </div>

        {/* PROMINENT ACCOUNT STATUS BANNER */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary-950/40 via-slate-900 to-indigo-950/40 border border-primary-500/20 shadow-sm">
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-bold flex items-center justify-center text-base overflow-hidden border-2 border-primary-400/40 shadow-sm shrink-0">
                    {authUser?.avatarUrl ? (
                      <img src={authUser.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{user.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">{user.email}</p>
                  <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                    {authUser?.provider === 'google' ? (
                      <>
                        <svg className="w-3 h-3" viewBox="0 0 24 24">
                          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                          <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                        </svg>
                        <span>Verified Google Account</span>
                      </>
                    ) : (
                      <span>Signed In Account</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors self-start sm:self-center cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Current Status:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Guest Mode
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Sign in with Google to sync your voice scripts, generated audios, and plan quota.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                <span>Sign In with Google</span>
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* User Profile Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            {/* Current Plan Card */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Active Plan:</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${planDetails.badgeColor}`}>
                  {planDetails.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setShowPricingModal(true);
                }}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
              >
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Billing & Tax Invoices Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Billing History & PDF Receipts
            </h3>

            {invoices && invoices.length > 0 ? (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">{inv.invoiceNumber}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 uppercase">
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {inv.planName} • ₹{inv.amount.toLocaleString()} INR • {new Date(inv.date).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        ReceiptPdfService.downloadReceiptPdf({
                          invoiceNumber: inv.invoiceNumber,
                          customerName: user.name || 'Valued Creator',
                          customerEmail: user.email || 'customer@voxcraft.ai',
                          planName: inv.planName,
                          planType: inv.plan,
                          amountInr: inv.amount,
                          paymentId: inv.paymentId,
                          paymentMethod: inv.paymentMethod,
                          date: inv.date,
                          status: inv.status as any,
                          monthlyLimit: inv.plan === 'pro' ? 500000 : 100000
                        });
                        showToast(`Tax invoice PDF ${inv.invoiceNumber} downloaded!`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                <p>No paid invoices yet on this device.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Official GST tax invoices will appear here after upgrading.</p>
              </div>
            )}
          </div>

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Studio Preferences
            </h3>

            {/* Language & Theme */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Language
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as LocaleCode)}
                  aria-label="App Language"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />} Theme
                </label>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
                  <span className="text-[11px] font-semibold text-primary-600">Switch</span>
                </button>
              </div>
            </div>

            {/* Auto-save Toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Auto-save Drafts</p>
                <p className="text-[11px] text-slate-400">Automatically save your in-progress script text locally every 5 seconds.</p>
              </div>
            </label>
          </div>

          {/* External API Integration (Optional) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" /> Custom TTS Engine API Key (Optional)
            </label>
            <input
              type="password"
              placeholder="e.g. sk_live_elevenlabs_... or azure_key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              Plug in your custom provider key for direct upstream routing, or leave blank to use the built-in browser & neural synthesizers.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all local generation history and drafts?')) {
                  clearHistory();
                }
              }}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Local Data
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-sm"
            >
              Save Preferences
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
