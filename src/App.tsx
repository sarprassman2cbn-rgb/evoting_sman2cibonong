import React, { useState, useEffect } from 'react';
import { VotingProvider, useVoting } from './context/VotingContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { BallotBooth } from './components/VoterPortal/BallotBooth.tsx';
import { CandidateShowcase } from './components/VoterPortal/CandidateShowcase.tsx';
import { LiveCountResults } from './components/Analytics/LiveCountResults.tsx';
import { VotingGuide } from './components/Guide/VotingGuide.tsx';
import { AdminPanel } from './components/AdminPanel/AdminPanel.tsx';
import { VoterLogin } from './components/VoterPortal/VoterLogin.tsx';
import { DemoSwitcher } from './components/DemoSwitcher.tsx';
import { Candidate } from './types/voting.ts';
import { ShieldCheck, Heart } from 'lucide-react';

function VotingApp() {
  const { currentVoter, settings, login } = useVoting();
  const [activeTab, setActiveTab] = useState<'vote' | 'candidates' | 'live-count' | 'guide' | 'admin'>('vote');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // If user is admin and clicks on admin, switch tabs
  useEffect(() => {
    if (currentVoter?.role === 'admin' && activeTab === 'vote') {
      // Optional: keep on vote or switch
    }
  }, [currentVoter]);

  // Handle URL params for QR Code instant login (e.g. ?nis=2425101&token=SMN101)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nisParam = params.get('nis');
    const tokenParam = params.get('token');

    if (nisParam && tokenParam && !currentVoter) {
      const res = login(nisParam, tokenParam);
      if (res.success) {
        setActiveTab('vote');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleSelectCandidateFromShowcase = (candidate: Candidate) => {
    setActiveTab('vote');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'vote' && (
          <BallotBooth onGoToLiveCount={() => setActiveTab('live-count')} />
        )}

        {activeTab === 'candidates' && (
          <CandidateShowcase
            onSelectCandidate={handleSelectCandidateFromShowcase}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'live-count' && (
          <LiveCountResults />
        )}

        {activeTab === 'guide' && (
          <VotingGuide />
        )}

        {activeTab === 'admin' && (
          <AdminPanel />
        )}
      </main>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <VoterLogin
          onSuccess={() => {
            setIsLoginModalOpen(false);
            setActiveTab('vote');
          }}
          onCancel={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* Demo Switcher for fast evaluation */}
      <DemoSwitcher />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {settings.school_name} · {settings.academic_year}
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Sistem E-Voting LUBER JURDIL (Langsung, Umum, Bebas, Rahasia, Jujur & Adil). Dilindungi Enkripsi Token.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <VotingProvider>
      <VotingApp />
    </VotingProvider>
  );
}
