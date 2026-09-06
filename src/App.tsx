import React, { useState } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { AudioProvider } from './context/AudioContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { TextEditor } from './components/editor/TextEditor';
import { VoiceLibrary } from './components/voices/VoiceLibrary';
import { HistoryList } from './components/history/HistoryList';
import { ApiPortal } from './components/api/ApiPortal';
import { PricingModal } from './components/pricing/PricingModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { AuthModal } from './components/auth/AuthModal';
import { RazorpayCheckoutModal } from './components/payment/RazorpayCheckoutModal';
import { InteractiveTour } from './components/tutorial/InteractiveTour';
import { WhatsNewModal } from './components/notifications/WhatsNewModal';
import { ToastContainer } from './components/common/Toast';

const MainAppContent: React.FC = () => {
  const { currentView } = useUser();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar onOpenSettings={() => setShowSettingsModal(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Desktop Sidebar */}
        <Sidebar onOpenSettings={() => setShowSettingsModal(true)} />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {currentView === 'editor' && <TextEditor />}
          {currentView === 'library' && <VoiceLibrary />}
          {currentView === 'history' && <HistoryList />}
          {currentView === 'api' && <ApiPortal />}
          {currentView === 'pricing' && <PricingModal isStandalone={true} />}
        </main>

      </div>

      {/* Mobile Bottom Tab Navigation */}
      <MobileNav onOpenSettings={() => setShowSettingsModal(true)} />

      {/* Global Modals, Systems & Notifications */}
      <ToastContainer />
      <OnboardingModal />
      <InteractiveTour />
      <AuthModal />
      <RazorpayCheckoutModal />
      <WhatsNewModal />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      <PricingModal isStandalone={false} />

    </div>
  );
};

export function App() {
  return (
    <UserProvider>
      <AudioProvider>
        <MainAppContent />
      </AudioProvider>
    </UserProvider>
  );
}

export default App;
