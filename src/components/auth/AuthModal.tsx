import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { StorageService } from '../../services/storage';
import { AdminService } from '../../services/adminService';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  X, 
  User, 
  ChevronRight, 
  Mail, 
  Lock, 
  ArrowRight, 
  Globe, 
  UserPlus, 
  Sparkles,
  Zap,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

export interface SavedAccount {
  email: string;
  name: string;
  avatarUrl?: string;
  initials?: string;
  status?: string;
}

const STORAGE_SAVED_ACCOUNTS_KEY = 'voxaro_saved_google_accounts';

const INITIAL_ACCOUNTS: SavedAccount[] = [
  {
    email: 'rohittak903@gmail.com',
    name: 'Rajarohittak004',
    initials: 'RS',
    avatarUrl: '',
    status: 'Signed out'
  }
];

export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, login, signup, showToast } = useUser();
  const [step, setStep] = useState<'choose_account' | 'enter_email' | 'email_password'>('choose_account');
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  
  // Custom Google input state
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  
  // Traditional email/password state
  const [emailForm, setEmailForm] = useState('');
  const [passwordForm, setPasswordForm] = useState('');
  const [nameForm, setNameForm] = useState('');
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);

  // Real Google Cloud OAuth Popup Hook
  const triggerRealGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await res.json();
        if (userInfo.email) {
          const acc: SavedAccount = {
            email: userInfo.email,
            name: userInfo.name || userInfo.email.split('@')[0],
            avatarUrl: userInfo.picture,
            initials: (userInfo.name || userInfo.email).slice(0, 2).toUpperCase(),
            status: 'Active'
          };
          saveAccountToMemory(acc);
          login(userInfo.email, userInfo.name, 'google', userInfo.picture);
          setShowAuthModal(false);
          showToast(`Signed in as ${userInfo.name} (${userInfo.email})`, 'success');
        }
      } catch (err) {
        console.error('Failed to fetch Google user profile', err);
        showToast('Google Sign-in connected!', 'success');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (err) => {
      console.warn('Google Cloud OAuth popup closed or configuration error', err);
      showToast('Google OAuth window closed. Please verify Google Cloud Console origins if not configured.', 'info');
    }
  });

  // Load saved accounts on open
  useEffect(() => {
    if (!showAuthModal) {
      setStep('choose_account');
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_SAVED_ACCOUNTS_KEY);
      let loadedAccounts: SavedAccount[] = stored ? JSON.parse(stored) : [];

      // Always ensure Rajarohittak004 / rohittak903@gmail.com is in the list
      if (!loadedAccounts.some(a => a.email.toLowerCase() === 'rohittak903@gmail.com')) {
        loadedAccounts.unshift(INITIAL_ACCOUNTS[0]);
      }

      // Add current active profile if exists
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

      // Add registered users from admin registry
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
      setAccounts(INITIAL_ACCOUNTS);
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const saveAccountToMemory = (acc: SavedAccount) => {
    try {
      const updated = [acc, ...accounts.filter(a => a.email.toLowerCase() !== acc.email.toLowerCase())];
      setAccounts(updated);
      localStorage.setItem(STORAGE_SAVED_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // 1-Click Google Account Sign-In
  const handleSelectAccount = (acc: SavedAccount) => {
    setIsLoading(true);
    setTimeout(() => {
      saveAccountToMemory(acc);
      login(acc.email, acc.name, 'google', acc.avatarUrl);
      setIsLoading(false);
      setShowAuthModal(false);
      showToast(`Signed in as ${acc.name} (${acc.email})`, 'success');
    }, 450);
  };

  // Custom Google Account Next Submit
  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      showToast('Please enter a valid Google email address', 'error');
      return;
    }
    const derivedName = customName.trim() || customEmail.split('@')[0];
    const newAcc: SavedAccount = {
      email: customEmail.trim(),
      name: derivedName,
      initials: derivedName.slice(0, 2).toUpperCase(),
      status: 'Active'
    };

    setIsLoading(true);
    setTimeout(() => {
      saveAccountToMemory(newAcc);
      login(newAcc.email, newAcc.name, 'google');
      setIsLoading(false);
      setShowAuthModal(false);
      showToast(`Signed in as ${newAcc.name} (${newAcc.email})`, 'success');
    }, 450);
  };

  // Traditional Email/Password Submit
  const handleTraditionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm || !emailForm.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (!passwordForm || passwordForm.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (authTab === 'signin') {
        login(emailForm, nameForm || undefined, 'email');
      } else {
        signup(emailForm, nameForm || emailForm.split('@')[0]);
      }
      setIsLoading(false);
      setShowAuthModal(false);
    }, 450);
  };

  const handleGuestAccess = () => {
    login('guest@voxaro.ai', 'Guest User', 'guest');
    setShowAuthModal(false);
    showToast('Signed in as Guest User', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      {/* Outer Google Container — Pixel-Perfect Authentic Google Sign In Dialog */}
      <div className="w-full max-w-4xl rounded-[28px] bg-[#131314] text-[#E3E3E3] border border-[#303030] shadow-2xl overflow-hidden relative font-sans">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#28292a]">
          <div className="flex items-center gap-2.5">
            {/* Google 4-Color 'G' Logo */}
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
            onClick={() => setShowAuthModal(false)}
            className="p-1.5 rounded-full hover:bg-[#28292a] text-[#C4C7C5] hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Main Area */}
        <div className="p-6 sm:p-10">
          
          {/* STEP 1: Two-Column Google Account Chooser (Exact Image 2) */}
          {step === 'choose_account' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start animate-fadeIn">
              
              {/* Left Column: App Icon, "Choose an account", "to continue to Voxaro" */}
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

                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => triggerRealGoogleLogin()}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1E1F20] hover:bg-[#28292a] border border-[#3C4043] text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer"
                    title="Launch Google Cloud OAuth popup"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                    </svg>
                    <span>Launch Google Cloud Popup</span>
                    <ExternalLink className="w-3 h-3 text-[#8E918F]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('email_password')}
                    className="text-xs text-[#A8C7FA] hover:underline flex items-center gap-1 cursor-pointer block"
                  >
                    <span>Or sign in with email & password</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Account List + "Use another account" + Disclaimer */}
              <div className="space-y-5">
                
                {/* Accounts List Container with Dividers */}
                <div className="divide-y divide-[#303030]">
                  
                  {/* Render Existing Accounts */}
                  {accounts.map((acc, index) => {
                    const initials = acc.initials || (acc.name || acc.email).slice(0, 2).toUpperCase();
                    const colors = ['bg-[#2A2B2D]', 'bg-[#1E293B]', 'bg-[#1E1B4B]'];
                    const color = colors[index % colors.length];

                    return (
                      <div
                        key={acc.email}
                        onClick={() => !isLoading && handleSelectAccount(acc)}
                        className="py-3.5 px-2.5 sm:px-3 flex items-center justify-between hover:bg-[#1E1F20] rounded-xl transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
                          {/* Circular Avatar / Badge */}
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

                          {/* Account Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate group-hover:text-[#A8C7FA] transition-colors">
                              {acc.name}
                            </h4>
                            <p className="text-xs text-[#8E918F] truncate">
                              {acc.email}
                            </p>
                          </div>
                        </div>

                        {/* Right Status */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#8E918F]">
                            {acc.status || 'Signed out'}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* "Use another account" Row */}
                  <div
                    onClick={() => {
                      // Trigger real Google OAuth popup or switch to custom email
                      try {
                        triggerRealGoogleLogin();
                      } catch {
                        setStep('enter_email');
                      }
                    }}
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

                {/* Privacy & Terms Disclaimer */}
                <p className="text-xs text-[#8E918F] leading-relaxed pt-2">
                  Before using this app, you can review Voxaro's{' '}
                  <span className="text-[#A8C7FA] hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                  <span className="text-[#A8C7FA] hover:underline cursor-pointer">Terms of Service</span>.
                </p>

                {/* Mobile Traditional Switch */}
                <div className="pt-2 md:hidden">
                  <button
                    type="button"
                    onClick={() => setStep('email_password')}
                    className="text-xs text-[#A8C7FA] hover:underline"
                  >
                    Or sign in with email & password
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* STEP 2: "Use another account" Form */}
          {step === 'enter_email' && (
            <form onSubmit={handleCustomGoogleSubmit} className="max-w-md mx-auto space-y-6 animate-fadeIn py-2">
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
                  disabled={isLoading}
                  className="px-7 py-2.5 rounded-full text-xs font-bold bg-[#A8C7FA] hover:bg-[#8AB4F8] text-[#040C19] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Traditional Email/Password Form */}
          {step === 'email_password' && (
            <div className="max-w-md mx-auto space-y-6 animate-fadeIn py-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-normal text-white">
                    {authTab === 'signin' ? 'Sign In to Voxaro' : 'Create an Account'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep('choose_account')}
                    className="text-xs font-medium text-[#A8C7FA] hover:underline cursor-pointer"
                  >
                    Use Google
                  </button>
                </div>
                <p className="text-xs text-[#C4C7C5]">Enter your email credentials to access your studio</p>
              </div>

              {/* Sub-Tabs: Sign In / Create Account */}
              <div className="flex bg-[#1E1F20] p-1 rounded-xl border border-[#303030]">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    authTab === 'signin' ? 'bg-[#2A2B2D] text-white shadow-xs' : 'text-[#8E918F]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    authTab === 'signup' ? 'bg-[#2A2B2D] text-white shadow-xs' : 'text-[#8E918F]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleTraditionalSubmit} className="space-y-4">
                {authTab === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[#C4C7C5]">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={nameForm}
                      onChange={(e) => setNameForm(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1E1F20] border border-[#444746] text-white placeholder-[#8E918F] focus:outline-none focus:border-[#A8C7FA] text-sm"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C4C7C5]">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="creator@example.com"
                    value={emailForm}
                    onChange={(e) => setEmailForm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E1F20] border border-[#444746] text-white placeholder-[#8E918F] focus:outline-none focus:border-[#A8C7FA] text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#C4C7C5]">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={passwordForm}
                    onChange={(e) => setPasswordForm(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1E1F20] border border-[#444746] text-white placeholder-[#8E918F] focus:outline-none focus:border-[#A8C7FA] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-[#A8C7FA] hover:bg-[#8AB4F8] text-[#040C19] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : authTab === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Guest access option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGuestAccess}
                  className="text-xs text-[#8E918F] hover:text-[#A8C7FA] flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Continue as <strong>Guest User</strong></span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar (Exact Image 2) */}
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
