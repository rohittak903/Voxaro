import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import { AdminService } from '../../services/adminService';
import { 
  X, 
  User, 
  ChevronRight, 
  Mail, 
  Lock, 
  ArrowRight, 
  Globe, 
  UserPlus, 
  ChevronDown
} from 'lucide-react';

export interface SavedAccount {
  email: string;
  name: string;
  avatarUrl?: string;
  initials?: string;
  status?: string;
}

const STORAGE_SAVED_ACCOUNTS_KEY = 'voxaro_saved_google_accounts';

const DEFAULT_ACCOUNTS: SavedAccount[] = [
  {
    email: 'rohittak903@gmail.com',
    name: 'Rajarohittak004',
    initials: 'RS',
    avatarUrl: '',
    status: 'Signed out'
  }
];

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name: string; avatarUrl?: string }) => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'choose_account' | 'custom_account'>('choose_account');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStep('choose_account');
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_SAVED_ACCOUNTS_KEY);
      let loadedAccounts: SavedAccount[] = stored ? JSON.parse(stored) : [];

      if (!loadedAccounts.some(a => a.email.toLowerCase() === 'rohittak903@gmail.com')) {
        loadedAccounts.unshift(DEFAULT_ACCOUNTS[0]);
      }

      const currentAuth = StorageService.loadAuthUser();
      if (currentAuth && currentAuth.email && !loadedAccounts.some(a => a.email.toLowerCase() === currentAuth.email.toLowerCase())) {
        loadedAccounts.unshift({
          email: currentAuth.email,
          name: currentAuth.name || currentAuth.email.split('@')[0],
          initials: (currentAuth.name || currentAuth.email).slice(0, 2).toUpperCase(),
          avatarUrl: currentAuth.avatarUrl,
          status: 'Active'
        });
      }

      try {
        const adminUsers = AdminService.getUsers();
        adminUsers.forEach(u => {
          if (u.email && u.email !== 'admin@voxaro.ai' && !loadedAccounts.some(a => a.email.toLowerCase() === u.email.toLowerCase())) {
            loadedAccounts.push({
              email: u.email,
              name: u.name || u.email.split('@')[0],
              initials: (u.name || u.email).slice(0, 2).toUpperCase(),
              status: 'Signed out'
            });
          }
        });
      } catch {}

      setAccounts(loadedAccounts);
      localStorage.setItem(STORAGE_SAVED_ACCOUNTS_KEY, JSON.stringify(loadedAccounts));
    } catch {
      setAccounts(DEFAULT_ACCOUNTS);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveAccountToMemory = (acc: SavedAccount) => {
    try {
      const updated = [acc, ...accounts.filter(a => a.email.toLowerCase() !== acc.email.toLowerCase())];
      setAccounts(updated);
      localStorage.setItem(STORAGE_SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleSelectAccount = (acc: SavedAccount) => {
    setIsProcessing(true);
    setTimeout(() => {
      saveAccountToMemory(acc);
      onSuccess(acc);
      setIsProcessing(false);
      onClose();
    }, 450);
  };

  const handleCustomAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const derivedName = customName.trim() || customEmail.split('@')[0];
    const acc: SavedAccount = {
      email: customEmail.trim(),
      name: derivedName,
      initials: derivedName.slice(0, 2).toUpperCase(),
      status: 'Active'
    };

    setIsProcessing(true);
    setTimeout(() => {
      saveAccountToMemory(acc);
      onSuccess(acc);
      setIsProcessing(false);
      onClose();
    }, 450);
  };

  const handleResetAndClose = () => {
    setStep('choose_account');
    setCustomEmail('');
    setCustomName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl rounded-[28px] bg-[#131314] text-[#E3E3E3] border border-[#303030] shadow-2xl overflow-hidden relative font-sans">
        
        {/* Top Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#28292a]">
          <div className="flex items-center gap-2.5">
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
            className="p-1.5 rounded-full hover:bg-[#28292a] text-[#C4C7C5] hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-10">
          
          {/* STEP 1: Two-Column Account Chooser (Image 2) */}
          {step === 'choose_account' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start animate-fadeIn">
              
              {/* Left Column: Icon + Choose an account */}
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-[#3C4043] flex items-center justify-center p-2 shadow-md overflow-hidden">
                  <img src="/voxaro-logo.png" alt="Voxaro" className="w-full h-full object-cover" />
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-normal text-white tracking-tight">
                    Choose an account
                  </h2>
                  <p className="text-sm sm:text-base text-[#C4C7C5] mt-1.5 font-normal">
                    to continue to <strong className="text-white font-medium">Voxaro</strong>
                  </p>
                </div>
              </div>

              {/* Right Column: Account List + Use another account + Disclaimer */}
              <div className="space-y-5">
                <div className="divide-y divide-[#303030]">
                  {accounts.map((acc, index) => {
                    const initials = acc.initials || (acc.name || acc.email).slice(0, 2).toUpperCase();
                    const colors = ['bg-[#2A2B2D]', 'bg-[#1E293B]', 'bg-[#1E1B4B]'];
                    const color = colors[index % colors.length];

                    return (
                      <div
                        key={acc.email}
                        onClick={() => !isProcessing && handleSelectAccount(acc)}
                        className="py-3.5 px-2.5 sm:px-3 flex items-center justify-between hover:bg-[#1E1F20] rounded-xl transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
                          {acc.avatarUrl ? (
                            <img
                              src={acc.avatarUrl}
                              alt={acc.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#3C4043] shrink-0"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full ${color} border border-[#3C4043] flex items-center justify-center text-white font-medium text-xs shrink-0`}>
                              {initials}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate group-hover:text-[#A8C7FA] transition-colors">
                              {acc.name}
                            </h4>
                            <p className="text-xs text-[#8E918F] truncate">
                              {acc.email}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs text-[#8E918F]">
                          {acc.status || 'Signed out'}
                        </span>
                      </div>
                    );
                  })}

                  <div
                    onClick={() => setStep('custom_account')}
                    className="py-3.5 px-2.5 sm:px-3 flex items-center gap-3.5 hover:bg-[#1E1F20] rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#202124] border border-[#3C4043] flex items-center justify-center text-[#C4C7C5] group-hover:text-white group-hover:border-[#A8C7FA] transition-colors shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white group-hover:text-[#A8C7FA] transition-colors block">
                        Use another account
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#8E918F] leading-relaxed pt-2">
                  Before using this app, you can review Voxaro's{' '}
                  <span className="text-[#A8C7FA] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                  <span className="text-[#A8C7FA] hover:underline cursor-pointer">Terms of Service</span>.
                </p>
              </div>

            </div>
          )}

          {/* STEP 2: Use another account email form */}
          {step === 'custom_account' && (
            <form onSubmit={handleCustomAccountSubmit} className="max-w-md mx-auto space-y-6 animate-fadeIn py-2">
              <div className="space-y-1 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-[#3C4043] flex items-center justify-center p-2 mb-3 mx-auto sm:mx-0">
                  <img src="/voxaro-logo.png" alt="Voxaro" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-normal text-white">Sign in with Google</h3>
                <p className="text-xs sm:text-sm text-[#C4C7C5]">Enter your Google Account email</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C4C7C5]">Email or phone</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@gmail.com"
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
                  disabled={isProcessing}
                  className="px-7 py-2.5 rounded-full text-xs font-bold bg-[#A8C7FA] hover:bg-[#8AB4F8] text-[#040C19] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-6 sm:px-8 py-4 bg-[#1B1C1D] border-t border-[#28292a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8E918F]">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <span>English (United States)</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
};
