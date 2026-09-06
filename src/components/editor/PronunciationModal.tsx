import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { PronunciationRule } from '../../types';
import { BookA, Plus, Trash2, Check, X, Sparkles } from 'lucide-react';

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PronunciationModal: React.FC<PronunciationModalProps> = ({ isOpen, onClose }) => {
  const { user, updatePronunciations } = useUser();
  const [rules, setRules] = useState<PronunciationRule[]>(user.customPronunciations);
  const [newOriginal, setNewOriginal] = useState('');
  const [newReplacement, setNewReplacement] = useState('');

  if (!isOpen) return null;

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOriginal.trim() || !newReplacement.trim()) return;

    const newRule: PronunciationRule = {
      id: 'rule-' + Date.now(),
      original: newOriginal.trim(),
      replacement: newReplacement.trim(),
      caseSensitive: false,
      enabled: true,
    };

    const updated = [...rules, newRule];
    setRules(updated);
    updatePronunciations(updated);
    setNewOriginal('');
    setNewReplacement('');
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setRules(updated);
    updatePronunciations(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    updatePronunciations(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <BookA className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Custom Pronunciation Dictionary</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Override how acronyms, names, and specific words sound</p>
          </div>
        </div>

        {/* Add New Rule Form */}
        <form onSubmit={handleAddRule} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Add New Word Override</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Original Word / Acronym</label>
              <input
                type="text"
                placeholder="e.g. LLM or Kubernetes"
                value={newOriginal}
                onChange={(e) => setNewOriginal(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-300 block mb-1">Phonetic Spoken Output</label>
              <input
                type="text"
                placeholder="e.g. L.L.M. or Koo-ber-net-ees"
                value={newReplacement}
                onChange={(e) => setNewReplacement(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newOriginal.trim() || !newReplacement.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>
        </form>

        {/* Existing Rules List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Active Pronunciation Rules ({rules.length})
          </p>

          {rules.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">No custom pronunciation rules defined yet.</p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => handleToggleRule(rule.id)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {rule.original}
                    </span>
                    <span className="text-xs text-slate-400 mx-2">→</span>
                    <span className="text-xs text-primary-600 dark:text-primary-400 font-mono font-medium">
                      "{rule.replacement}"
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
