import React, { useState } from 'react';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminTransactionsTab } from './AdminTransactionsTab';
import { AdminVoicesTab } from './AdminVoicesTab';
import { AdminBroadcastTab } from './AdminBroadcastTab';
import { 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Volume2, 
  Megaphone,
  Sparkles,
  Lock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'transactions' | 'voices' | 'broadcast'>('analytics');

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              SUPER ADMIN CONTROL CENTER
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
              Live Gateway Connected
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Platform Operations & Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage users, monitor Razorpay transactions, configure voice models, and broadcast notifications.
          </p>
        </div>

        {/* Security badge */}
        <div className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs flex items-center gap-2 shadow-xs self-start md:self-center">
          <Lock className="w-4 h-4 text-emerald-500" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Admin Access Active</span>
            <span className="text-[10px] text-slate-400">Full RBAC Permissions Granted</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
        
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Overview & Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span>Users & Quotas</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'transactions'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-blue-500" />
          <span>Razorpay Payments</span>
        </button>

        <button
          onClick={() => setActiveTab('voices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'voices'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4 text-purple-500" />
          <span>Voice Catalog CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'broadcast'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-500" />
          <span>Broadcast Announcements</span>
        </button>

      </div>

      {/* Render Sub-Tab Component */}
      <div className="pt-2">
        {activeTab === 'analytics' && <AdminAnalyticsTab />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'transactions' && <AdminTransactionsTab />}
        {activeTab === 'voices' && <AdminVoicesTab />}
        {activeTab === 'broadcast' && <AdminBroadcastTab />}
      </div>

    </div>
  );
};
