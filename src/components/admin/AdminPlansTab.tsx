import React, { useState, useEffect } from 'react';
import { AdminService, DEFAULT_PLAN_CONFIGS } from '../../services/adminService';
import { PlanType, PlanDetails } from '../../types';
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  Check, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sliders, 
  DollarSign, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const AdminPlansTab: React.FC = () => {
  const [plans, setPlans] = useState<Record<PlanType, PlanDetails>>(() => AdminService.getPlanConfigs());
  const [activePlanType, setActivePlanType] = useState<PlanType>('creator');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if external changes happen
  useEffect(() => {
    const handleUpdate = () => {
      setPlans(AdminService.getPlanConfigs());
    };
    window.addEventListener('voxaro_plans_updated', handleUpdate);
    return () => window.removeEventListener('voxaro_plans_updated', handleUpdate);
  }, []);

  const handleFieldChange = (field: keyof PlanDetails, value: any) => {
    setPlans(prev => ({
      ...prev,
      [activePlanType]: {
        ...prev[activePlanType],
        [field]: value
      }
    }));
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;

    const currentFeatures = plans[activePlanType].features || [];
    handleFieldChange('features', [...currentFeatures, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    const currentFeatures = plans[activePlanType].features || [];
    handleFieldChange('features', currentFeatures.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    AdminService.savePlanConfigs(plans);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all plan pricing and features to default factory values?')) {
      const reset = AdminService.resetPlanConfigs();
      setPlans(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const current = plans[activePlanType];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              PLAN ACCESS & PRICING CMS
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
              Real-time Global Sync
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Subscription Tier & Feature Governance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modify base Indian Rupee (₹) pricing, monthly character quotas, synthesis perks, and feature bullet points.
          </p>
        </div>

        {/* Global Save / Reset Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Changes Published!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Plan pricing and access rules have been successfully published across the entire platform in real time!</span>
        </div>
      )}

      {/* Plan Selection Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {(['free', 'creator', 'pro'] as PlanType[]).map((type) => {
          const p = plans[type];
          const isSelected = activePlanType === type;
          return (
            <button
              key={type}
              onClick={() => setActivePlanType(type)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-primary-500/10 border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400">{type}</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {p.price === 0 ? 'Free' : `₹${p.price.toLocaleString('en-IN')}`}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{p.name}</h4>
              <p className="text-[11px] text-slate-400">{p.monthlyLimit.toLocaleString()} chars/mo</p>
            </button>
          );
        })}
      </div>

      {/* Active Plan Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core Pricing & Quotas (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary-500" />
              Core Parameters: {current.name}
            </h4>
            <span className="text-[11px] text-slate-400">Base Currency: INR (₹)</span>
          </div>

          <div className="space-y-4">
            
            {/* Plan Display Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Plan Display Name
              </label>
              <input
                type="text"
                value={current.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* INR Base Price & Monthly Quota */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Monthly Price in INR (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={current.price}
                    onChange={(e) => handleFieldChange('price', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {current.price === 0 ? 'Free tier (₹0)' : `≈ $${Math.round(current.price / 86.8)} USD / €${Math.round(current.price / 94.2)} EUR`}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Monthly Character Limit
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={current.monthlyLimit}
                  onChange={(e) => handleFieldChange('monthlyLimit', Math.max(1000, parseInt(e.target.value) || 1000))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Monthly renewal allocation</span>
              </div>
            </div>

            {/* Single Generation Max Characters */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Max Characters Per Single Generation
              </label>
              <input
                type="number"
                min="500"
                step="500"
                value={current.maxCharactersPerGen}
                onChange={(e) => handleFieldChange('maxCharactersPerGen', Math.max(500, parseInt(e.target.value) || 500))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Maximum allowed in editor for a single TTS synthesis job</span>
            </div>

            {/* Feature Access Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Access & Capabilities</span>

              {/* Lossless WAV Export */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Lossless WAV Export</span>
                  <span className="text-[10px] text-slate-400">Allows users to download uncompressed 44.1/48kHz WAV audio</span>
                </div>
                <input
                  type="checkbox"
                  checked={current.wavExport}
                  onChange={(e) => handleFieldChange('wavExport', e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </div>

              {/* Priority Dedicated Queue */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Priority Processing Queue</span>
                  <span className="text-[10px] text-slate-400">Bypasses standard queues for zero-latency neural speech rendering</span>
                </div>
                <input
                  type="checkbox"
                  checked={current.priorityQueue}
                  onChange={(e) => handleFieldChange('priorityQueue', e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </div>

              {/* All Premium Voices Access */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Full Premium Voice Access</span>
                  <span className="text-[10px] text-slate-400">Unlocks all 25+ Ultra HD Neural voice models</span>
                </div>
                <input
                  type="checkbox"
                  checked={current.allVoices}
                  onChange={(e) => handleFieldChange('allVoices', e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Feature Bullets Editor (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Feature Bullet Points
            </h4>
            <span className="text-[11px] text-slate-400">{current.features.length} Items</span>
          </div>

          {/* Add Bullet Form */}
          <form onSubmit={handleAddFeature} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 24/7 Dedicated Support..."
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={!newFeatureText.trim()}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Bullets List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {current.features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs group"
              >
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 break-words">{feature}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-80 group-hover:opacity-100"
                  title="Remove bullet point"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>These bullets will appear directly on the Pricing modal and checkout pages.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
