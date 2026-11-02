import React, { useState } from 'react';
import { useVoting } from '../context/VotingContext.tsx';
import { Sparkles, ChevronUp, ChevronDown, User, Shield, Moon, Sun, CheckCircle } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { currentVoter, voters, quickSwitchUser, logout } = useVoting();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const adminUsers = voters.filter(v => v.role === 'admin');
  const freshStudent = voters.find(v => v.role === 'siswa' && !v.is_voted);
  const votedStudent = voters.find(v => v.role === 'siswa' && v.is_voted);
  const freshTeacher = voters.find(v => v.role === 'guru' && !v.is_voted);

  return (
    <div className="fixed bottom-4 right-4 z-40 no-print font-sans">
      <div className="relative">
        {/* Expanded Panel */}
        {isOpen && (
          <div className="absolute bottom-12 right-0 w-80 max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-2 duration-150 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-700 dark:text-blue-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Quick Test Switcher</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
              >
                {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-600" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-tight">
              Beralih peran secara instan untuk menguji alur sistem e-voting:
            </p>

            <div className="space-y-1.5 text-xs">
              {/* List all Admin KPU */}
              {adminUsers.map((admin) => (
                <button
                  key={admin.id}
                  onClick={() => { quickSwitchUser(admin.id); setIsOpen(false); }}
                  className={`w-full p-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    currentVoter?.id === admin.id
                      ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 font-bold border border-blue-200 dark:border-blue-900'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Shield className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold truncate">{admin.nama}</div>
                      <div className="text-[10px] text-slate-400">Admin ({admin.identitas})</div>
                    </div>
                  </div>
                  {currentVoter?.id === admin.id && <CheckCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                </button>
              ))}

              {/* Siswa Belum Memilih */}
              {freshStudent && (
                <button
                  onClick={() => { quickSwitchUser(freshStudent.id); setIsOpen(false); }}
                  className={`w-full p-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    currentVoter?.id === freshStudent.id
                      ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-900'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-emerald-600" />
                    <div>
                      <div className="font-semibold truncate max-w-[150px]">{freshStudent.nama}</div>
                      <div className="text-[10px] text-slate-400">Siswa (Hak Suara Aktif)</div>
                    </div>
                  </div>
                  {currentVoter?.id === freshStudent.id && <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                </button>
              )}

              {/* Guru Belum Memilih */}
              {freshTeacher && (
                <button
                  onClick={() => { quickSwitchUser(freshTeacher.id); setIsOpen(false); }}
                  className={`w-full p-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    currentVoter?.id === freshTeacher.id
                      ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-900'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-emerald-600" />
                    <div>
                      <div className="font-semibold truncate max-w-[150px]">{freshTeacher.nama}</div>
                      <div className="text-[10px] text-slate-400">Guru (Hak Suara Aktif)</div>
                    </div>
                  </div>
                  {currentVoter?.id === freshTeacher.id && <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                </button>
              )}

              {/* Siswa Sudah Memilih */}
              {votedStudent && (
                <button
                  onClick={() => { quickSwitchUser(votedStudent.id); setIsOpen(false); }}
                  className={`w-full p-2 text-left rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    currentVoter?.id === votedStudent.id
                      ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 font-bold border border-amber-200 dark:border-amber-900'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-amber-600" />
                    <div>
                      <div className="font-semibold truncate max-w-[150px]">{votedStudent.nama}</div>
                      <div className="text-[10px] text-slate-400">Siswa (Sudah Memilih)</div>
                    </div>
                  </div>
                  {currentVoter?.id === votedStudent.id && <CheckCircle className="h-3.5 w-3.5 text-amber-600" />}
                </button>
              )}

              {/* Logout / Tamu */}
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1 cursor-pointer font-medium"
              >
                Logout ke Mode Tamu Publik
              </button>
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 py-2 px-3.5 bg-slate-900 hover:bg-black text-white dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full shadow-lg transition-all cursor-pointer text-xs font-bold"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Demo Role: {currentVoter ? (currentVoter.role === 'admin' ? 'Admin KPU' : currentVoter.nama.split(' ')[0]) : 'Tamu'}</span>
          {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
};
