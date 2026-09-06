import React from 'react';
import { useUser } from '../../context/UserContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUser();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-500" />;
        let border = 'border-blue-500/30 bg-blue-50/90 dark:bg-blue-950/90 text-blue-900 dark:text-blue-200';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
          border = 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-500" />;
          border = 'border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
          border = 'border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/90 text-amber-900 dark:text-amber-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 ${border}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
