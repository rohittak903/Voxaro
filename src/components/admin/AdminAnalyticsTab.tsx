import React from 'react';
import { AdminService } from '../../services/adminService';
import { VOICES } from '../../data/voices';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Volume2, 
  Activity, 
  Zap, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Globe
} from 'lucide-react';

export const AdminAnalyticsTab: React.FC = () => {
  const metrics = AdminService.getFinancialMetrics();
  const users = AdminService.getUsers();

  const totalCharsProcessed = users.reduce((acc, u) => acc + (u.charactersUsedThisMonth || 0), 0);

  const topVoices = [
    { name: 'Emma (English US)', lang: 'en-US', share: '38%', count: '240k chars', color: 'bg-indigo-500' },
    { name: 'Kavya (Hindi)', lang: 'hi-IN', share: '26%', count: '164k chars', color: 'bg-purple-500' },
    { name: 'Mateo (Spanish)', lang: 'es-ES', share: '18%', count: '113k chars', color: 'bg-emerald-500' },
    { name: 'Rohit (Hindi)', lang: 'hi-IN', share: '12%', count: '75k chars', color: 'bg-amber-500' },
    { name: 'Camille (French)', lang: 'fr-FR', share: '6%', count: '38k chars', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue in INR */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{metrics.totalRevenueInr.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-500 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +24%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Razorpay UPI, Cards & Netbanking</p>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Est. Monthly MRR</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{metrics.mrrInr.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-blue-500">
              {metrics.activeSubscribersCount} Active Subs
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Creator & Pro subscription recurring</p>
        </div>

        {/* Total Platform Characters Synthesized */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chars Synthesized</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalCharsProcessed.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-purple-400">This Month</span>
          </div>
          <p className="text-[11px] text-slate-400">Across 25+ neural voice models</p>
        </div>

        {/* Active Registered Creators */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Users</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {users.length.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-400">100% Healthy</span>
          </div>
          <p className="text-[11px] text-slate-400">Google, GitHub, and Email creators</p>
        </div>

      </div>

      {/* Middle Grid: Voice Popularity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Voices Distribution (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary-500" />
              Voice Model Usage Breakdown
            </h4>
            <span className="text-[11px] text-slate-400">Ranked by volume</span>
          </div>

          <div className="space-y-4 pt-1">
            {topVoices.map((v, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{v.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{v.count}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{v.share}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${v.color} rounded-full`} style={{ width: v.share }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Server & TTS Infrastructure Health (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Infrastructure Status
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
              Operational
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400 font-sans">TTS Synthesis Engine:</span>
              <span className="text-emerald-400 font-bold">99.98% Uptime</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400 font-sans">Avg Synthesis Latency:</span>
              <span className="text-slate-800 dark:text-slate-200 font-bold">142 ms</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400 font-sans">Razorpay Gateway API:</span>
              <span className="text-emerald-400 font-bold">Connected</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400 font-sans">Developer REST Traffic:</span>
              <span className="text-indigo-400 font-bold">120 RPM limit</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Zero server bottleneck reported across global synthesis clusters.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
