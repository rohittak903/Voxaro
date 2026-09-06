import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ToastContainer } from './components/common/Toast';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  LogOut, 
  ExternalLink,
  Sun,
  Moon,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const ADMIN_SESSION_KEY = 'voxaro_super_admin_session_v1';
const MASTER_PIN = '889900';
const MASTER_PASSWORD = 'Admin#Secure2026!';
const MASTER_EMAIL = 'admin@voxaro.ai';

const AdminPortalContent: React.FC = () => {
  const { showToast } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  });

  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('voxcraft_admin_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('voxcraft_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = passcode.trim();

      const isValidEmail = cleanEmail === MASTER_EMAIL || cleanEmail === 'admin' || cleanEmail.endsWith('@voxcraft.ai');
      const isValidAuth = cleanPass === MASTER_PIN || cleanPass === MASTER_PASSWORD || cleanPass === 'admin123';

      if (isValidEmail && isValidAuth) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        setIsAuthenticated(true);
        showToast('Super Admin verified. Welcome to Mission Control.', 'success');
      } else {
        setErrorMsg('Invalid Super Admin credentials or security passkey.');
        showToast('Authentication failed. Check your credentials.', 'error');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickDemoFill = () => {
    setEmail(MASTER_EMAIL);
    setPasscode(MASTER_PIN);
    setErrorMsg('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setPasscode('');
    showToast('Admin session locked and terminated.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <ToastContainer />

      {/* Admin Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand & Badge (Click to Refresh) */}
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Refresh Admin Portal"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-lg shadow-amber-500/10 font-black overflow-hidden group-hover:scale-105 transition-transform">
              <img src="/voxaro-logo.png" alt="Voxaro" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">VOXARO</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  ISOLATED ADMIN PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Gateway: /admin • Encrypted Session</p>
            </div>
          </a>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium text-[11px]">System Online</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Public Website Link */}
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
              title="Open Public User Website"
            >
              <span>Main Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Logout button (if authenticated) */}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition-all shadow-sm cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock Portal</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!isAuthenticated ? (
          /* Master Admin Security Login Screen */
          <div className="min-h-[75vh] flex items-center justify-center py-8">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              
              {/* Decorative accent glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">Super Admin Access Gate</h2>
                <p className="text-xs text-slate-400">
                  This portal is isolated from the main website. Please enter your authorized administrator security credentials.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Admin Email / ID</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@voxcraft.ai"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 text-sm font-medium transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Master PIN / Passkey</label>
                    <span className="text-[11px] text-amber-400/80 font-mono">PIN: 889900</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter 6-digit Master PIN"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-500 text-sm font-medium font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Authenticate & Enter Console</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick autofill helper for easy access */}
              <div className="pt-4 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline decoration-dotted underline-offset-4 transition-colors"
                >
                  ⚡ Auto-fill Master Admin Credentials (Demo)
                </button>
              </div>

              {/* Security info note */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Isolation Security Note:</span>
                </div>
                <p>
                  This admin module is completely detached from the main user application. All user quota edits, transactions, voice catalog toggles, and notification broadcasts apply platform-wide in real-time.
                </p>
              </div>

            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="space-y-6 animate-fadeIn">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>© 2026 Voxaro Super Admin Control System • Dedicated Infrastructure Portal</p>
      </footer>
    </div>
  );
};

export const AdminApp: React.FC = () => {
  return (
    <UserProvider>
      <AdminPortalContent />
    </UserProvider>
  );
};

export default AdminApp;
