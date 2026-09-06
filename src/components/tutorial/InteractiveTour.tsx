import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { TourStep } from '../../types';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Check, 
  Volume2, 
  Mic, 
  Sliders, 
  Layers, 
  Code2
} from 'lucide-react';

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-voices',
    title: '1. Select an AI Voice Model',
    content: 'Choose from 25+ human-like AI voices across 15+ languages and accents (English, Hindi, Spanish, etc.). Click any card to hear a live audio preview.',
    targetSelector: 'body',
    placement: 'bottom',
    badge: 'VOICE LIBRARY'
  },
  {
    id: 'step-editor',
    title: '2. Type or Paste Your Script',
    content: 'Enter your text or upload a .txt / .pdf document. You can insert natural pause markers like [pause:1s] anytime to control narration pacing.',
    targetSelector: 'body',
    placement: 'bottom',
    badge: 'SCRIPT EDITOR'
  },
  {
    id: 'step-controls',
    title: '3. Customize Emotion, Speed & Pitch',
    content: 'Fine-tune the emotional tone (Happy, Excited, Sad, Serious) and adjust playback rate from 0.5x to 2.0x for conversational storytelling.',
    targetSelector: 'body',
    placement: 'bottom',
    badge: 'AUDIO CONTROLS'
  },
  {
    id: 'step-player',
    title: '4. Waveform Player & Audio Export',
    content: 'Listen to your synthesized voice aloud with visual waveform synchronization. Scrub anytime on the canvas and download clean .WAV audio files.',
    targetSelector: 'body',
    placement: 'bottom',
    badge: 'WAVEFORM SCRUBBER'
  },
  {
    id: 'step-api',
    title: '5. Website Embed & Developer API',
    content: 'Integrate text-to-speech directly into your own website with 1 line of embed code or connect via our Developer REST API in Python and JS.',
    targetSelector: 'body',
    placement: 'bottom',
    badge: 'WEBSITE INTEGRATION'
  }
];

export const InteractiveTour: React.FC = () => {
  const { isTourActive, endTour, setCurrentView, showToast } = useUser();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isTourActive) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      endTour();
      showToast('Tour completed! You are ready to create audio.', 'success');
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (nextIndex === 4) {
        setCurrentView('api');
      } else {
        setCurrentView('editor');
      }
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setCurrentView('editor');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn pointer-events-auto">
      
      {/* Tooltip Card */}
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-primary-500/40 shadow-2xl p-6 sm:p-7 relative space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-primary-500/15 text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              {currentStep.badge}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={endTour}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500 shrink-0" />
            {currentStep.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={endTour}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-1.5 shadow-md shadow-primary-500/20 transition-all"
            >
              <span>{isLastStep ? 'Get Started' : 'Next Step'}</span>
              {isLastStep ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
