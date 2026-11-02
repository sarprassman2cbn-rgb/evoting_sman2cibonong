import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { AdminOverview } from './AdminOverview.tsx';
import { DptManager } from './DptManager.tsx';
import { CandidateManager } from './CandidateManager.tsx';
import { LiveCountResults } from '../Analytics/LiveCountResults.tsx';
import { KpuAdminManager } from './KpuAdminManager.tsx';
import { 
  Sliders, 
  Users, 
  Award, 
  BarChart3, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { currentVoter } = useVoting();
  const [adminTab, setAdminTab] = useState<'overview' | 'dpt' | 'candidates' | 'results' | 'admins'>('overview');

  if (currentVoter?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-600 mb-3">
          <Lock className="h-6 w-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Akses Terbatas Panitia KPU
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Halaman ini khusus untuk panitia pemilihan OSIS. Silakan login menggunakan akun administrator KPU.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 overflow-x-auto">
        <button
          onClick={() => setAdminTab('overview')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'overview'
              ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Kontrol Sesi & Audit</span>
        </button>

        <button
          onClick={() => setAdminTab('dpt')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'dpt'
              ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Manajemen DPT & Token</span>
        </button>

        <button
          onClick={() => setAdminTab('candidates')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'candidates'
              ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Kelola Paslon</span>
        </button>

        <button
          onClick={() => setAdminTab('results')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'results'
              ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Rekap Suara & Berita Acara</span>
        </button>

        <button
          onClick={() => setAdminTab('admins')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${
            adminTab === 'admins'
              ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Petugas & Admin KPU</span>
        </button>
      </div>

      {/* Render active sub-view */}
      <div>
        {adminTab === 'overview' && <AdminOverview />}
        {adminTab === 'dpt' && <DptManager />}
        {adminTab === 'candidates' && <CandidateManager />}
        {adminTab === 'results' && <LiveCountResults />}
        {adminTab === 'admins' && <KpuAdminManager />}
      </div>
    </div>
  );
};
