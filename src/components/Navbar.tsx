import React from 'react';
import { useVoting } from '../context/VotingContext.tsx';
import { ShieldCheck, LogOut, UserCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'vote' | 'candidates' | 'live-count' | 'guide' | 'admin';
  setActiveTab: (tab: 'vote' | 'candidates' | 'live-count' | 'guide' | 'admin') => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenLoginModal }) => {
  const { currentVoter, logout, settings } = useVoting();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single text element with icon) */}
        <button
          onClick={() => setActiveTab('vote')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-90 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          <img 
            src={settings.school_badge_url} 
            alt="Logo SMAN 2 Cibinong" 
            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%231E3A8A" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
            }}
          />
          <span className="font-extrabold text-blue-900 dark:text-blue-400">OSISVote</span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">SMAN 2 Cibinong</span>
        </button>

        {/* Zone 2: Clean 4–5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('vote')}
            className={`whitespace-nowrap transition-colors hover:text-blue-600 cursor-pointer ${
              activeTab === 'vote' ? 'text-blue-600 font-semibold dark:text-blue-400' : ''
            }`}
          >
            Bilik Suara
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`whitespace-nowrap transition-colors hover:text-blue-600 cursor-pointer ${
              activeTab === 'candidates' ? 'text-blue-600 font-semibold dark:text-blue-400' : ''
            }`}
          >
            Profil Paslon
          </button>
          <button
            onClick={() => setActiveTab('live-count')}
            className={`whitespace-nowrap transition-colors hover:text-blue-600 cursor-pointer ${
              activeTab === 'live-count' ? 'text-blue-600 font-semibold dark:text-blue-400' : ''
            }`}
          >
            Hasil Suara
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`whitespace-nowrap transition-colors hover:text-blue-600 cursor-pointer ${
              activeTab === 'guide' ? 'text-blue-600 font-semibold dark:text-blue-400' : ''
            }`}
          >
            Tata Cara
          </button>
          {currentVoter?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap transition-colors hover:text-blue-600 cursor-pointer ${
                activeTab === 'admin' ? 'text-blue-600 font-semibold dark:text-blue-400' : ''
              }`}
            >
              Panel KPU
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {currentVoter ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                  {currentVoter.nama}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">
                  {currentVoter.role === 'admin' ? 'Panitia KPU' : currentVoter.kelas_atau_jabatan}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                title="Keluar dari sesi"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <UserCircle className="h-4 w-4" />
              <span>Masuk Pemilih</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
