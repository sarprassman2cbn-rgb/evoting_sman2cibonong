import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext.tsx';
import { Candidate } from '../../types/voting.ts';
import { VoteConfirmationModal } from './VoteConfirmationModal.tsx';
import { DigitalReceipt } from './DigitalReceipt.tsx';
import { VoterLogin } from './VoterLogin.tsx';
import { ShieldCheck, CheckCircle2, Lock, Vote, AlertTriangle, UserCheck } from 'lucide-react';

interface BallotBoothProps {
  onGoToLiveCount: () => void;
}

export const BallotBooth: React.FC<BallotBoothProps> = ({ onGoToLiveCount }) => {
  const { 
    currentVoter, 
    candidates, 
    settings, 
    castVote, 
    lastVotedReceipt 
  } = useVoting();

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. If user already voted or has a receipt, show Digital Receipt
  if (lastVotedReceipt || (currentVoter && currentVoter.is_voted)) {
    return <DigitalReceipt onGoToLiveCount={onGoToLiveCount} />;
  }

  // 2. If voting is CLOSED
  if (!settings.status_pemilu) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Sesi Pemilihan Sedang Ditutup
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
          Panitia KPU {settings.school_name} sedang mengunci bilik suara elektronik. Silakan pantau rekapitulasi perolehan suara atau tunggu pengumuman resmi.
        </p>
        <button
          onClick={onGoToLiveCount}
          className="mt-6 py-2.5 px-6 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          <span>Lihat Hasil Rekapitulasi Suara</span>
        </button>
      </div>
    );
  }

  // 3. If user is NOT LOGGED IN, present VoterLogin
  if (!currentVoter) {
    return (
      <div className="py-6">
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Sistem Otentikasi Ganda LUBER JURDIL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Bilik Suara Elektronik (E-Voting)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Silakan masukkan NIS/NIP dan Token Rahasia 6 digit yang tertera pada Kartu Pemilih Anda untuk membuka surat suara.
          </p>
        </div>

        <VoterLogin inline />
      </div>
    );
  }

  // 4. User is logged in and ready to vote!
  const handleVoteConfirmation = async () => {
    if (!selectedCandidate) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await castVote(selectedCandidate.id);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Terjadi kendala saat mengirimkan suara. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
      setSelectedCandidate(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      {/* Voter Profile Banner */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">
                Pemilih Terverifikasi
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Hak Suara Aktif
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentVoter.nama}
            </h2>
            <p className="text-xs text-slate-500 font-mono-numbers">
              {currentVoter.role === 'siswa' ? `NIS: ${currentVoter.identitas}` : `NIP: ${currentVoter.identitas}`} · {currentVoter.kelas_atau_jabatan}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-500">
          <span className="block font-medium">Bilik Suara No. 01</span>
          <span className="text-[11px] text-slate-400">Pencoblosan Langsung & Rahasia</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Official Ballot Title */}
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase">
          Surat Suara Elektronik
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sentuh / klik tombol <strong>&ldquo;Coblos Paslon&rdquo;</strong> pada kotak calon pilihan Anda.
        </p>
      </div>

      {/* Realistic Ballot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {candidates.map((cand) => (
          <div
            key={cand.id}
            className="group relative flex flex-col bg-white dark:bg-slate-900 border-2 border-slate-300 hover:border-blue-600 dark:border-slate-800 dark:hover:border-blue-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
          >
            {/* Top Ballot Header Number */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-3 text-center border-b border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Nomor Urut
              </span>
              <span className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 font-mono-numbers">
                0{cand.nomor_urut}
              </span>
            </div>

            {/* Candidate Photo */}
            <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={cand.foto_url}
                alt={cand.nama_ketua}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            </div>

            {/* Names & Visi */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {cand.nama_ketua}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  & {cand.nama_wakil}
                </p>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/70">
                  &ldquo;{cand.visi}&rdquo;
                </p>
              </div>

              {/* Coblos Button (Punch Effect) */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(cand)}
                  className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:ring-4 group-hover:ring-blue-600/20"
                >
                  <Vote className="h-4 w-4" />
                  <span>Coblos Paslon 0{cand.nomor_urut}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {selectedCandidate && (
        <VoteConfirmationModal
          candidate={selectedCandidate}
          isSubmitting={isSubmitting}
          onConfirm={handleVoteConfirmation}
          onCancel={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
};
