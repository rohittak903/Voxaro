import React, { useState } from 'react';
import { AdminService } from '../../services/adminService';
import { AdminUserItem, PlanType } from '../../types';
import { useUser } from '../../context/UserContext';
import { 
  Users, 
  Search, 
  Crown, 
  ShieldAlert, 
  Check, 
  Plus, 
  Ban, 
  Sparkles,
  Zap,
  Trash2
} from 'lucide-react';

export const AdminUsersTab: React.FC = () => {
  const { showToast } = useUser();
  const [users, setUsers] = useState<AdminUserItem[]>(() => AdminService.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | PlanType>('all');

  // Modal for adding quota
  const [quotaModalUser, setQuotaModalUser] = useState<AdminUserItem | null>(null);
  const [bonusCreditsInput, setBonusCreditsInput] = useState('50000');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handlePlanChange = (userId: string, newPlan: PlanType) => {
    const updated = AdminService.updateUserPlan(userId, newPlan);
    setUsers(updated);
    showToast(`Updated user plan to ${newPlan.toUpperCase()}`, 'success');
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const updated = AdminService.toggleUserStatus(userId);
    setUsers(updated);
    showToast(currentStatus === 'active' ? 'Account suspended' : 'Account re-activated', 'info');
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to remove user "${userName}" from the registry?`)) {
      const updated = AdminService.deleteUser(userId);
      setUsers(updated);
      showToast(`User ${userName} removed`, 'info');
    }
  };

  const handleAddBonusCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotaModalUser) return;
    const credits = parseInt(bonusCreditsInput, 10) || 0;
    if (credits <= 0) return;

    const updated = AdminService.updateUserQuota(quotaModalUser.id, credits);
    setUsers(updated);
    showToast(`Added ${credits.toLocaleString()} bonus characters to ${quotaModalUser.name}`, 'success');
    setQuotaModalUser(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Plan Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-center overflow-x-auto w-full sm:w-auto">
          {(['all', 'free', 'creator', 'pro'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                planFilter === p
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Usage / Quota</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const percent = Math.min(100, Math.round((u.charactersUsedThisMonth / u.monthlyLimit) * 100));

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 font-bold flex items-center justify-center text-xs">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                              {u.role === 'super_admin' && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-500/20 text-purple-400">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 text-[11px]">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Plan Dropdown Modifier */}
                      <td className="py-4 px-4">
                        <select
                          value={u.plan}
                          onChange={(e) => handlePlanChange(u.id, e.target.value as PlanType)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold uppercase border focus:outline-none ${
                            u.plan === 'pro'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : u.plan === 'creator'
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                          }`}
                        >
                          <option value="free">Free Tier</option>
                          <option value="creator">Creator Studio</option>
                          <option value="pro">Pro Enterprise</option>
                        </select>
                      </td>

                      {/* Usage / Monthly Quota */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{u.charactersUsedThisMonth.toLocaleString()}</span>
                            <span className="text-slate-400">/ {u.monthlyLimit.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${percent > 85 ? 'bg-rose-500' : 'bg-primary-500'}`} style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active' 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-slate-400 text-[11px]">
                        {new Date(u.joinedAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setQuotaModalUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Add Bonus Character Credits"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.status === 'active'
                                ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10'
                                : 'text-emerald-500 hover:bg-emerald-500/10'
                            }`}
                            title={u.status === 'active' ? 'Suspend Account' : 'Re-activate Account'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>

                          {u.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Delete User from Registry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bonus Credits Modal */}
      {quotaModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Add Bonus Quota Credits
            </h4>
            <p className="text-xs text-slate-500">
              Grant additional character synthesis quota to <strong>{quotaModalUser.name}</strong>.
            </p>

            <form onSubmit={handleAddBonusCredits} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Characters to Add</label>
                <input
                  type="number"
                  step="5000"
                  value={bonusCreditsInput}
                  onChange={(e) => setBonusCreditsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuotaModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white"
                >
                  Grant Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
