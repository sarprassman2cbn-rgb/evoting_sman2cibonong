import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { KeyRound, User, AlertCircle, Sparkles, CheckCircle2, QrCode } from 'lucide-react';

interface VoterLoginProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  inline?: boolean;
}

export const VoterLogin: React.FC<VoterLoginProps> = ({ onSuccess, onCancel, inline = false }) => {
  const { login, settings, voters } = useVoting();
  const [roleMode, setRoleMode] = useState<'siswa' | 'guru' | 'admin'>('siswa');
  const [identitas, setIdentitas] = useState('');
  const [token, setToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identitas.trim()) {
      setErrorMsg(
        roleMode === 'siswa' 
          ? 'Masukkan Nomor Induk Siswa (NIS)' 
          : roleMode === 'guru' 
          ? 'Masukkan NIP/NUPTK Guru' 
          : 'Masukkan ID Panitia'
      );
      return;
    }

    if (!token.trim()) {
      setErrorMsg('Masukkan 6 digit token rahasia kartu pemilih');
      return;
    }

    const res = login(identitas, token);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.message);
    }
  };

  // Helper to fill demo credentials
  const fillSample = (sampleId: string, sampleToken: string, sampleRole: 'siswa' | 'guru' | 'admin') => {
    setRoleMode(sampleRole);
    setIdentitas(sampleId);
    setToken(sampleToken);
    setErrorMsg('');
  };

  const sampleStudent = voters.find(v => v.role === 'siswa' && !v.is_voted) || voters[1];
  const sampleTeacher = voters.find(v => v.role === 'guru' && !v.is_voted) || voters[5];
  const sampleAdmin = voters.find(v => v.role === 'admin') || voters[0];

  const content = (
    <div className="w-full">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Portal Pemilih OSISVote
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {settings.school_name} — {settings.academic_year}
        </p>
      </div>

      {/* Role Tabs */}
      <div className="flex rounded-lg bg-slate-100 p-1 mb-5 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => { setRoleMode('siswa'); setErrorMsg(''); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            roleMode === 'siswa' 
              ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white' 
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Siswa (NIS)
        </button>
        <button
          type="button"
          onClick={() => { setRoleMode('guru'); setErrorMsg(''); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            roleMode === 'guru' 
              ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white' 
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Guru (NIP)
        </button>
        <button
          type="button"
          onClick={() => { setRoleMode('admin'); setErrorMsg(''); }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            roleMode === 'admin' 
              ? 'bg-white text-blue-900 shadow-sm dark:bg-slate-700 dark:text-white' 
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Panitia KPU
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {roleMode === 'siswa' ? 'Nomor Induk Siswa (NIS)' : roleMode === 'guru' ? 'NIP / NUPTK Guru' : 'Username Panitia'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={identitas}
              onChange={(e) => setIdentitas(e.target.value)}
              placeholder={roleMode === 'siswa' ? 'Contoh: 2425101' : roleMode === 'guru' ? 'Contoh: 197508122005011003' : 'admin_kpu'}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono-numbers"
              autoFocus
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Token Rahasia (PIN 6 Karakter)
            </label>
            <span className="text-[11px] text-slate-400">Tertera di Kartu Pemilih</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type="text"
              maxLength={8}
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="Contoh: SMN101"
              className="w-full pl-9 pr-3 py-2 text-sm tracking-wider uppercase font-mono-numbers font-bold bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Buka Bilik Suara</span>
        </button>

        {/* QR Scan simulator */}
        <button
          type="button"
          onClick={() => {
            setIsScanning(true);
            setTimeout(() => {
              setIsScanning(false);
              if (sampleStudent) {
                fillSample(sampleStudent.identitas, sampleStudent.token, 'siswa');
              }
            }, 600);
          }}
          className="w-full py-2 px-3 text-xs font-semibold text-slate-600 border border-dashed border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <QrCode className="h-4 w-4 text-blue-600" />
          <span>{isScanning ? 'Membaca Kartu Pemilih...' : 'Scan Kartu Suara (Simulasi QR)'}</span>
        </button>
      </form>

      {/* Quick Test Demo Shortcuts */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Shortcut Akun Uji Coba:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {sampleStudent && (
            <button
              type="button"
              onClick={() => fillSample(sampleStudent.identitas, sampleStudent.token, 'siswa')}
              className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-md transition-colors dark:bg-slate-800/60 dark:border-slate-700 cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Siswa (Baru)</div>
              <div className="text-[10px] text-slate-500 font-mono-numbers">{sampleStudent.identitas}</div>
            </button>
          )}

          {sampleTeacher && (
            <button
              type="button"
              onClick={() => fillSample(sampleTeacher.identitas, sampleTeacher.token, 'guru')}
              className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-md transition-colors dark:bg-slate-800/60 dark:border-slate-700 cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Guru (Baru)</div>
              <div className="text-[10px] text-slate-500 font-mono-numbers truncate">NIP: {sampleTeacher.identitas.slice(0, 6)}...</div>
            </button>
          )}

          {sampleAdmin && (
            <button
              type="button"
              onClick={() => fillSample(sampleAdmin.identitas, sampleAdmin.token, 'admin')}
              className="p-2 text-left bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-md transition-colors dark:bg-slate-800/60 dark:border-slate-700 cursor-pointer"
            >
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Admin KPU</div>
              <div className="text-[10px] text-slate-500 font-mono-numbers">admin_kpu</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold p-1 cursor-pointer"
          >
            ✕
          </button>
        )}
        {content}
      </div>
    </div>
  );
};
