import React from 'react';
import { AwardsCenter } from './AwardsCenter';
import { X, Trophy } from 'lucide-react';

interface AwardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AwardsModal: React.FC<AwardsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-20"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <AwardsCenter isModal={true} onClose={onClose} />
      </div>
    </div>
  );
};
