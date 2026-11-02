import React from 'react';
import { Candidate } from '../../types/voting.ts';
import { Check, ArrowLeft, ShieldAlert } from 'lucide-react';

interface VoteConfirmationModalProps {
  candidate: Candidate;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const VoteConfirmationModal: React.FC<VoteConfirmationModalProps> = ({
  candidate,
  isSubmitting,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center">
        {/* Warning Icon & Title */}
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-700 dark:text-blue-400 mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Konfirmasi Pilihan Suara
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pastikan pilihan Anda telah sesuai dengan hati nurani.
        </p>

        {/* Selected Candidate Preview */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 text-left">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={candidate.foto_url}
                alt={candidate.nama_ketua}
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-blue-600/30"
              />
              <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                {candidate.nomor_urut}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                Paslon No. 0{candidate.nomor_urut}
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {candidate.nama_ketua}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                & {candidate.nama_wakil}
              </p>
            </div>
          </div>
        </div>

        {/* Notice of Anonymity & Finality */}
        <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 text-left leading-relaxed">
          <strong>Penting:</strong> Sesuai asas <em>LUBER JURDIL</em>, pilihan Anda langsung masuk ke kotak suara digital secara anonim. Setelah dikonfirmasi, hak suara Anda terkunci dan <strong>tidak dapat diulang atau diubah</strong>.
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Periksa Lagi</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            <span>{isSubmitting ? 'Mencatat Suara...' : 'Ya, Coblos Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
