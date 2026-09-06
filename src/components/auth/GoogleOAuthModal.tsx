import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { AdminService } from '../../services/adminService';
import { 
  X, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  ChevronRight, 
  Mail, 
  Lock,
  Globe,
  UserPlus,
  Trash2
} from 'lucide-react';

export interface SavedAccount {
  email: string;
  name: string;
  avatarUrl?: string;
  status?: string;
}

const STORAGE_SAVED_ACCOUNTS_KEY = 'voxaro_saved_google_accounts';

const DEFAULT_ACCOUNTS: SavedAccount[] = [
  {
    email: 'rohittak903@gmail.com',
    name: 'Rohit Tak',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=RohitTak',
    status: 'Signed out'
  },
  {
    email: 'creator.studio@gmail.com',
    name: 'Studio Creator',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=StudioCreator',
    status: 'Signed out'
  }
];

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name: string; avatarUrl?: string }) => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'choose_account' | 'custom_account' | 'consent'>('choose_account');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedUser, setSelectedUser] = useState<SavedAccount | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);

  // Load saved accounts from storage + real registered accounts
  useEffect(() => {
    if (!isOpen) return;

    try {
      const stored = localStorage.getItem(STORAGE_SAVED_ACCOUNTS_KEY);
      let loadedAccounts: SavedAccount[] = stored ? JSON.parse(stored) : [];

      // Merge current authUser / profile if exists
      const currentAuth = StorageService.loadAuthUser();
      if (currentAuth && currentAuth.email && !loadedAccounts.some(a => a.email.toLowerCase() === currentAuth.email.toLowerCase())) {
        loadedAccounts.unshift({
          email: currentAuth.email,
          name: currentAuth.name || currentAuth.email.split('@')[0],
          avatarUrl: currentAuth.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentAuth.name)}`,
          status: 'Active'
        });
      }

      // Merge real registered users from Admin registry
      try {
        const adminUsers = AdminService.getUsers();
        adminUsers.forEach(u => {
          if (u.email && u.email !== 'admin@voxaro.ai' && !loadedAccounts.some(a => a.email.toLowerCase() === u.email.toLowerCase())) {
            loadedAccounts.push({
              email: u.email,
              name: u.name || u.email.split('@')[0],
              avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`,
              status: 'Signed out'
            });
          }
        });
      } catch {}

      // If still empty, supply default recognizable accounts
      if (loadedAccounts.length === 0) {
        loadedAccounts = DEFAULT_ACCOUNTS;
      }

      setAccounts(loadedAccounts);
      localStorage.setItem(STORAGE_SAVED_ACCOUNTS_KEY, JSON.stringify(loadedAccounts));
    } catch {
      setAccounts(DEFAULT_ACCOUNTS);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveAccountToHistory = (newAcc: SavedAccount) => {
    try {
      const updated = [newAcc, ...accounts.filter(a => a.email.toLowerCase() !== newAcc.email.toLowerCase())];
      setAccounts(updated);
      localStorage.setItem(STORAGE_SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const removeAccount = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    const updated = accounts.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    setAccounts(updated);
    try {
      localStorage.setItem(STORAGE_SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSelectAccount = (acc: SavedAccount) => {
    setSelectedUser(acc);
    setStep('consent');
  };

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const derivedName = customName.trim() || customEmail.split('@')[0];
    const acc: SavedAccount = {
      email: customEmail.trim(),
      name: derivedName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(derivedName)}`,
      status: 'Active'
    };

    saveAccountToHistory(acc);
    setSelectedUser(acc);
    setStep('consent');
  };

  const handleConsentContinue = () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    setTimeout(() => {
      saveAccountToHistory(selectedUser);
      onSuccess(selectedUser);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  const handleResetAndClose = () => {
    setStep('choose_account');
    setSelectedUser(null);
    setCustomEmail('');
    setCustomName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Outer Google Modal Container */}
      <div className="w-full max-w-xl rounded-3xl bg-[#131314] text-[#E3E3E3] border border-[#303030] shadow-2xl overflow-hidden relative font-sans">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#28292a]">
          <div className="flex items-center gap-2.5">
            {/* Official Google 'G' Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-[#C4C7C5]">Sign in with Google</span>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full hover:bg-[#28292a] text-[#C4C7C5] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Modal Content based on Step */}
        <div className="p-6 sm:p-8">
          
          {/* STEP 1: Choose an Account (Shows Existing Accounts List) */}
          {step === 'choose_account' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  <img src="/voxaro-logo.png" alt="Voxaro" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-normal text-white">Choose an account</h3>
                  <p className="text-xs sm:text-sm text-[#C4C7C5] mt-0.5">
                    to continue to <strong className="text-white font-medium">Voxaro</strong>
                  </p>
                </div>
              </div>

              {/* Accounts list container */}
              <div className="border border-[#303030] rounded-2xl overflow-hidden divide-y divide-[#303030]">
                
                {/* Render Existing Accounts */}
                {accounts.map((acc, index) => {
                  const initial = (acc.name || acc.email)[0].toUpperCase();
                  const colors = ['bg-[#0B57D0]', 'bg-[#7C3AED]', 'bg-[#059669]', 'bg-[#D97706]', 'bg-[#DC2626]'];
                  const bgColor = colors[index % colors.length];

                  return (
                    <div
                      key={acc.email}
                      onClick={() => handleSelectAccount(acc)}
                      className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-[#1E1F20] transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
                        {/* Avatar */}
                        {acc.avatarUrl ? (
                          <img
                            src={acc.avatarUrl}
                            alt={acc.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#3C4043] shrink-0"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                            {initial}
                          </div>
                        )}

                        {/* Account Name & Email */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate group-hover:text-[#A8C7FA] transition-colors">
                            {acc.name}
                          </h4>
                          <p className="text-xs text-[#8E918F] truncate">
                            {acc.email}
                          </p>
                        </div>
                      </div>

                      {/* Right indicator & delete option */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#8E918F] hidden sm:inline">
                          {acc.status || 'Signed out'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#8E918F] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}

                {/* Option to Add / Use Another Google Account */}
                <button
                  type="button"
                  onClick={() => setStep('custom_account')}
                  className="w-full p-3.5 sm:p-4 flex items-center gap-3.5 hover:bg-[#1E1F20] transition-colors text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#28292a] border border-[#3C4043] flex items-center justify-center text-[#C4C7C5] group-hover:text-white group-hover:border-[#A8C7FA] transition-colors shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white flex items-center justify-between">
                      <span className="group-hover:text-[#A8C7FA] transition-colors">Use another account</span>
                      <ChevronRight className="w-4 h-4 text-[#8E918F] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <span className="text-xs text-[#8E918F]">Sign in with a different email or phone</span>
                  </div>
                </button>

              </div>

              {/* Policy note */}
              <p className="text-[11px] text-[#8E918F] leading-relaxed">
                Before using this app, you can review Voxaro's <span className="text-[#A8C7FA] hover:underline cursor-pointer">Privacy Policy</span> and <span className="text-[#A8C7FA] hover:underline cursor-pointer">Terms of Service</span>.
              </p>
            </div>
          )}

          {/* STEP 1.5: Custom Google Account Sign In Form */}
          {step === 'custom_account' && (
            <form onSubmit={handleCustomAccountSubmit} className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden mb-3">
                  <img src="/voxaro-logo.png" alt="Voxaro" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl sm:text-2xl font-normal text-white">Sign in with Google</h3>
                <p className="text-xs sm:text-sm text-[#C4C7C5]">Enter your Google Account email</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C4C7C5]">Email or phone</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourname@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1E1F20] border border-[#444746] text-white placeholder-[#8E918F] focus:outline-none focus:border-[#A8C7FA] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C4C7C5]">Full Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1E1F20] border border-[#444746] text-white placeholder-[#8E918F] focus:outline-none focus:border-[#A8C7FA] text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('choose_account')}
                  className="text-xs font-medium text-[#A8C7FA] hover:underline cursor-pointer"
                >
                  Back to accounts
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#A8C7FA] hover:bg-[#8AB4F8] text-[#040C19] transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Google Permissions Consent Screen */}
          {step === 'consent' && selectedUser && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header with App Logo */}
              <div className="flex items-center justify-between pb-3 border-b border-[#303030]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/voxaro-logo.png" alt="Voxaro" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-normal text-white">Sign in to Voxaro</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#A8C7FA] mt-0.5">
                      <span>{selectedUser.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access scope box */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white">
                  Google will allow Voxaro to access this info about you:
                </h4>

                <div className="space-y-3.5 pl-1">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#28292a] flex items-center justify-center text-[#A8C7FA] mt-0.5 shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{selectedUser.name}</p>
                      <p className="text-[11px] text-[#8E918F]">Name and profile picture</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#28292a] flex items-center justify-center text-[#A8C7FA] mt-0.5 shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{selectedUser.email}</p>
                      <p className="text-[11px] text-[#8E918F]">Email address</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="space-y-1.5 text-[11px] text-[#8E918F] leading-relaxed pt-2 border-t border-[#303030]">
                <p>
                  Review Voxaro's <span className="text-[#A8C7FA] hover:underline cursor-pointer">privacy policy</span> and <span className="text-[#A8C7FA] hover:underline cursor-pointer">Terms of Service</span> to understand how Voxaro will process and protect your data.
                </p>
                <p>
                  To make changes at any time, go to your <span className="text-[#A8C7FA] hover:underline cursor-pointer">Google Account</span>.
                </p>
              </div>

              {/* Action Buttons: Cancel / Continue */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('choose_account')}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#A8C7FA] hover:bg-[#28292a] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConsentContinue}
                  className="px-7 py-2.5 rounded-full text-xs font-bold bg-[#A8C7FA] hover:bg-[#8AB4F8] text-[#040C19] flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-[#040C19] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#1B1C1D] border-t border-[#28292a] flex items-center justify-between text-[11px] text-[#8E918F]">
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>English (United States)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
};
