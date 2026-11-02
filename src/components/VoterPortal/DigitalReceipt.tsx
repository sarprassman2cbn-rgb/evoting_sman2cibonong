import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useVoting } from '../../context/VotingContext.tsx';
import { CheckCircle, Printer, LogOut, BarChart3, ShieldCheck } from 'lucide-react';

interface DigitalReceiptProps {
  onGoToLiveCount: () => void;
}

export const DigitalReceipt: React.FC<DigitalReceiptProps> = ({ onGoToLiveCount }) => {
  const { lastVotedReceipt, currentVoter, logout, clearLastReceipt, settings } = useVoting();

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }
  }, []);

  if (!lastVotedReceipt && (!currentVoter || !currentVoter.is_voted)) {
    return null;
  }

  const candidate = lastVotedReceipt?.candidate;
  const timestamp = lastVotedReceipt?.timestamp || currentVoter?.voted_at || new Date().toISOString();
  const verificationCode = lastVotedReceipt?.verificationCode || `SMANDA-VOTE-${currentVoter?.identitas?.slice(-4) || '8891'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleFinish = () => {
    clearLastReceipt();
    logout();
  };

  return (
    <div className="max-w-xl mx-auto my-6 p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
        <CheckCircle className="h-9 w-9" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
        Digital Ink Verification
      </span>

      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        Hak Suara Anda Sah Tercatat!
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
        Terima kasih atas partisipasi aktif Anda dalam Pemilihan Ketua & Wakil Ketua OSIS {settings.school_name}.
      </p>

      {/* Official Certificate Box */}
      <div className="relative my-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-left overflow-hidden">
        {/* Subtle watermark stamp */}
        <div className="absolute right-4 bottom-4 pointer-events-none opacity-15 dark:opacity-20 rotate-[-12deg] border-4 border-emerald-600 rounded-xl p-2 text-center text-emerald-700 font-extrabold text-sm uppercase">
          ★ SUARA SAH ★<br />KPU SMANDA
        </div>

        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Tanda Terima Suara Digital
            </h4>
            <span className="text-[11px] text-slate-500">Bukti Keikutsertaan E-Voting</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono-numbers text-slate-400 block">Kode Hash Verifikasi</span>
            <span className="text-xs font-mono-numbers font-bold text-blue-700 dark:text-blue-400">
              {verificationCode}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Identitas Pemilih:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {currentVoter ? currentVoter.nama : 'Pemilih Terdaftar'}
            </span>
            <span className="text-[11px] text-slate-500 block font-mono-numbers">
              {currentVoter?.role === 'siswa' ? `NIS: ${currentVoter.identitas}` : currentVoter?.role === 'guru' ? `NIP: ${currentVoter.identitas}` : ''}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 block">Waktu Pencoblosan:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono-numbers">
              {new Date(timestamp).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className="text-[11px] text-slate-500 block font-mono-numbers">
              Pukul {new Date(timestamp).toLocaleTimeString('id-ID')} WIB
            </span>
          </div>
        </div>

        {candidate && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <img 
              src={candidate.foto_url} 
              alt={candidate.nama_ketua} 
              className="w-12 h-12 rounded-lg object-cover ring-1 ring-slate-300"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Pilihan Terpilih:</span>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                Paslon No. 0{candidate.nomor_urut} — {candidate.nama_ketua} & {candidate.nama_wakil}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Status Akun: <strong>Terkunci Otomatis (Anti-Double Vote)</strong></span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 no-print">
        <button
          onClick={handlePrint}
          className="py-2 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Printer className="h-4 w-4" />
          <span>Cetak Bukti</span>
        </button>

        <button
          onClick={onGoToLiveCount}
          className="py-2 px-4 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Pantau Hasil Suara</span>
        </button>

        <button
          onClick={handleFinish}
          className="py-2 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="h-4 w-4" />
          <span>Selesai & Keluar</span>
        </button>
      </div>
    </div>
  );
};
