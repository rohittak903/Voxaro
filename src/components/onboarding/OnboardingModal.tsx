import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { StorageService } from '../../services/storage';
import { FileText, Users, Download, ArrowRight, Check, X, Sparkles } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { showOnboardingModal, setShowOnboardingModal } = useUser();
  const [step, setStep] = useState(0);

  if (!showOnboardingModal) return null;

  const handleFinish = () => {
    StorageService.setOnboardingCompleted();
    setShowOnboardingModal(false);
  };

  const steps = [
    {
      title: '1. Type or Import Your Script',
      subtitle: 'Write anything or drag & drop .txt, .docx, and .pdf documents. Insert natural pauses with 1-click markers.',
      icon: <FileText className="w-10 h-10 text-primary-600" />,
      color: 'bg-primary-50 dark:bg-primary-950 text-primary-600',
    },
    {
      title: '2. Select from 25+ AI Voices',
      subtitle: 'Explore authentic voices across 15+ languages, accents, and emotional tones like Happy, Serious, Calm, or Excited.',
      icon: <Users className="w-10 h-10 text-indigo-600" />,
      color: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600',
    },
    {
      title: '3. Generate, Fine-Tune & Export',
      subtitle: 'Listen with the real-time interactive waveform visualizer, adjust pitch/speed, and download studio-ready MP3 or WAV files.',
      icon: <Download className="w-10 h-10 text-emerald-600" />,
      color: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600',
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative text-center">
        
        {/* Skip button */}
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          Skip
        </button>

        {/* Step Indicator Dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? 'w-8 bg-primary-600' : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 rounded-3xl ${current.color} flex items-center justify-center mx-auto mb-6 shadow-sm`}>
          {current.icon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {current.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          {current.subtitle}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Back
            </button>
          )}

          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              } else {
                handleFinish();
              }
            }}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <span>{step === steps.length - 1 ? 'Start Creating' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
