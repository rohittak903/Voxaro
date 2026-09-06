import React from 'react';
import { useUser } from '../../context/UserContext';
import { LATEST_RELEASE } from '../../data/notifications';
import { 
  X, 
  Sparkles, 
  Code2, 
  CreditCard, 
  Languages, 
  Sliders, 
  ArrowRight,
  Zap,
  CheckCircle
} from 'lucide-react';

export const WhatsNewModal: React.FC = () => {
  const { showWhatsNewModal, setShowWhatsNewModal, setCurrentView } = useUser();

  if (!showWhatsNewModal) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5 text-indigo-400" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'Languages':
        return <Languages className="w-5 h-5 text-purple-400" />;
      default:
        return <Sliders className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        
        {/* Banner */}
        <div className={`p-6 bg-gradient-to-tr ${LATEST_RELEASE.gradient} text-white relative`}>
          <button
            onClick={() => setShowWhatsNewModal(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider">
              {LATEST_RELEASE.tag}
            </span>
            <span className="text-xs text-white/80 font-mono font-bold">
              {LATEST_RELEASE.version}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            {LATEST_RELEASE.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            {LATEST_RELEASE.subtitle}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {LATEST_RELEASE.features.map((f, i) => (
              <div 
                key={i} 
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5 hover:border-primary-500/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {getIcon(f.icon)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.description}
                  </p>

                  {f.actionLabel && f.actionView && (
                    <button
                      onClick={() => {
                        setCurrentView(f.actionView!);
                        setShowWhatsNewModal(false);
                      }}
                      className="text-xs font-bold text-primary-500 hover:underline pt-1 flex items-center gap-1"
                    >
                      <span>Try {f.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowWhatsNewModal(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-500/20 transition-all"
            >
              Explore Studio
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
